-- Harden SECURITY DEFINER functions:
-- - Move authz/policy helper functions out of exposed schemas (public) into a non-exposed schema.
-- - Revoke EXECUTE on remaining SECURITY DEFINER functions from anon/authenticated.
-- - Grant EXECUTE only to service_role for server-side RPC usage.

-- Non-exposed schema for security-sensitive helpers (not reachable via PostgREST RPC).
CREATE SCHEMA IF NOT EXISTS private;

-- Allow authenticated users to call helper functions in policies (schema-qualified / OID-resolved).
GRANT USAGE ON SCHEMA private TO authenticated;

-- ---------------------------------------------------------------------------
-- Move policy/helper functions out of `public` so they are not exposed as RPC.
-- (Altering schema preserves OIDs; existing RLS policies/triggers keep working.)
-- ---------------------------------------------------------------------------
ALTER FUNCTION public.is_super_admin() SET SCHEMA private;
ALTER FUNCTION public.is_super_admin(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_admin() SET SCHEMA private;
ALTER FUNCTION public.is_admin(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_admin_in_university(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_admin_user() SET SCHEMA private;
ALTER FUNCTION public.is_user_admin() SET SCHEMA private;
ALTER FUNCTION public.is_user_admin(uuid) SET SCHEMA private;
ALTER FUNCTION public.is_chat_owner(uuid) SET SCHEMA private;
ALTER FUNCTION public.user_is_chat_member(uuid) SET SCHEMA private;
ALTER FUNCTION public.users_in_same_chat(uuid) SET SCHEMA private;
ALTER FUNCTION public.user_in_same_university(uuid) SET SCHEMA private;
ALTER FUNCTION public.can_view_minimal_profile(uuid) SET SCHEMA private;

-- Ensure policies can still call these helpers.
GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin_in_university(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_chat_owner(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.user_is_chat_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.users_in_same_chat(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.user_in_same_university(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_view_minimal_profile(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Revoke PUBLIC/AUTHENTICATED execution of SECURITY DEFINER RPCs.
-- These functions must be callable only by server-side code (service_role),
-- or via triggers, not directly from clients through PostgREST RPC.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.anonymize_inactive_accounts() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_user_role() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.broadcast_message_to_realtime() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_hard_constraints(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_match_suggestions_consistency() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_compatibility_score(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_compatibility_scores_batch(uuid, uuid[]) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_user_vector_and_store(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_matches_for_user(uuid, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, character varying, text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.debug_hard_constraints(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.extract_actual_value(jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.find_best_matches_v2(uuid, integer, integer, numeric) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.find_potential_matches(uuid, integer, numeric) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fix_match_suggestions_consistency() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_admin_analytics(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_cleanliness_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_deduplicated_suggestions(uuid, boolean, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_dimension_value(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_dimension_value(uuid, text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_guests_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_home_vibe_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_noise_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_shared_spaces_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_sleep_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_study_social_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_substances_dimension(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_active_consents(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_active_consents(uuid, character varying) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_match_stats(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_matches(uuid, integer, integer, uuid[], text[], uuid[], integer[]) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_recent_export_request(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_bipolar_value(jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_likert_value(jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_mcq_value(jsonb, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_expired_app_events() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_expired_messages() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_expired_reports() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_expired_verifications() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_user_preferences(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.room_messages_broadcast_trigger() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_question_importance_counts() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_profile_verification_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_vector(uuid) FROM anon, authenticated;

-- Grant server-side execution.
GRANT EXECUTE ON FUNCTION public.anonymize_inactive_accounts() TO service_role;
GRANT EXECUTE ON FUNCTION public.assign_default_user_role() TO service_role;
GRANT EXECUTE ON FUNCTION public.broadcast_message_to_realtime() TO service_role;
GRANT EXECUTE ON FUNCTION public.check_hard_constraints(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_match_suggestions_consistency() TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_compatibility_score(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_compatibility_scores_batch(uuid, uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_user_vector_and_store(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_matches_for_user(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, character varying, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.debug_hard_constraints(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.extract_actual_value(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.find_best_matches_v2(uuid, integer, integer, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.find_potential_matches(uuid, integer, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.fix_match_suggestions_consistency() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_cleanliness_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_deduplicated_suggestions(uuid, boolean, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_dimension_value(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_dimension_value(uuid, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_guests_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_home_vibe_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_noise_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_shared_spaces_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_sleep_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_study_social_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_substances_dimension(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_active_consents(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_active_consents(uuid, character varying) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_match_stats(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_matches(uuid, integer, integer, uuid[], text[], uuid[], integer[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_recent_export_request(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.normalize_bipolar_value(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.normalize_likert_value(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.normalize_mcq_value(jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_app_events() TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_messages() TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_reports() TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_expired_verifications() TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_user_preferences(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.room_messages_broadcast_trigger() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_question_importance_counts() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_profile_verification_status() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_user_vector(uuid) TO service_role;

