-- Quick diagnostic query to check compatibility scores for different user pairs
-- Run this to see what scores are being calculated

-- Check compatibility scores for the current user with different other users
-- Replace '2763f0a1-91fd-482c-81ed-f830327b2c2c' with your actual user ID if different

WITH user_pairs AS (
  SELECT DISTINCT
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID AS user_a_id,
    cm2.user_id AS user_b_id
  FROM chat_members cm1
  JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
  WHERE cm1.user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID
    AND cm2.user_id != '2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID
    AND cm1.chat_id IN (
      SELECT chat_id 
      FROM chat_members 
      WHERE user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID
      LIMIT 5
    )
)
SELECT 
  up.user_a_id,
  up.user_b_id,
  p_a.first_name || ' ' || COALESCE(p_a.last_name, '') AS user_a_name,
  p_b.first_name || ' ' || COALESCE(p_b.last_name, '') AS user_b_name,
  cs.compatibility_score,
  cs.harmony_score,
  cs.context_score,
  cs.dimension_scores_json,
  -- Check if users have questionnaire data
  (SELECT COUNT(*) FROM onboarding_sections WHERE user_id = up.user_a_id) AS user_a_sections_count,
  (SELECT COUNT(*) FROM onboarding_sections WHERE user_id = up.user_b_id) AS user_b_sections_count
FROM user_pairs up
CROSS JOIN LATERAL compute_compatibility_score(up.user_a_id, up.user_b_id) cs
LEFT JOIN profiles p_a ON p_a.user_id = up.user_a_id
LEFT JOIN profiles p_b ON p_b.user_id = up.user_b_id
ORDER BY cs.compatibility_score DESC;

-- Also check dimension values directly for these users
SELECT 
  'User A (2763f0a1...)' AS user_label,
  get_cleanliness_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID) AS cleanliness,
  get_noise_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID) AS noise,
  get_guests_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID) AS guests,
  get_sleep_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID) AS sleep
UNION ALL
SELECT 
  'User B (2652953c...)' AS user_label,
  get_cleanliness_dimension('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID) AS cleanliness,
  get_noise_dimension('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID) AS noise,
  get_guests_dimension('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID) AS guests,
  get_sleep_dimension('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID) AS sleep
UNION ALL
SELECT 
  'User C (2a90afca...)' AS user_label,
  get_cleanliness_dimension('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID) AS cleanliness,
  get_noise_dimension('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID) AS noise,
  get_guests_dimension('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID) AS guests,
  get_sleep_dimension('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID) AS sleep;




