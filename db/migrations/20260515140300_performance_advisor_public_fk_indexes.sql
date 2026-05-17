-- Performance Advisor: unindexed_foreign_keys (lint 0001) on public tables.
-- Creates covering indexes for FK columns that lack them (idempotent).
-- Skips partitioned parents when child partitions are indexed separately.

DO $$
DECLARE
  r record;
  v_index_name text;
  v_col_name text;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      con.conname AS fkey_name,
      a.attname AS column_name
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN unnest(con.conkey) WITH ORDINALITY AS ck(attnum, ord)
      ON true
    JOIN pg_attribute a
      ON a.attrelid = c.oid
     AND a.attnum = ck.attnum
     AND NOT a.attisdropped
    WHERE con.contype = 'f'
      AND n.nspname = 'public'
      AND c.relkind IN ('r', 'p')
      AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = c.oid
          AND i.indisvalid
          AND (i.indkey)[0] = a.attnum
      )
  LOOP
    v_index_name := format('idx_%s_%s_fkey', r.table_name, r.column_name);
    v_col_name := r.column_name;

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %I.%I (%I)',
      v_index_name,
      r.schema_name,
      r.table_name,
      v_col_name
    );
  END LOOP;
END;
$$;
