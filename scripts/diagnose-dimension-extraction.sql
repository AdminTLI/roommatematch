-- Diagnostic script to check if dimension extraction is working
-- Run this in Supabase SQL Editor

-- 1. Check if users have onboarding_sections data
SELECT 
  COUNT(DISTINCT user_id) as users_with_sections,
  COUNT(*) as total_sections
FROM onboarding_sections;

-- 2. Check what question keys exist in onboarding_sections
SELECT 
  DISTINCT jsonb_object_keys(answers) as question_key
FROM onboarding_sections
ORDER BY question_key
LIMIT 50;

-- 3. Check if the specific question keys used by dimensions exist
SELECT 
  'M4_Q1' as required_key,
  COUNT(*) as found_count,
  COUNT(DISTINCT user_id) as users_with_key
FROM onboarding_sections
WHERE answers ? 'M4_Q1'

UNION ALL

SELECT 
  'M3_Q1' as required_key,
  COUNT(*) as found_count,
  COUNT(DISTINCT user_id) as users_with_key
FROM onboarding_sections
WHERE answers ? 'M3_Q1'

UNION ALL

SELECT 
  'M2_Q1' as required_key,
  COUNT(*) as found_count,
  COUNT(DISTINCT user_id) as users_with_key
FROM onboarding_sections
WHERE answers ? 'M2_Q1';

-- 4. Test resolve_user_preferences for a specific user
-- Replace USER_ID_HERE with an actual user ID
SELECT 
  resolve_user_preferences('USER_ID_HERE') as resolved_prefs;

-- 5. Test dimension extraction for a specific user
-- Replace USER_ID_HERE with an actual user ID
SELECT 
  get_cleanliness_dimension('USER_ID_HERE') as cleanliness,
  get_noise_dimension('USER_ID_HERE') as noise,
  get_guests_dimension('USER_ID_HERE') as guests,
  get_sleep_dimension('USER_ID_HERE') as sleep;

-- 6. Test compatibility score calculation for a pair
-- Replace USER_A_ID and USER_B_ID with actual user IDs
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  dimension_scores_json
FROM compute_compatibility_score('USER_A_ID', 'USER_B_ID');















