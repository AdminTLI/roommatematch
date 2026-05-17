-- Performance Advisor: auth_rls_initplan (lint 0003)
-- Wrap auth.*() and current_setting() in RLS policy expressions so Postgres evaluates
-- them once per statement (initplan) instead of per row.
-- Idempotent: safe to re-run; collapses accidental double-wrapping.

CREATE OR REPLACE FUNCTION private.wrap_auth_in_rls(expression text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = pg_catalog, public
AS $$
DECLARE
  result text;
BEGIN
  IF expression IS NULL OR btrim(expression) = '' THEN
    RETURN expression;
  END IF;

  result := expression;

  -- Collapse double-wrapping from prior runs
  LOOP
    EXIT WHEN result !~ '\(select \(select auth\.uid\(\)\)\)';
    result := replace(result, '(select (select auth.uid()))', '(select auth.uid())');
  END LOOP;

  LOOP
    EXIT WHEN result !~ '\(select \(select auth\.jwt\(\)\)\)';
    result := replace(result, '(select (select auth.jwt()))', '(select auth.jwt())');
  END LOOP;

  LOOP
    EXIT WHEN result !~ '\(select \(select auth\.role\(\)\)\)';
    result := replace(result, '(select (select auth.role()))', '(select auth.role())');
  END LOOP;

  LOOP
    EXIT WHEN result !~ '\(select \(select current_setting\(';
    result := replace(result, '(select (select current_setting(', '(select current_setting(');
  END LOOP;

  IF result ~ 'auth\.uid\(\)' THEN
    result := regexp_replace(result, 'auth\.uid\(\)', '(select auth.uid())', 'g');
    result := replace(result, '(select (select auth.uid()))', '(select auth.uid())');
  END IF;

  IF result ~ 'auth\.jwt\(\)' THEN
    result := regexp_replace(result, 'auth\.jwt\(\)', '(select auth.jwt())', 'g');
    result := replace(result, '(select (select auth.jwt()))', '(select auth.jwt())');
  END IF;

  IF result ~ 'auth\.role\(\)' THEN
    result := regexp_replace(result, 'auth\.role\(\)', '(select auth.role())', 'g');
    result := replace(result, '(select (select auth.role()))', '(select auth.role())');
  END IF;

  WHILE result ~ 'current_setting\(' AND result !~ '\(select current_setting\(' LOOP
    result := regexp_replace(result, 'current_setting\(', '(select current_setting(', 1);
    result := replace(result, '(select (select current_setting(', '(select current_setting(');
  END LOOP;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION private.recreate_policy_with_wrapped_auth(
  p_schema name,
  p_table name,
  p_policy name,
  p_permissive text,
  p_cmd "char",
  p_roles name[],
  p_qual text,
  p_with_check text
)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, private, storage
AS $$
DECLARE
  cmd_sql text;
  roles_sql text;
  using_sql text;
  check_sql text;
  ddl text;
BEGIN
  cmd_sql := CASE p_cmd
    WHEN 'r' THEN 'FOR SELECT'
    WHEN 'a' THEN 'FOR INSERT'
    WHEN 'w' THEN 'FOR UPDATE'
    WHEN 'd' THEN 'FOR DELETE'
    WHEN '*' THEN 'FOR ALL'
    ELSE 'FOR ALL'
  END;

  -- Empty polroles (or invalid OIDs) means all roles: omit TO clause.
  -- Filter out pg_get_userbyid(0) artifacts like "unknown (OID=0)".
  SELECT string_agg(quote_ident(r), ', ')
  INTO roles_sql
  FROM unnest(COALESCE(p_roles, ARRAY[]::name[])) AS r
  WHERE r IS NOT NULL
    AND r <> ''
    AND r NOT LIKE 'unknown%'
    AND EXISTS (
      SELECT 1
      FROM pg_catalog.pg_roles pr
      WHERE pr.rolname = r
    );

  IF roles_sql IS NULL OR roles_sql = '' THEN
    roles_sql := '';
  ELSE
    roles_sql := ' TO ' || roles_sql;
  END IF;

  using_sql := '';
  IF p_qual IS NOT NULL AND btrim(p_qual) <> '' THEN
    using_sql := format(' USING (%s)', p_qual);
  END IF;

  check_sql := '';
  IF p_with_check IS NOT NULL AND btrim(p_with_check) <> '' THEN
    check_sql := format(' WITH CHECK (%s)', p_with_check);
  END IF;

  EXECUTE format(
    'DROP POLICY IF EXISTS %I ON %I.%I',
    p_policy,
    p_schema,
    p_table
  );

  ddl := format(
    'CREATE POLICY %I ON %I.%I AS %s %s%s%s%s',
    p_policy,
    p_schema,
    p_table,
    p_permissive,
    cmd_sql,
    roles_sql,
    using_sql,
    check_sql
  );

  EXECUTE ddl;
END;
$$;

DO $$
DECLARE
  policy_row record;
  new_qual text;
  new_check text;
  polcmd_char "char";
BEGIN
  FOR policy_row IN
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
      AND (
        qual ~ 'auth\.(uid|jwt|role)\(\)|current_setting\('
        OR with_check ~ 'auth\.(uid|jwt|role)\(\)|current_setting\('
      )
  LOOP
    polcmd_char := CASE policy_row.cmd
      WHEN 'SELECT' THEN 'r'
      WHEN 'INSERT' THEN 'a'
      WHEN 'UPDATE' THEN 'w'
      WHEN 'DELETE' THEN 'd'
      WHEN 'ALL' THEN '*'
      ELSE '*'
    END;
    new_qual := private.wrap_auth_in_rls(policy_row.qual);
    new_check := private.wrap_auth_in_rls(policy_row.with_check);

    IF new_qual IS NOT DISTINCT FROM policy_row.qual
       AND new_check IS NOT DISTINCT FROM policy_row.with_check THEN
      CONTINUE;
    END IF;

    PERFORM private.recreate_policy_with_wrapped_auth(
      policy_row.schemaname::name,
      policy_row.tablename::name,
      policy_row.policyname::name,
      policy_row.permissive,
      polcmd_char,
      policy_row.roles,
      new_qual,
      new_check
    );
  END LOOP;
END;
$$;
