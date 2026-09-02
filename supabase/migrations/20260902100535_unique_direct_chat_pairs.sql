-- Prevent duplicate 1:1 chats for the same pair of users.
-- Concurrent match-confirm + get-or-create paths were inserting two rooms
-- for one pair, which showed the same person twice under New Matches.

CREATE SCHEMA IF NOT EXISTS private;

ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS pair_key text;

COMMENT ON COLUMN public.chats.pair_key IS
  'Canonical sorted user-id pair for 1:1 chats (uuid:uuid). NULL for group chats and incomplete rooms.';

CREATE OR REPLACE FUNCTION private.direct_chat_pair_key(p_user_a uuid, p_user_b uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path TO 'pg_catalog'
AS $$
  SELECT CASE
    WHEN p_user_a < p_user_b THEN p_user_a::text || ':' || p_user_b::text
    ELSE p_user_b::text || ':' || p_user_a::text
  END;
$$;

REVOKE ALL ON FUNCTION private.direct_chat_pair_key(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Merge duplicate 1:1 rooms before enforcing uniqueness.
DO $merge$
DECLARE
  welcome_text text := $w$You're matched! Start your conversation 👋$w$;
BEGIN
  CREATE TEMP TABLE duplicate_direct_chats ON COMMIT DROP AS
  WITH pair_chats AS (
    SELECT
      c.id AS chat_id,
      c.created_at,
      (
        SELECT array_agg(cm.user_id ORDER BY cm.user_id)
        FROM public.chat_members cm
        WHERE cm.chat_id = c.id
      ) AS member_ids,
      (
        SELECT count(*)
        FROM public.messages m
        WHERE m.chat_id = c.id
          AND m.content IS DISTINCT FROM welcome_text
      ) AS real_message_count,
      (
        SELECT count(*)
        FROM public.messages m
        WHERE m.chat_id = c.id
      ) AS message_count
    FROM public.chats c
    WHERE c.is_group = false
      AND (
        SELECT count(*) FROM public.chat_members cm WHERE cm.chat_id = c.id
      ) = 2
  ),
  ranked AS (
    SELECT
      chat_id,
      member_ids,
      row_number() OVER (
        PARTITION BY member_ids
        ORDER BY real_message_count DESC, message_count DESC, created_at ASC, chat_id ASC
      ) AS rn,
      first_value(chat_id) OVER (
        PARTITION BY member_ids
        ORDER BY real_message_count DESC, message_count DESC, created_at ASC, chat_id ASC
      ) AS keep_id
    FROM pair_chats
    WHERE array_length(member_ids, 1) = 2
  )
  SELECT chat_id AS drop_id, keep_id
  FROM ranked
  WHERE rn > 1;

  IF to_regclass('public.notifications') IS NOT NULL THEN
    UPDATE public.notifications n
    SET metadata = jsonb_set(n.metadata, '{chat_id}', to_jsonb(d.keep_id::text), true)
    FROM duplicate_direct_chats d
    WHERE n.metadata ? 'chat_id'
      AND n.metadata->>'chat_id' = d.drop_id::text;
  END IF;

  UPDATE public.messages m
  SET chat_id = d.keep_id
  FROM duplicate_direct_chats d
  WHERE m.chat_id = d.drop_id
    AND m.content IS DISTINCT FROM welcome_text;

  DELETE FROM public.chats c
  USING duplicate_direct_chats d
  WHERE c.id = d.drop_id;
END $merge$;

-- Backfill pair_key for remaining 1:1 chats with exactly two members.
UPDATE public.chats c
SET pair_key = private.direct_chat_pair_key(members.user_low, members.user_high)
FROM (
  SELECT
    a.chat_id,
    a.user_id AS user_low,
    b.user_id AS user_high
  FROM public.chat_members a
  JOIN public.chat_members b
    ON b.chat_id = a.chat_id
   AND a.user_id < b.user_id
  JOIN public.chats c2
    ON c2.id = a.chat_id
   AND c2.is_group = false
) members
WHERE c.id = members.chat_id
  AND c.is_group = false
  AND c.pair_key IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS chats_direct_pair_key_uidx
  ON public.chats (pair_key)
  WHERE is_group = false AND pair_key IS NOT NULL;

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
  LIMIT 1;

  IF v_chat_id IS NULL THEN
    SELECT c.id
      INTO v_chat_id
    FROM public.chats c
    JOIN public.chat_members a ON a.chat_id = c.id AND a.user_id = p_user_a
    JOIN public.chat_members b ON b.chat_id = c.id AND b.user_id = p_user_b
    WHERE c.is_group = false
    LIMIT 1;

    IF v_chat_id IS NOT NULL THEN
      UPDATE public.chats
      SET pair_key = v_key,
          match_id = COALESCE(match_id, p_match_id),
          updated_at = now()
      WHERE id = v_chat_id;
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
    WHERE id = v_chat_id;
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

CREATE OR REPLACE FUNCTION public.create_chat_for_match(
  p_match_id uuid,
  p_user_a uuid,
  p_user_b uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'extensions', 'private'
AS $create_chat$
DECLARE
  result jsonb;
BEGIN
  IF p_user_a = p_user_b THEN
    RAISE EXCEPTION 'Cannot create match with yourself';
  END IF;

  result := public.ensure_direct_chat(p_user_a, p_user_b, p_user_a, p_match_id, false);
  RETURN (result->>'chat_id')::uuid;
END;
$create_chat$;

GRANT EXECUTE ON FUNCTION public.create_chat_for_match(uuid, uuid, uuid) TO service_role;
REVOKE ALL ON FUNCTION public.create_chat_for_match(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Stamp pair_key when a 1:1 room gets its second member, so older insert
-- paths that omit pair_key still hit the unique index.
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
    WHERE c.id = NEW.chat_id AND c.is_group = false
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
      AND (pair_key IS NULL OR pair_key = new_key);
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'A direct chat already exists for this pair'
        USING ERRCODE = '23505';
  END;

  RETURN NEW;
END;
$trig$;

DROP TRIGGER IF EXISTS trg_assign_direct_chat_pair_key ON public.chat_members;
CREATE TRIGGER trg_assign_direct_chat_pair_key
  AFTER INSERT ON public.chat_members
  FOR EACH ROW
  EXECUTE FUNCTION private.assign_direct_chat_pair_key();
