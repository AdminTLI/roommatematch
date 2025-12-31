-- Diagnostic script to test resolve_user_preferences function
-- Run this in Supabase SQL Editor to verify the function works

-- Replace USER_ID_HERE with an actual user ID from your database
-- You can get a user ID with: SELECT id FROM auth.users LIMIT 1;

-- Test 1: Check if function exists
SELECT 
  proname as function_name,
  pronargs as arg_count,
  proargtypes::regtype[] as arg_types
FROM pg_proc
WHERE proname = 'resolve_user_preferences';

-- Test 2: Check what answers are stored for a user
SELECT 
  section,
  jsonb_typeof(answers) as answers_type,
  jsonb_array_length(answers) as array_length,
  answers
FROM onboarding_sections
WHERE user_id = 'USER_ID_HERE'  -- Replace with actual user ID
LIMIT 5;

-- Test 3: Test resolve_user_preferences function
SELECT 
  resolve_user_preferences('USER_ID_HERE') as resolved_prefs;  -- Replace with actual user ID

-- Test 4: Check if specific question keys are extracted
SELECT 
  resolve_user_preferences('USER_ID_HERE')->'M4_Q1' as M4_Q1_value,
  resolve_user_preferences('USER_ID_HERE')->'M3_Q1' as M3_Q1_value,
  resolve_user_preferences('USER_ID_HERE')->'M2_Q1' as M2_Q1_value,
  resolve_user_preferences('USER_ID_HERE')->'M8_Q8' as M8_Q8_value;

-- Test 5: Test dimension extraction
SELECT 
  get_cleanliness_dimension('USER_ID_HERE') as cleanliness,
  get_noise_dimension('USER_ID_HERE') as noise,
  get_guests_dimension('USER_ID_HERE') as guests,
  get_sleep_dimension('USER_ID_HERE') as sleep;

-- Test 6: Test compatibility score calculation
-- Replace USER_A_ID and USER_B_ID with actual user IDs
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  is_valid_match,
  dimension_scores_json
FROM compute_compatibility_score('USER_A_ID', 'USER_B_ID');













