-- Ensure the correct compute_compatibility_score function is active
-- This drops any old versions and ensures migration 049's version is used

-- Drop function with old signature (if it exists from matching_engine.sql)
DROP FUNCTION IF EXISTS compute_compatibility_score(UUID, UUID) CASCADE;

-- Note: After running this, you MUST run migration 049_compatibility_algorithm_v1.sql
-- to create the correct function with the new signature that includes:
-- harmony_score, context_score, dimension_scores_json, is_valid_match, algorithm_version

-- To verify the function exists with the correct signature, run:
-- SELECT 
--   p.proname as function_name,
--   pg_get_function_arguments(p.oid) as arguments,
--   pg_get_function_result(p.oid) as return_type
-- FROM pg_proc p
-- WHERE p.proname = 'compute_compatibility_score';

