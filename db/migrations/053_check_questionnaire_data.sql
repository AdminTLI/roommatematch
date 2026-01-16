-- Check if users have questionnaire data and what format it's in

-- Check onboarding_sections for these users
SELECT 
  user_id,
  section,
  jsonb_object_keys(answers) AS question_key,
  answers->jsonb_object_keys(answers) AS question_value
FROM onboarding_sections
WHERE user_id IN (
  '2763f0a1-91fd-482c-81ed-f830327b2c2c',
  '2652953c-7365-4ebf-8be9-b443a7c9f182',
  '2a90afca-dbf3-433b-a968-cb0f7f6deca3'
)
ORDER BY user_id, section, question_key
LIMIT 50;

-- Count sections per user
SELECT 
  user_id,
  COUNT(*) AS section_count,
  array_agg(section ORDER BY section) AS sections
FROM onboarding_sections
WHERE user_id IN (
  '2763f0a1-91fd-482c-81ed-f830327b2c2c',
  '2652953c-7365-4ebf-8be9-b443a7c9f182',
  '2a90afca-dbf3-433b-a968-cb0f7f6deca3'
)
GROUP BY user_id;

-- Check what resolve_user_preferences actually returns
SELECT 
  '2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID AS user_id,
  resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID) AS resolved_prefs;

-- Check specific question keys that should exist
SELECT 
  'User A' AS label,
  get_dimension_value('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID, 'M4_Q1', NULL) AS M4_Q1,
  get_dimension_value('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID, 'M3_Q1', NULL) AS M3_Q1,
  get_dimension_value('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID, 'M5_Q3', NULL) AS M5_Q3,
  get_dimension_value('2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID, 'M2_Q1', NULL) AS M2_Q1
UNION ALL
SELECT 
  'User B' AS label,
  get_dimension_value('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID, 'M4_Q1', NULL) AS M4_Q1,
  get_dimension_value('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID, 'M3_Q1', NULL) AS M3_Q1,
  get_dimension_value('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID, 'M5_Q3', NULL) AS M5_Q3,
  get_dimension_value('2652953c-7365-4ebf-8be9-b443a7c9f182'::UUID, 'M2_Q1', NULL) AS M2_Q1
UNION ALL
SELECT 
  'User C' AS label,
  get_dimension_value('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID, 'M4_Q1', NULL) AS M4_Q1,
  get_dimension_value('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID, 'M3_Q1', NULL) AS M3_Q1,
  get_dimension_value('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID, 'M5_Q3', NULL) AS M5_Q3,
  get_dimension_value('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::UUID, 'M2_Q1', NULL) AS M2_Q1;


















