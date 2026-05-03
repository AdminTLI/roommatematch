-- Partition high-velocity tables by month (range on created_at).
-- Targets: public.messages, public.app_events
--
-- Notes:
-- - PostgreSQL partitioned tables cannot enforce UNIQUE(id) unless it includes the partition key.
--   `messages` is referenced by many tables via message_id, so we introduce `public.message_keys`
--   (id PK) to preserve single-column FKs while `messages` becomes partitioned on created_at.
-- - Partitioning is transparent to SELECT/INSERT queries against the parent table.

-- 1) Private schema for partition-management utilities (not exposed via PostgREST).
CREATE SCHEMA IF NOT EXISTS private;

-- 3) Helper: create monthly range partitions for a parent table.
CREATE OR REPLACE FUNCTION private.create_monthly_partitions(
  p_parent_table regclass,
  p_start_month date,
  p_months_ahead integer DEFAULT 3
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_parent_schema text;
  v_parent_name text;
  v_month_start date;
  v_month_end date;
  v_partition_name text;
BEGIN
  SELECT n.nspname, c.relname
  INTO v_parent_schema, v_parent_name
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.oid = p_parent_table;

  IF v_parent_schema IS NULL THEN
    RAISE EXCEPTION 'Parent table % not found', p_parent_table;
  END IF;

  v_month_start := date_trunc('month', p_start_month)::date;

  FOR i IN 0..p_months_ahead LOOP
    v_month_start := (date_trunc('month', p_start_month)::date + (i || ' months')::interval)::date;
    v_month_end := (v_month_start + interval '1 month')::date;

    v_partition_name := format('%s_%s', v_parent_name, to_char(v_month_start, 'YYYY_MM'));

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I.%I PARTITION OF %s FOR VALUES FROM (%L) TO (%L)',
      v_parent_schema,
      v_partition_name,
      p_parent_table::text,
      v_month_start::timestamptz,
      v_month_end::timestamptz
    );
  END LOOP;
END;
$$;

-- 4) `message_keys`: stable single-column FK target for messages.
-- Kept in `private` so it isn't exposed via PostgREST.
CREATE TABLE IF NOT EXISTS private.message_keys (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL
);

-- Backfill keys from the current (unpartitioned) messages table (safe to re-run).
INSERT INTO private.message_keys (id, created_at)
SELECT m.id, m.created_at
FROM public.messages m
ON CONFLICT (id) DO NOTHING;

-- Update dependent foreign keys to reference message_keys(id), keeping the column shape unchanged.
-- (Constraint names are the default ones used by Postgres; IF EXISTS keeps this migration idempotent.)
ALTER TABLE public.message_reads
  DROP CONSTRAINT IF EXISTS message_reads_message_id_fkey;
ALTER TABLE public.message_reads
  ADD CONSTRAINT message_reads_message_id_fkey
  FOREIGN KEY (message_id) REFERENCES private.message_keys(id) ON DELETE CASCADE;

ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_message_id_fkey;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_message_id_fkey
  FOREIGN KEY (message_id) REFERENCES private.message_keys(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF to_regclass('public.message_reactions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.message_reactions DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey';
    EXECUTE 'ALTER TABLE public.message_reactions ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES private.message_keys(id) ON DELETE CASCADE';
  END IF;
END;
$$;

-- Self-reference for replies should remain single-column.
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_reply_to_id_fkey;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_reply_to_id_fkey
  FOREIGN KEY (reply_to_id) REFERENCES private.message_keys(id) ON DELETE SET NULL;

-- 5) Convert public.messages to a partitioned table (monthly partitions by created_at).
ALTER TABLE public.messages RENAME TO messages_unpartitioned_old;

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  chat_id uuid NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  reply_to_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Safety/moderation fields
  is_flagged boolean DEFAULT false,
  flagged_reason text[] DEFAULT ARRAY[]::text[],
  flagged_at timestamptz,
  auto_flagged boolean DEFAULT false
)
PARTITION BY RANGE (created_at);

-- Maintain message_keys automatically and keep keys tidy on cascades.
CREATE OR REPLACE FUNCTION public.messages_upsert_message_key()
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

CREATE OR REPLACE FUNCTION public.messages_delete_message_key()
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

GRANT EXECUTE ON FUNCTION public.messages_upsert_message_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.messages_delete_message_key() TO authenticated;

DROP TRIGGER IF EXISTS trg_messages_upsert_key ON public.messages;
CREATE TRIGGER trg_messages_upsert_key
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.messages_upsert_message_key();

DROP TRIGGER IF EXISTS trg_messages_delete_key ON public.messages;
CREATE TRIGGER trg_messages_delete_key
  AFTER DELETE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.messages_delete_message_key();

-- Enforce that every message row has a corresponding key row (and allow cascade deletes from keys).
ALTER TABLE public.messages
  ADD CONSTRAINT messages_id_fk
  FOREIGN KEY (id) REFERENCES private.message_keys(id) ON DELETE CASCADE;

-- Restore the reply FK on the new partitioned parent.
ALTER TABLE public.messages
  ADD CONSTRAINT messages_reply_to_id_fkey
  FOREIGN KEY (reply_to_id) REFERENCES private.message_keys(id) ON DELETE SET NULL;

