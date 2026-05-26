-- Harden EXECUTE grants on admin role-assignment SECURITY DEFINER functions.
-- These are trigger helpers / service_role RPCs — not public PostgREST endpoints.
-- Clears Supabase linter 0028 (anon) and 0029 (authenticated) for these functions.

DO $$
DECLARE
  r record;
  fn_names text[] := ARRAY[
    'apply_pending_role_assignments_for_user',
    'apply_pending_role_assignments_on_confirm',
    'apply_pending_role_assignments_for_user_id',
    'touch_admin_role_assignment_updated_at',
    'touch_institution_admin_profile_updated_at'
  ];
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY(fn_names)
      AND p.prosecdef = true
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC',
      r.schema_name,
      r.function_name,
      r.identity_args
    );
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon, authenticated',
      r.schema_name,
      r.function_name,
      r.identity_args
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %I.%I(%s) TO postgres',
      r.schema_name,
      r.function_name,
      r.identity_args
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %I.%I(%s) TO service_role',
      r.schema_name,
      r.function_name,
      r.identity_args
    );
  END LOOP;
END $$;

-- auth.users triggers run as supabase_auth_admin
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.apply_pending_role_assignments_for_user()
      TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.apply_pending_role_assignments_on_confirm()
      TO supabase_auth_admin;
    GRANT EXECUTE ON FUNCTION public.apply_pending_role_assignments_for_user_id(uuid, text)
      TO supabase_auth_admin;
  END IF;
END $$;
