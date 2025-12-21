-- Debug script to see what values are actually stored and extracted

-- Test 1: Check raw onboarding_sections data for one user
SELECT 
  section,
  jsonb_typeof(answers) as answers_type,
  jsonb_array_length(answers) as array_length,
  answers->0 as first_answer_sample
FROM public.onboarding_sections 
WHERE user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid
LIMIT 5;

-- Test 2: Check what resolve_user_preferences extracts for M4_Q1 specifically
SELECT 
  'resolve_user_preferences M4_Q1' as test,
  resolved->'M4_Q1' as m4_q1_value,
  jsonb_typeof(resolved->'M4_Q1') as value_type
FROM (
  SELECT public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as resolved
) t;

-- Test 3: Check what get_dimension_value returns vs what resolve_user_preferences returns
SELECT 
  'get_dimension_value M4_Q1' as test,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M4_Q1',
    NULL  -- Don't pass resolved prefs, let it look up itself
  ) as value_from_function,
  (SELECT resolved->'M4_Q1' FROM (SELECT public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as resolved) t) as value_from_resolved;

-- Test 4: Check multiple questions to see which ones are missing
SELECT 
  question_key,
  CASE 
    WHEN public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      question_key,
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    ) IS NULL THEN 'NULL (missing)'
    ELSE 'Has value'
  END as status,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    question_key,
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as value
FROM (
  SELECT 'M4_Q1' as question_key
  UNION ALL SELECT 'M4_Q2'
  UNION ALL SELECT 'M4_Q3'
  UNION ALL SELECT 'M3_Q1'
  UNION ALL SELECT 'M3_Q2'
  UNION ALL SELECT 'M3_Q4'
  UNION ALL SELECT 'M5_Q3'
  UNION ALL SELECT 'M5_Q4'
  UNION ALL SELECT 'M2_Q1'
  UNION ALL SELECT 'M2_Q2'
) questions;

