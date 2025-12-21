-- Test what values are being extracted for all questions used in dimension calculations
-- This will help identify if values are missing or in unrecognized formats

-- Test 1: Check what resolve_user_preferences returns for key questions
SELECT 
  'Resolved Preferences Sample' as test,
  jsonb_object_keys(resolved) as question_key,
  resolved->jsonb_object_keys(resolved) as value,
  jsonb_typeof(resolved->jsonb_object_keys(resolved)) as value_type
FROM (
  SELECT public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as resolved
) t
WHERE jsonb_object_keys(resolved) IN (
  'M4_Q1', 'M4_Q2', 'M4_Q3',  -- Cleanliness
  'M3_Q1', 'M3_Q2', 'M3_Q4',  -- Noise
  'M5_Q3', 'M5_Q4',  -- Guests
  'M2_Q1', 'M2_Q2'  -- Sleep
)
LIMIT 20;

-- Test 2: Check what get_dimension_value returns for these questions
SELECT 
  'M4_Q1' as question,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M4_Q1',
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as raw_value,
  jsonb_typeof(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M4_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as type,
  public.normalize_mcq_value(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M4_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as normalized
UNION ALL
SELECT 
  'M3_Q1' as question,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M3_Q1',
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as raw_value,
  jsonb_typeof(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M3_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as type,
  public.normalize_likert_value(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M3_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as normalized
UNION ALL
SELECT 
  'M2_Q1' as question,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M2_Q1',
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as raw_value,
  jsonb_typeof(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M2_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as type,
  public.normalize_bipolar_value(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M2_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as normalized;

-- Test 3: Check what happens with extract_actual_value for different formats
SELECT 
  'extract_actual_value tests' as test,
  public.extract_actual_value('"high"'::jsonb) as string_value,
  public.extract_actual_value('{"kind":"mcq","value":"high"}'::jsonb) as object_value,
  public.extract_actual_value('{"value":"high"}'::jsonb) as nested_value,
  public.extract_actual_value('3'::jsonb) as numeric_value;

-- Test 4: Compare compatibility scores across multiple user pairs to see variation
SELECT 
  user_a.id::text as user_a_id,
  user_b.id::text as user_b_id,
  ROUND(cs.compatibility_score::numeric * 100, 1) as compatibility_percent,
  ROUND(cs.harmony_score::numeric * 100, 1) as harmony_percent,
  ROUND(cs.context_score::numeric * 100, 1) as context_percent
FROM auth.users user_a
CROSS JOIN auth.users user_b
CROSS JOIN LATERAL public.compute_compatibility_score(user_a.id, user_b.id) cs
WHERE user_a.id != user_b.id
  AND user_a.id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid
ORDER BY cs.compatibility_score DESC
LIMIT 10;

