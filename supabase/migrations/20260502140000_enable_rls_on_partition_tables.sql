-- Enable Row Level Security on physical partition tables for `messages` and `app_events`.
--
-- Context (lint: rls_disabled_in_public, Postgres partitioning):
-- - RLS and policies are defined on the partitioned *parent* (`public.messages`, `public.app_events`).
-- - Each monthly partition is its own relation; it must have RLS enabled or PostgREST-exposed
--   clients could otherwise hit partitions directly without enforcement.
-- - `ALTER TABLE parent ENABLE ROW LEVEL SECURITY` does not flip `relrowsecurity` on existing
--   child partitions; new partitions also start without RLS unless we set it at creation time.
--
-- Fix: enable RLS on every partition (policies remain on the parent only), and bake this into
-- `private.create_monthly_partitions` so automation stays compliant.

-- 1) Existing partitions (any deployment that already ran the partition migration).
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
      AND n.nspname = 'public'
      AND p.relname IN ('messages', 'app_events')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      r.schema_name,
      r.partition_name
    );
  END LOOP;
END;
$$;

-- 2) Future partitions: same logic as 20260430185739, plus ENABLE RLS on each child table.
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
      'CREATE TABLE IF NOT EXISTS %I.%I PARTITION OF %s FOR VALUES FROM (%L) TO (%L)',
      v_parent_schema,
      v_partition_name,
      p_parent_table::text,
      v_month_start::timestamptz,
      v_month_end::timestamptz
    );

    EXECUTE format(
      'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      v_parent_schema,
      v_partition_name
    );
  END LOOP;
END;
$$;
