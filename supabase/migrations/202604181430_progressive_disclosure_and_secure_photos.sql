-- Progressive disclosure: programmatic avatars, private profile photos, message-turn counter,
-- and per-chat access flags (mirrors match semantics via chats.match_id when present).

-- ---------------------------------------------------------------------------
-- profiles: programmatic avatar seed, private picture object path, default share flag
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_id TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS share_details_by_default BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.avatar_id IS 'DiceBear / programmatic avatar seed shown to matches until reveal.';
COMMENT ON COLUMN public.profiles.profile_picture_url IS 'Storage object path inside secure_profile_pics (not a public URL).';
COMMENT ON COLUMN public.profiles.share_details_by_default IS 'Reserved: auto-reveal details to new matches (default off).';

-- ---------------------------------------------------------------------------
-- matches + chats: message exchange counts (turn-taking)
-- ---------------------------------------------------------------------------
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS messages_exchanged_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS messages_exchanged_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.matches.messages_exchanged_count IS 'Count of alternating sender messages for this match (when chat.match_id is set).';
COMMENT ON COLUMN public.chats.messages_exchanged_count IS 'Alternating user-message count for this chat (individual chats).';

-- ---------------------------------------------------------------------------
-- profile_access_control: one row per (chat, requestor) — target is the other participant
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  requesting_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  details_revealed_by_requestor BOOLEAN NOT NULL DEFAULT FALSE,
  picture_revealed_by_requestor BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profile_access_control_unique_chat_requestor UNIQUE (chat_id, requesting_user_id),
  CONSTRAINT profile_access_control_distinct_users CHECK (requesting_user_id <> target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_access_control_chat ON public.profile_access_control(chat_id);
CREATE INDEX IF NOT EXISTS idx_profile_access_control_match ON public.profile_access_control(match_id);

ALTER TABLE public.profile_access_control ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_access_control_select_participant ON public.profile_access_control;
CREATE POLICY profile_access_control_select_participant
  ON public.profile_access_control
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = profile_access_control.chat_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS profile_access_control_insert_self ON public.profile_access_control;
CREATE POLICY profile_access_control_insert_self
  ON public.profile_access_control
  FOR INSERT
  WITH CHECK (
    requesting_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = profile_access_control.chat_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS profile_access_control_update_own_row ON public.profile_access_control;
CREATE POLICY profile_access_control_update_own_row
  ON public.profile_access_control
  FOR UPDATE
  USING (requesting_user_id = auth.uid())
  WITH CHECK (requesting_user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.profile_access_control TO authenticated;
GRANT ALL ON public.profile_access_control TO service_role;

-- ---------------------------------------------------------------------------
-- Turn-taking message counter (skips auto welcome message)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_chat_turn_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat RECORD;
  v_prev_sender UUID;
BEGIN
  IF NEW.content IS NOT DISTINCT FROM 'You''re matched! Start your conversation 👋' THEN
    RETURN NEW;
  END IF;

  SELECT id, is_group, match_id
  INTO v_chat
  FROM chats
  WHERE id = NEW.chat_id;

  IF NOT FOUND OR v_chat.is_group IS TRUE THEN
    RETURN NEW;
  END IF;

  SELECT m.user_id
  INTO v_prev_sender
  FROM messages m
  WHERE m.chat_id = NEW.chat_id
    AND m.id <> NEW.id
  ORDER BY m.created_at DESC, m.id DESC
  LIMIT 1;

  IF v_prev_sender IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_prev_sender = NEW.user_id THEN
    RETURN NEW;
  END IF;

  UPDATE chats
  SET
    messages_exchanged_count = COALESCE(messages_exchanged_count, 0) + 1,
    updated_at = NOW()
  WHERE id = NEW.chat_id;

  IF v_chat.match_id IS NOT NULL THEN
    UPDATE matches
    SET
      messages_exchanged_count = COALESCE(messages_exchanged_count, 0) + 1,
      updated_at = NOW()
    WHERE id = v_chat.match_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_chat_turn_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_chat_turn_messages() TO service_role;

DROP TRIGGER IF EXISTS trg_messages_increment_turn_count ON public.messages;
CREATE TRIGGER trg_messages_increment_turn_count
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_chat_turn_messages();

-- ---------------------------------------------------------------------------
-- Private storage bucket for profile photos
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secure_profile_pics',
  'secure_profile_pics',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS secure_profile_pics_insert_own ON storage.objects;
CREATE POLICY secure_profile_pics_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS secure_profile_pics_update_own ON storage.objects;
CREATE POLICY secure_profile_pics_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS secure_profile_pics_delete_own ON storage.objects;
CREATE POLICY secure_profile_pics_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read only their own objects from storage; cross-user access is via signed URLs (service role).
DROP POLICY IF EXISTS secure_profile_pics_select_own ON storage.objects;
CREATE POLICY secure_profile_pics_select_own
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
