-- Test normalization functions to see what values they return

-- Test 1: normalize_mcq_value with "high" string
SELECT 
  'normalize_mcq_value("high")' as test,
  public.normalize_mcq_value('"high"'::jsonb) as result;

-- Test 2: normalize_mcq_value with JSONB string value (proper JSON format)
SELECT 
  'normalize_mcq_value(jsonb string)' as test,
  public.normalize_mcq_value('"high"'::jsonb) as result;

-- Test 3: Test extract_actual_value with "high"
SELECT 
  'extract_actual_value("high")' as test,
  public.extract_actual_value('"high"'::jsonb) as result,
  jsonb_typeof(public.extract_actual_value('"high"'::jsonb))::text as type;

-- Test 4: Test the full flow - what does get_cleanliness_dimension actually return?
SELECT 
  'get_cleanliness_dimension' as test,
  public.get_cleanliness_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as result;

-- Test 5: Test what normalize_mcq_value gets from get_dimension_value
SELECT 
  'normalize on actual extracted value' as test,
  public.normalize_mcq_value(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M4_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as normalized_value;

-- Test 6: Check all three cleanliness questions
SELECT 
  'M4_Q1' as question,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M4_Q1',
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as raw_value,
  public.normalize_mcq_value(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M4_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as normalized_value
UNION ALL
SELECT 
  'M4_Q2' as question,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M4_Q2',
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as raw_value,
  public.normalize_mcq_value(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M4_Q2',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as normalized_value
UNION ALL
SELECT 
  'M4_Q3' as question,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M4_Q3',
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as raw_value,
  public.normalize_mcq_value(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M4_Q3',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as normalized_value;

