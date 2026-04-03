-- Check if users have questionnaire data and what format it's in

-- Check onboarding_sections for these users
SELECT 
  user_id,
  section,
  jsonb_object_keys(answers) AS question_key,
  answers->jsonb_object_keys(answers) AS question_value
FROM onboarding_sections
WHERE user_id IN (
  '11111111-1111-4111-8111-111111111101',
  '11111111-1111-4111-8111-111111111104',
  '11111111-1111-4111-8111-111111111103'
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
  '11111111-1111-4111-8111-111111111101',
  '11111111-1111-4111-8111-111111111104',
  '11111111-1111-4111-8111-111111111103'
)
GROUP BY user_id;

-- Check what resolve_user_preferences actually returns
SELECT 
  '11111111-1111-4111-8111-111111111101'::UUID AS user_id,
  resolve_user_preferences('11111111-1111-4111-8111-111111111101'::UUID) AS resolved_prefs;

-- Check specific question keys that should exist
SELECT 
  'User A' AS label,
  get_dimension_value('11111111-1111-4111-8111-111111111101'::UUID, 'M4_Q1', NULL) AS M4_Q1,
  get_dimension_value('11111111-1111-4111-8111-111111111101'::UUID, 'M3_Q1', NULL) AS M3_Q1,
  get_dimension_value('11111111-1111-4111-8111-111111111101'::UUID, 'M5_Q3', NULL) AS M5_Q3,
  get_dimension_value('11111111-1111-4111-8111-111111111101'::UUID, 'M2_Q1', NULL) AS M2_Q1
UNION ALL
SELECT 
  'User B' AS label,
  get_dimension_value('11111111-1111-4111-8111-111111111104'::UUID, 'M4_Q1', NULL) AS M4_Q1,
  get_dimension_value('11111111-1111-4111-8111-111111111104'::UUID, 'M3_Q1', NULL) AS M3_Q1,
  get_dimension_value('11111111-1111-4111-8111-111111111104'::UUID, 'M5_Q3', NULL) AS M5_Q3,
  get_dimension_value('11111111-1111-4111-8111-111111111104'::UUID, 'M2_Q1', NULL) AS M2_Q1
UNION ALL
SELECT 
  'User C' AS label,
  get_dimension_value('11111111-1111-4111-8111-111111111103'::UUID, 'M4_Q1', NULL) AS M4_Q1,
  get_dimension_value('11111111-1111-4111-8111-111111111103'::UUID, 'M3_Q1', NULL) AS M3_Q1,
  get_dimension_value('11111111-1111-4111-8111-111111111103'::UUID, 'M5_Q3', NULL) AS M5_Q3,
  get_dimension_value('11111111-1111-4111-8111-111111111103'::UUID, 'M2_Q1', NULL) AS M2_Q1;


















