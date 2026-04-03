-- Verify the compute_compatibility_score function exists with correct signature
-- and test it to ensure it's working correctly

-- Check function signature
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
WHERE p.proname = 'compute_compatibility_score';

-- Test the function with the same users we tested earlier
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  ROUND(compatibility_score::numeric * 100, 1) as compatibility_percent,
  ROUND(harmony_score::numeric * 100, 1) as harmony_percent,
  ROUND(context_score::numeric * 100, 1) as context_percent,
  is_valid_match,
  algorithm_version
FROM public.compute_compatibility_score(
  '11111111-1111-4111-8111-111111111101'::uuid,
  '11111111-1111-4111-8111-111111111102'::uuid
);

