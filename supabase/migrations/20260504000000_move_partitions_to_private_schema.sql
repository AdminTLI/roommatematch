-- Move partitions to the private schema to hide them from PostgREST
-- This avoids the "rls_enabled_no_policy" linter warning since they aren't exposed
-- directly, and it optimizes PostgREST's schema cache reload by reducing the number
-- of relations in the public schema.

DO $$
DECLARE
  r record;
BEGIN
  -- Find all existing partitions for messages and app_events in the public schema
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
    -- Move the partition to the private schema
    EXECUTE format(
      'ALTER TABLE %I.%I SET SCHEMA private',
      r.schema_name,
      r.partition_name
    );
  END LOOP;
END;
$$;

-- Update the partition creation function to always create partitions in the private schema
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

    -- Create partition in the private schema instead of v_parent_schema
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS private.%I PARTITION OF %s FOR VALUES FROM (%L) TO (%L)',
      v_partition_name,
      p_parent_table::text,
      v_month_start::timestamptz,
      v_month_end::timestamptz
    );

    -- Enable RLS on the partition itself just in case (though it is in private schema now)
    EXECUTE format(
      'ALTER TABLE private.%I ENABLE ROW LEVEL SECURITY',
      v_partition_name
    );
  END LOOP;
END;
$$;
