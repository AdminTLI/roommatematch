-- Performance Advisor: unused_index (lint 0005)
-- Only drops indexes that are strict duplicates of another index on the same table.
-- Other unused indexes should be reviewed in production via pg_stat_user_indexes
-- before dropping (admin dashboards, seasonal features, etc.).

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    WITH index_cols AS (
      SELECT
        n.nspname AS schema_name,
        t.relname AS table_name,
        i.relname AS index_name,
        i.oid AS index_oid,
        array_agg(a.attname ORDER BY k.ord) AS columns,
        pg_get_indexdef(i.oid) AS indexdef
      FROM pg_index ix
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord) ON true
      JOIN pg_attribute a
        ON a.attrelid = t.oid
       AND a.attnum = k.attnum
       AND NOT a.attisdropped
      WHERE n.nspname = 'public'
        AND NOT ix.indisprimary
        AND NOT ix.indisunique
      GROUP BY n.nspname, t.relname, i.relname, i.oid
    ),
    dups AS (
      SELECT
        ic1.schema_name,
        ic1.table_name,
        ic1.index_name AS drop_index,
        ic1.index_oid AS drop_oid
      FROM index_cols ic1
      JOIN index_cols ic2
        ON ic1.schema_name = ic2.schema_name
       AND ic1.table_name = ic2.table_name
       AND ic1.columns = ic2.columns
       AND ic1.index_oid > ic2.index_oid
    )
    SELECT DISTINCT schema_name, table_name, drop_index
    FROM dups
    WHERE drop_index <> 'idx_announcements_university_id'
  LOOP
    EXECUTE format(
      'DROP INDEX IF EXISTS %I.%I',
      r.schema_name,
      r.drop_index
    );
    RAISE NOTICE 'Dropped duplicate index %.%.%', r.schema_name, r.table_name, r.drop_index;
  END LOOP;
END;
$$;
