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
  '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,  -- Replace with first user ID
  '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid   -- Replace with second user ID
);

-- Test resolve_user_preferences for one user
SELECT 
  resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as prefs;

-- Check if dealbreaker check passes
SELECT 
  check_hard_constraints(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid
  ) as passes_dealbreakers;















