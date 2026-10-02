-- Performance Advisor fixes:
-- 1) auth_rls_initplan (0003): replace service_role auth.role() policies with
--    deny-all for anon/authenticated (service_role bypasses RLS when FORCE RLS is off)
-- 2) duplicate_index (0009): drop manually created chat_id/user_id indexes that
--    duplicate parent-attached FK indexes on newer messages partitions
-- 3) Stop create_monthly_partitions from recreating those duplicates

-- ---------------------------------------------------------------------------
-- Part 1: vibe_check / feature_waitlist RLS (lint 0003)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access vibe_check_responses"
  ON public.vibe_check_responses;
DROP POLICY IF EXISTS "Service role full access vibe_check_events"
  ON public.vibe_check_events;
DROP POLICY IF EXISTS "Service role full access feature_waitlist"
  ON public.feature_waitlist;

CREATE POLICY "Block anon and authenticated"
  ON public.vibe_check_responses
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block anon and authenticated"
  ON public.vibe_check_events
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block anon and authenticated"
  ON public.feature_waitlist
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- Part 2: drop duplicate messages partition indexes (lint 0009)
-- Keep indexes attached to parent idx_messages_*_fkey; drop standalone duplicates.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      t.relname AS table_name,
      i.relname AS index_name
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_index x ON x.indrelid = t.oid
    JOIN pg_class i ON i.oid = x.indexrelid
    WHERE n.nspname = 'private'
      AND t.relname ~ '^messages_[0-9]{4}_[0-9]{2}$'
      AND i.relname ~ '^idx_messages_[0-9]{4}_[0-9]{2}_(chat_id|user_id)$'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_inherits inh
        WHERE inh.inhrelid = i.oid
      )
      AND EXISTS (
        -- Only drop when an identical attached sibling remains
        SELECT 1
        FROM pg_index x2
        JOIN pg_class i2 ON i2.oid = x2.indexrelid
        JOIN pg_inherits inh2 ON inh2.inhrelid = i2.oid
        WHERE x2.indrelid = t.oid
          AND x2.indkey = x.indkey
          AND x2.indisunique = x.indisunique
          AND COALESCE(pg_get_expr(x2.indpred, x2.indrelid), '')
            = COALESCE(pg_get_expr(x.indpred, x.indrelid), '')
          AND i2.oid <> i.oid
      )
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schema_name, r.index_name);
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- Part 3: future partitions — rely on parent FK indexes for chat_id / user_id
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.create_monthly_partitions(
  p_parent_table regclass,
  p_start_month date,
  p_months_ahead integer DEFAULT 3
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_catalog
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

  FOR i IN 0..p_months_ahead LOOP
    v_month_start := (date_trunc('month', p_start_month)::date + (i || ' months')::interval)::date;
    v_month_end := (v_month_start + interval '1 month')::date;

    v_partition_name := format('%s_%s', v_parent_name, to_char(v_month_start, 'YYYY_MM'));

    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS private.%I PARTITION OF %s FOR VALUES FROM (%L) TO (%L)',
      v_partition_name,
      p_parent_table::text,
      v_month_start::timestamptz,
      v_month_end::timestamptz
    );

    EXECUTE format(
      'ALTER TABLE private.%I ENABLE ROW LEVEL SECURITY',
      v_partition_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "Block anon and authenticated" ON private.%I',
      v_partition_name
    );

    EXECUTE format(
      'CREATE POLICY "Block anon and authenticated" ON private.%I
       FOR ALL
       TO anon, authenticated
       USING (false)
       WITH CHECK (false)',
      v_partition_name
    );

    IF v_parent_name = 'messages' THEN
      -- chat_id / user_id covered by parent partitioned FK indexes
      -- (idx_messages_chat_id_fkey / idx_messages_user_id_fkey)
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON private.%I (reply_to_id) WHERE reply_to_id IS NOT NULL',
        'idx_' || v_partition_name || '_reply_to_id',
        v_partition_name
      );

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = rel.relnamespace
        WHERE ns.nspname = 'private'
          AND rel.relname = v_partition_name
          AND con.contype = 'p'
      ) THEN
        EXECUTE format(
          'ALTER TABLE private.%I ADD CONSTRAINT %I PRIMARY KEY (id, created_at)',
          v_partition_name,
          v_partition_name || '_pkey'
        );
      END IF;
    ELSIF v_parent_name = 'app_events' THEN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON private.%I (user_id) WHERE user_id IS NOT NULL',
        'idx_' || v_partition_name || '_user_id',
        v_partition_name
      );
    END IF;
  END LOOP;
END;
$$;
