-- Diagnostic script to test dimension extraction and see what values are being returned
-- This will help identify why compatibility scores are clustering at 67% and 71%

-- Test 1: Check what resolve_user_preferences returns for a sample user
SELECT 
  'resolve_user_preferences test' as test_name,
  jsonb_object_keys(resolved) as question_key,
  resolved->jsonb_object_keys(resolved) as value
FROM (
  SELECT public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as resolved
) t
LIMIT 20;

-- Test 2: Check specific dimension extraction for cleanliness
SELECT 
  'cleanliness dimension' as test_name,
  public.get_cleanliness_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as user_a_value,
  public.get_cleanliness_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as user_b_value;

-- Test 3: Check all dimension values for two users
SELECT 
  'all dimensions' as test_name,
  public.get_cleanliness_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as cleanliness_a,
  public.get_noise_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as noise_a,
  public.get_guests_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as guests_a,
  public.get_sleep_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as sleep_a,
  public.get_cleanliness_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as cleanliness_b,
  public.get_noise_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as noise_b,
  public.get_guests_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as guests_b,
  public.get_sleep_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as sleep_b;

-- Test 4: Check compatibility score calculation
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  personality_score,
  schedule_score,
  lifestyle_score,
  social_score
FROM public.compute_compatibility_score(
  '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
  '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid
);

-- Test 5: Check what get_dimension_value returns for a specific question
SELECT 
  'M4_Q1 dimension value' as test_name,
  public.get_dimension_value(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    'M4_Q1',
    public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
  ) as value,
  jsonb_typeof(
    public.get_dimension_value(
      '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
      'M4_Q1',
      public.resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)
    )
  ) as value_type;

