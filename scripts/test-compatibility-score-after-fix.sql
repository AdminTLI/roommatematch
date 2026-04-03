-- Test compatibility score after applying all fixes
-- This will show if scores are being calculated correctly

-- Test 1: Check if extract_actual_value exists
SELECT 
  'extract_actual_value exists' as check_name,
  COUNT(*)::text as result
FROM pg_proc p
WHERE p.proname = 'extract_actual_value'
  AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test 2: Test compute_compatibility_score directly
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  is_valid_match,
  algorithm_version,
  ROUND(compatibility_score::numeric * 100, 1) as compatibility_percent,
  ROUND(harmony_score::numeric * 100, 1) as harmony_percent,
  ROUND(context_score::numeric * 100, 1) as context_percent
FROM public.compute_compatibility_score(
  '11111111-1111-4111-8111-111111111101'::uuid,
  '11111111-1111-4111-8111-111111111102'::uuid
);

