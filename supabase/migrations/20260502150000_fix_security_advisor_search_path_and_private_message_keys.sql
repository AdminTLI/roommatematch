-- Security advisor fixes (after 20260502140000 so partition helper keeps RLS + search_path):
-- 0011_function_search_path_mutable: pin search_path on procedure + match trigger.
-- 0028/0029: move message key SECURITY DEFINER triggers to `private` (not in PostgREST api.schemas).

-- ---------------------------------------------------------------------------
-- 1) Monthly partition cron procedure (lint 0011; function body defined in 20260502140000)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE private.ensure_monthly_partitions()
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  PERFORM private.create_monthly_partitions('public.messages'::regclass, now()::date, 6);
  PERFORM private.create_monthly_partitions('public.app_events'::regclass, now()::date, 6);
END;
$$;

-- ---------------------------------------------------------------------------
-- 2) Match suggestions trigger (lint 0011)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_match_suggestions_pair_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.kind = 'pair' AND array_length(NEW.member_ids, 1) = 2 THEN
    NEW.user_low_id := LEAST(NEW.member_ids[1], NEW.member_ids[2]);
    NEW.user_high_id := GREATEST(NEW.member_ids[1], NEW.member_ids[2]);
  ELSE
    NEW.user_low_id := NULL;
    NEW.user_high_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3) Message key triggers: private schema — not exposed as /rpc (lint 0028/0029)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_messages_upsert_key ON public.messages;
DROP TRIGGER IF EXISTS trg_messages_delete_key ON public.messages;

DROP FUNCTION IF EXISTS public.messages_upsert_message_key();
DROP FUNCTION IF EXISTS public.messages_delete_message_key();

CREATE OR REPLACE FUNCTION private.messages_upsert_message_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, pg_catalog
AS $$
BEGIN
  INSERT INTO private.message_keys (id, created_at)
  VALUES (NEW.id, NEW.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.messages_delete_message_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, pg_catalog
AS $$
BEGIN
  DELETE FROM private.message_keys k WHERE k.id = OLD.id;
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION private.messages_upsert_message_key() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.messages_delete_message_key() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.messages_upsert_message_key() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.messages_delete_message_key() TO authenticated, service_role;

CREATE TRIGGER trg_messages_upsert_key
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION private.messages_upsert_message_key();

CREATE TRIGGER trg_messages_delete_key
  AFTER DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION private.messages_delete_message_key();
