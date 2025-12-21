-- Diagnose why compatibility scores are missing
-- Check if extract_actual_value function exists

-- Test 1: Check if extract_actual_value exists
SELECT 
  'extract_actual_value function check' as test,
  COUNT(*) as function_exists
FROM pg_proc p
WHERE p.proname = 'extract_actual_value'
  AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test 2: Test extract_actual_value if it exists
SELECT 
  'extract_actual_value test' as test,
  public.extract_actual_value('"high"'::jsonb) as string_value,
  public.extract_actual_value('{"kind":"mcq","value":"high"}'::jsonb) as object_value;

-- Test 3: Test normalization functions directly
SELECT 
  'normalize_mcq_value test' as test,
  public.normalize_mcq_value('"high"'::jsonb) as result;

-- Test 4: Check if compute_compatibility_score is failing
-- This will show any errors
DO $$
DECLARE
  v_result RECORD;
  v_error TEXT;
BEGIN
  BEGIN
    SELECT * INTO v_result
    FROM public.compute_compatibility_score(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid
    );
    
    RAISE NOTICE 'Success: compatibility_score = %, harmony_score = %, context_score = %', 
      v_result.compatibility_score, v_result.harmony_score, v_result.context_score;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    RAISE NOTICE 'Error: %', v_error;
  END;
END $$;

