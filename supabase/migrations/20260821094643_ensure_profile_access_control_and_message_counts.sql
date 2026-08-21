-- Ensure progressive-disclosure tables/columns exist (idempotent).
-- Earlier environments may have applied only part of 202604181430.

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS messages_exchanged_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS messages_exchanged_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.matches.messages_exchanged_count IS 'Count of alternating sender messages for this match (when chat.match_id is set).';
COMMENT ON COLUMN public.chats.messages_exchanged_count IS 'Alternating user-message count for this chat (individual chats).';

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
