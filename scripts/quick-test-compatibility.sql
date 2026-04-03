-- Quick test to see if compatibility score function works
-- Replace USER_A_ID and USER_B_ID with actual user IDs

-- First, get two user IDs to test with
SELECT id, email FROM auth.users LIMIT 2;

-- Then test the compatibility function with those IDs
-- Replace the UUIDs below with the IDs from above
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  is_valid_match,
  dimension_scores_json
FROM compute_compatibility_score(
  '11111111-1111-4111-8111-111111111101'::uuid,  -- Replace with first user ID
  '11111111-1111-4111-8111-111111111102'::uuid   -- Replace with second user ID
);

-- Test resolve_user_preferences for one user
SELECT 
  resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid) as prefs;

-- Check if dealbreaker check passes
SELECT 
  check_hard_constraints(
    '11111111-1111-4111-8111-111111111101'::uuid,
    '11111111-1111-4111-8111-111111111102'::uuid
  ) as passes_dealbreakers;















