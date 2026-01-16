-- Test compatibility scores for multiple user pairs
-- This will help us see if scores are actually varying or if users just have similar answers

-- First, get a list of user IDs to test with
SELECT id, email FROM auth.users LIMIT 5;

-- Then test compatibility between different pairs
-- Replace the UUIDs with actual user IDs from above

-- Test Pair 1: Your original pair
SELECT 
  'Pair 1' as pair_label,
  '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid as user_a,
  '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid as user_b,
  compatibility_score,
  harmony_score,
  context_score
FROM compute_compatibility_score(
  '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
  '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid
)

UNION ALL

-- Test Pair 2: Try with different users (replace with actual IDs)
SELECT 
  'Pair 2' as pair_label,
  'USER_ID_1'::uuid as user_a,
  'USER_ID_2'::uuid as user_b,
  compatibility_score,
  harmony_score,
  context_score
FROM compute_compatibility_score(
  'USER_ID_1'::uuid,  -- Replace with actual user ID
  'USER_ID_2'::uuid   -- Replace with actual user ID
);

-- Also check what dimension values are being extracted for different users
-- This will show if users have different answers
SELECT 
  'User A' as user_label,
  get_cleanliness_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as cleanliness,
  get_noise_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as noise,
  get_guests_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as guests,
  get_sleep_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as sleep

UNION ALL

SELECT 
  'User B' as user_label,
  get_cleanliness_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as cleanliness,
  get_noise_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as noise,
  get_guests_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as guests,
  get_sleep_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as sleep;















