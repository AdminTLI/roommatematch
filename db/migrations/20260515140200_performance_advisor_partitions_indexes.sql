-- Performance Advisor fixes:
-- - duplicate_index (lint 0009): announcements university_id
-- - unindexed_foreign_keys (lint 0001): private message/app_events partitions
-- - no_primary_key (lint 0023): private.messages_* partitions
-- Also updates private.create_monthly_partitions for future partitions.

-- 1) Duplicate index on announcements (keep the _id suffix name used in schema.sql)
DROP INDEX IF EXISTS public.idx_announcements_university;

-- 2) Backfill partition FK indexes and primary keys
DO $$
DECLARE
  r record;
  v_parent text;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS partition_name, p.relname AS parent_name
    FROM pg_inherits i
    JOIN pg_class c ON c.oid = i.inhrelid
    JOIN pg_class p ON p.oid = i.inhparent
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_namespace pn ON pn.oid = p.relnamespace
    WHERE pn.nspname = 'public'
      AND n.nspname = 'private'
      AND p.relname IN ('messages', 'app_events')
  LOOP
    v_parent := r.parent_name;

    IF v_parent = 'messages' THEN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I.%I (chat_id)',
        'idx_' || r.partition_name || '_chat_id',
        r.schema_name,
        r.partition_name
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I.%I (user_id)',
        'idx_' || r.partition_name || '_user_id',
        r.schema_name,
        r.partition_name
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I.%I (reply_to_id) WHERE reply_to_id IS NOT NULL',
        'idx_' || r.partition_name || '_reply_to_id',
        r.schema_name,
        r.partition_name
      );

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = rel.relnamespace
        WHERE ns.nspname = r.schema_name
          AND rel.relname = r.partition_name
          AND con.contype = 'p'
      ) THEN
        EXECUTE format(
          'ALTER TABLE %I.%I ADD CONSTRAINT %I PRIMARY KEY (id, created_at)',
          r.schema_name,
          r.partition_name,
          r.partition_name || '_pkey'
        );
      END IF;
    ELSIF v_parent = 'app_events' THEN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I.%I (user_id) WHERE user_id IS NOT NULL',
        'idx_' || r.partition_name || '_user_id',
        r.schema_name,
        r.partition_name
      );
    END IF;
  END LOOP;
END;
$$;

-- 3) Future partitions: deny RLS + indexes + messages PK (lint 0008 + 0001 + 0023)
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
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON private.%I (chat_id)',
        'idx_' || v_partition_name || '_chat_id',
        v_partition_name
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON private.%I (user_id)',
        'idx_' || v_partition_name || '_user_id',
        v_partition_name
      );
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

-- 4) Auth DB connections (lint not in SQL): switch Supabase Dashboard →
--    Project Settings → Database → Connection pooling → Auth uses % of pool
--    instead of absolute 10 connections as traffic grows.
