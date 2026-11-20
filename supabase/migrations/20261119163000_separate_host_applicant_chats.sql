-- Keep host↔applicant housing chats separate from roommate 1:1 DMs.
-- Roommate rooms use pair_key uniqueness; housing rooms must not share that key
-- or reuse ensure_direct_chat, or Accept & chat merges student history into /host/messages.

-- 1) Never stamp pair_key on housing-application chats
CREATE OR REPLACE FUNCTION private.assign_direct_chat_pair_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $trig$
DECLARE
  other_user uuid;
  new_key text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = NEW.chat_id
      AND c.is_group = false
      AND c.housing_application_id IS NULL
  ) THEN
    RETURN NEW;
  END IF;

  SELECT cm.user_id INTO other_user
  FROM public.chat_members cm
  WHERE cm.chat_id = NEW.chat_id
    AND cm.user_id <> NEW.user_id
  LIMIT 1;

  IF other_user IS NULL THEN
    RETURN NEW;
  END IF;

  new_key := private.direct_chat_pair_key(NEW.user_id, other_user);

  BEGIN
    UPDATE public.chats
    SET pair_key = new_key
    WHERE id = NEW.chat_id
      AND is_group = false
      AND housing_application_id IS NULL
      AND (pair_key IS NULL OR pair_key = new_key);
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'A direct chat already exists for this pair'
        USING ERRCODE = '23505';
  END;

  RETURN NEW;
END;
$trig$;

-- 2) Roommate ensure_direct_chat must ignore housing rooms
CREATE OR REPLACE FUNCTION public.ensure_direct_chat(
  p_user_a uuid,
  p_user_b uuid,
  p_created_by uuid DEFAULT NULL,
  p_match_id uuid DEFAULT NULL,
  p_add_welcome boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'extensions', 'private'
AS $ensure$
DECLARE
  v_key text;
  v_chat_id uuid;
  v_created boolean := false;
  v_created_by uuid;
  v_welcome text := $w$You're matched! Start your conversation 👋$w$;
BEGIN
  IF p_user_a IS NULL OR p_user_b IS NULL OR p_user_a = p_user_b THEN
    RAISE EXCEPTION 'ensure_direct_chat requires two distinct users';
  END IF;

  v_key := private.direct_chat_pair_key(p_user_a, p_user_b);
  v_created_by := COALESCE(p_created_by, p_user_a);

  PERFORM pg_advisory_xact_lock(hashtext(v_key), hashtext(reverse(v_key)));

  SELECT c.id
    INTO v_chat_id
  FROM public.chats c
  WHERE c.is_group = false
    AND c.pair_key = v_key
    AND c.housing_application_id IS NULL
  LIMIT 1;

  IF v_chat_id IS NULL THEN
    SELECT c.id
      INTO v_chat_id
    FROM public.chats c
    JOIN public.chat_members a ON a.chat_id = c.id AND a.user_id = p_user_a
    JOIN public.chat_members b ON b.chat_id = c.id AND b.user_id = p_user_b
    WHERE c.is_group = false
      AND c.housing_application_id IS NULL
    LIMIT 1;

    IF v_chat_id IS NOT NULL THEN
      UPDATE public.chats
      SET pair_key = v_key,
          match_id = COALESCE(match_id, p_match_id),
          updated_at = now()
      WHERE id = v_chat_id
        AND housing_application_id IS NULL;
    END IF;
  END IF;

  IF v_chat_id IS NULL THEN
    BEGIN
      INSERT INTO public.chats (is_group, created_by, match_id, pair_key)
      VALUES (false, v_created_by, p_match_id, v_key)
      RETURNING id INTO v_chat_id;
      v_created := true;
    EXCEPTION
      WHEN unique_violation THEN
        SELECT c.id
          INTO v_chat_id
        FROM public.chats c
        WHERE c.is_group = false
          AND c.pair_key = v_key
          AND c.housing_application_id IS NULL
        LIMIT 1;

        IF v_chat_id IS NULL THEN
          RAISE;
        END IF;
        v_created := false;
    END;

    IF v_created THEN
      INSERT INTO public.chat_members (chat_id, user_id)
      VALUES (v_chat_id, p_user_a), (v_chat_id, p_user_b);
    END IF;
  ELSIF p_match_id IS NOT NULL THEN
    UPDATE public.chats
    SET match_id = COALESCE(match_id, p_match_id),
        updated_at = now()
    WHERE id = v_chat_id
      AND housing_application_id IS NULL;
  END IF;

  IF p_add_welcome AND v_chat_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.messages WHERE chat_id = v_chat_id LIMIT 1
    ) THEN
      INSERT INTO public.messages (chat_id, user_id, content)
      VALUES (v_chat_id, v_created_by, v_welcome);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'chat_id', v_chat_id,
    'created', v_created
  );
END;
$ensure$;

REVOKE ALL ON FUNCTION public.ensure_direct_chat(uuid, uuid, uuid, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_direct_chat(uuid, uuid, uuid, uuid, boolean) TO service_role;

-- 3) Split polluted host chats that reused roommate pair_key rooms
DO $split$
DECLARE
  r record;
  new_chat_id uuid;
  host_user_id uuid;
BEGIN
  FOR r IN
    SELECT
      ha.id AS application_id,
      ha.host_chat_id AS old_chat_id,
      ha.user_id AS applicant_user_id,
      ha.accepted_at,
      hp.user_id AS host_user_id,
      hl.title AS listing_title
    FROM public.housing_applications ha
    JOIN public.chats c ON c.id = ha.host_chat_id
    JOIN public.housing_listings hl ON hl.id = ha.listing_id
    JOIN public.host_profiles hp ON hp.id = hl.host_id
    WHERE ha.host_chat_id IS NOT NULL
      AND c.pair_key IS NOT NULL
  LOOP
    host_user_id := r.host_user_id;

    INSERT INTO public.chats (
      is_group,
      created_by,
      match_id,
      pair_key,
      housing_application_id
    )
    VALUES (
      false,
      host_user_id,
      NULL,
      NULL,
      r.application_id
    )
    RETURNING id INTO new_chat_id;

    INSERT INTO public.chat_members (chat_id, user_id)
    VALUES
      (new_chat_id, host_user_id),
      (new_chat_id, r.applicant_user_id)
    ON CONFLICT DO NOTHING;

    -- Move housing-era messages into the dedicated room when we know accept time
    IF r.accepted_at IS NOT NULL THEN
      UPDATE public.messages
      SET chat_id = new_chat_id
      WHERE chat_id = r.old_chat_id
        AND created_at >= r.accepted_at;
    END IF;

    -- Clear housing stamp from the roommate DM
    UPDATE public.chats
    SET housing_application_id = NULL,
        updated_at = now()
    WHERE id = r.old_chat_id;

    UPDATE public.housing_applications
    SET host_chat_id = new_chat_id,
        updated_at = now()
    WHERE id = r.application_id;

    -- Seed a housing welcome if the new room is empty
    IF NOT EXISTS (
      SELECT 1 FROM public.messages WHERE chat_id = new_chat_id LIMIT 1
    ) THEN
      INSERT INTO public.messages (chat_id, user_id, content)
      VALUES (
        new_chat_id,
        host_user_id,
        'You''re connected about ' || COALESCE(r.listing_title, 'this listing') || '. Discuss details here.'
      );
    END IF;
  END LOOP;
END;
$split$;
