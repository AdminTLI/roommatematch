-- Clear Supabase security advisor warnings:
-- - 0011 function_search_path_mutable (set_bug_reports_updated_at)
-- - 0028 anon_security_definer_function_executable
-- - 0029 authenticated_security_definer_function_executable
--
-- These SECURITY DEFINER helpers are trigger / matching internals, not public RPCs.
-- Match prior harden_* migrations: revoke from PUBLIC/anon/authenticated, grant service_role.

-- 1) Pin search_path on bug_reports updated_at trigger helper.
CREATE OR REPLACE FUNCTION public.set_bug_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_bug_reports_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_bug_reports_updated_at() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_bug_reports_updated_at() TO postgres, service_role;

-- 2) Revoke PostgREST exposure for SECURITY DEFINER matching / sync helpers.
DO $$
DECLARE
  r record;
  fn_names text[] := ARRAY[
    'calculate_context_score_v2',
    'check_hard_constraints_v2',
    'compute_compatibility_score_v2',
    'get_cleanliness_dimension_v2',
    'get_communication_dimension_v2',
    'get_environment_dimension_v2',
    'get_social_dimension_v2',
    'get_v2_answer',
    'increment_chat_turn_messages',
    'sync_answer_distribution_counts',
    'sync_identity_verification_confirmation'
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
