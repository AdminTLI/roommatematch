-- Harden SECURITY DEFINER functions (v2, signature-safe).
-- This migration is defensive:
-- - It revokes EXECUTE from anon/authenticated for ALL overloads of the listed function names
--   in schema public, but ONLY when the function is SECURITY DEFINER.
-- - It then grants EXECUTE to service_role for those same SECURITY DEFINER functions.
-- - It also moves common RLS helper functions from public -> private (for ALL overloads),
--   which removes PostgREST RPC exposure while keeping policy references valid (OID-based).

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

-- 1) Move helper functions out of public (all overloads).
DO $$
DECLARE
  r record;
  helper_names text[] := ARRAY[
    'is_super_admin',
    'is_admin',
    'is_admin_in_university',
    'is_admin_user',
    'is_user_admin',
    'is_chat_owner',
    'user_is_chat_member',
    'users_in_same_chat',
    'user_in_same_university',
    'can_view_minimal_profile'
  ];
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY(helper_names)
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET SCHEMA private', r.schema_name, r.function_name, r.identity_args);
  END LOOP;

  -- Ensure policies can still execute helpers (grant on all overloads now in private).
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'private'
      AND p.proname = ANY(helper_names)
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO authenticated', r.schema_name, r.function_name, r.identity_args);
  END LOOP;
END $$;

-- 2) Revoke public execution of SECURITY DEFINER functions that should be server-only.
DO $$
DECLARE
  r record;
  rpc_names text[] := ARRAY[
    'anonymize_inactive_accounts',
    'assign_default_user_role',
    'broadcast_message_to_realtime',
    'check_hard_constraints',
    'check_match_suggestions_consistency',
    'compute_compatibility_score',
    'compute_compatibility_scores_batch',
    'compute_user_vector_and_store',
    'create_matches_for_user',
    'create_notification',
    'debug_hard_constraints',
    'extract_actual_value',
    'find_best_matches_v2',
    'find_potential_matches',
    'fix_match_suggestions_consistency',
    'get_admin_analytics',
    'get_cleanliness_dimension',
    'get_deduplicated_suggestions',
    'get_dimension_value',
    'get_guests_dimension',
    'get_home_vibe_dimension',
    'get_noise_dimension',
    'get_shared_spaces_dimension',
    'get_sleep_dimension',
    'get_study_social_dimension',
    'get_substances_dimension',
    'get_user_active_consents',
    'get_user_match_stats',
    'get_user_matches',
    'get_user_role',
    'handle_new_user',
    'has_recent_export_request',
    'normalize_bipolar_value',
    'normalize_likert_value',
    'normalize_mcq_value',
    'purge_expired_app_events',
    'purge_expired_messages',
    'purge_expired_reports',
    'purge_expired_verifications',
    'resolve_user_preferences',
    'room_messages_broadcast_trigger',
    'sync_question_importance_counts',
    'update_profile_verification_status',
    'update_user_vector'
  ];
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY(rpc_names)
      AND p.prosecdef = true
  LOOP
    -- Important: privileges often come from PUBLIC. Revoke that first, then revoke any direct grants.
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC', r.schema_name, r.function_name, r.identity_args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon, authenticated', r.schema_name, r.function_name, r.identity_args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %I.%I(%s) TO service_role', r.schema_name, r.function_name, r.identity_args);
  END LOOP;
END $$;

