-- Database linter 0008 (rls_enabled_no_policy): monthly partitions in `private` have RLS
-- enabled but no policies. Add explicit deny policies for PostgREST client roles, matching
-- private.message_keys (see 20260502160000_rls_policies_linter_0008_internal_tables.sql).
--
-- Parent tables (public.messages, public.app_events) keep their real access policies;
-- partitions are internal storage shards, not exposed via the API.

-- 1) Backfill deny policies on all existing messages / app_events partitions.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS partition_name
    FROM pg_inherits i
    JOIN pg_class c ON c.oid = i.inhrelid
    JOIN pg_class p ON p.oid = i.inhparent
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_namespace pn ON pn.oid = p.relnamespace
    WHERE pn.nspname = 'public'
      AND p.relname IN ('messages', 'app_events')
      AND n.nspname IN ('private', 'public')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schema_name,
      r.partition_name
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS "Block anon and authenticated" ON %I.%I',
      r.schema_name,
      r.partition_name
    );

    EXECUTE format(
      'CREATE POLICY "Block anon and authenticated" ON %I.%I
       FOR ALL
       TO anon, authenticated
       USING (false)
       WITH CHECK (false)',
      r.schema_name,
      r.partition_name
    );
  END LOOP;
END;
$$;

-- 2) Future partitions: deny client roles at creation time (lint 0008).
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

  v_month_start := date_trunc('month', p_start_month)::date;

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
  END LOOP;
END;
$$;