-- Indexes on the partitioned parent (propagated to partitions).
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at
  ON public.messages (chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_user_id
  ON public.messages (user_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id
  ON public.messages (reply_to_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_flagged
  ON public.messages (is_flagged) WHERE is_flagged = true;
CREATE INDEX IF NOT EXISTS idx_messages_flagged_at
  ON public.messages (flagged_at) WHERE flagged_at IS NOT NULL;

-- Partitions: cover existing history (old table) + a few months ahead.
DO $$
DECLARE
  v_min timestamptz;
  v_max timestamptz;
  v_start date;
  v_end date;
  v_months int;
BEGIN
  SELECT min(created_at), max(created_at)
  INTO v_min, v_max
  FROM public.messages_unpartitioned_old;

  v_start := date_trunc('month', COALESCE(v_min, now()))::date;
  v_end := (date_trunc('month', COALESCE(v_max, now())) + interval '1 month')::date;

  v_months := (
    EXTRACT(YEAR FROM age(v_end, v_start))::int * 12
    + EXTRACT(MONTH FROM age(v_end, v_start))::int
  );

  PERFORM private.create_monthly_partitions('public.messages'::regclass, v_start, GREATEST(v_months, 0) + 6);
END;
$$;

-- Backfill old messages into the partitioned table.
INSERT INTO public.messages (
  id, chat_id, user_id, content, reply_to_id, created_at,
  is_flagged, flagged_reason, flagged_at, auto_flagged
)
SELECT
  id, chat_id, user_id, content, reply_to_id, created_at,
  is_flagged, flagged_reason, flagged_at, auto_flagged
FROM public.messages_unpartitioned_old;

-- 6) Convert public.app_events to a partitioned table (monthly partitions by created_at).
ALTER TABLE public.app_events RENAME TO app_events_unpartitioned_old;

CREATE TABLE public.app_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  props jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
)
PARTITION BY RANGE (created_at);

CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON public.app_events(user_id);
CREATE INDEX IF NOT EXISTS idx_app_events_name ON public.app_events(name);
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON public.app_events(created_at);

DO $$
DECLARE
  v_min timestamptz;
  v_max timestamptz;
  v_start date;
  v_end date;
  v_months int;
BEGIN
  SELECT min(created_at), max(created_at)
  INTO v_min, v_max
  FROM public.app_events_unpartitioned_old;

  v_start := date_trunc('month', COALESCE(v_min, now()))::date;
  v_end := (date_trunc('month', COALESCE(v_max, now())) + interval '1 month')::date;

  v_months := (
    EXTRACT(YEAR FROM age(v_end, v_start))::int * 12
    + EXTRACT(MONTH FROM age(v_end, v_start))::int
  );

  PERFORM private.create_monthly_partitions('public.app_events'::regclass, v_start, GREATEST(v_months, 0) + 6);
END;
$$;

INSERT INTO public.app_events (id, user_id, name, props, created_at)
SELECT id, user_id, name, props, created_at
FROM public.app_events_unpartitioned_old;

-- 7) Re-enable RLS and re-create policies (renaming moved old policies to *_unpartitioned_old).
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chat members can read messages" ON public.messages;
CREATE POLICY "Chat members can read messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = public.messages.chat_id
        AND cm.user_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.match_blocklist mb
      WHERE mb.user_id = auth.uid()
        AND mb.blocked_user_id = public.messages.user_id
        AND mb.created_at <= public.messages.created_at
        AND (mb.ended_at IS NULL OR mb.ended_at >= public.messages.created_at)
    )
  );

DROP POLICY IF EXISTS "Chat members can send messages" ON public.messages;
CREATE POLICY "Chat members can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = public.messages.chat_id
        AND cm.user_id = auth.uid()
    ) AND
    NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND (
          p.is_visible = false OR
          COALESCE((p.privacy_settings->>'allowMessages')::boolean, true) = false
        )
    ) AND
    (
      (
        EXISTS (
          SELECT 1 FROM public.chats c
          WHERE c.id = public.messages.chat_id
            AND c.is_group = false
        )
        AND NOT EXISTS (
          SELECT 1
          FROM public.chat_members cmr
          JOIN public.profiles pr ON pr.user_id = cmr.user_id
          WHERE cmr.chat_id = public.messages.chat_id
            AND cmr.user_id <> auth.uid()
            AND (
              pr.is_visible = false OR
              COALESCE((pr.privacy_settings->>'allowMessages')::boolean, true) = false
            )
        )
      )
      OR
      EXISTS (
        SELECT 1 FROM public.chats c
        WHERE c.id = public.messages.chat_id
          AND c.is_group = true
      )
    )
  );

DROP POLICY IF EXISTS "Users can create their own events" ON public.app_events;
CREATE POLICY "Users can create their own events" ON public.app_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all events" ON public.app_events;
CREATE POLICY "Admins can read all events" ON public.app_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE public.admins.user_id = auth.uid()
    )
  );

-- 8) Monthly automation: ensure partitions exist for the next few months.
CREATE OR REPLACE PROCEDURE private.ensure_monthly_partitions()
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM private.create_monthly_partitions('public.messages'::regclass, now()::date, 6);
  PERFORM private.create_monthly_partitions('public.app_events'::regclass, now()::date, 6);
END;
$$;

-- Schedule on the 1st of each month at 00:10 (UTC), but only if pg_cron is already enabled.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ensure_monthly_partitions') THEN
      PERFORM cron.schedule(
        'ensure_monthly_partitions',
        '10 0 1 * *',
        'CALL private.ensure_monthly_partitions();'
      );
    END IF;
  ELSE
    RAISE NOTICE 'pg_cron is not enabled; skipping partition scheduling. Enable pg_cron then run: CALL private.ensure_monthly_partitions();';
  END IF;
END;
$$;