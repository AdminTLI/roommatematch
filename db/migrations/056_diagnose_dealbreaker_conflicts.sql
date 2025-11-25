-- Diagnostic query to identify why dealbreakers are failing
-- Replace the UUIDs with your actual user IDs

WITH user_pair AS (
  SELECT 
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::UUID AS user_a_id,  -- Replace with your user ID
    '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::UUID AS user_b_id   -- Replace with other user ID
),
prefs AS (
  SELECT 
    up.user_a_id,
    up.user_b_id,
    resolve_user_preferences(up.user_a_id) AS a_prefs,
    resolve_user_preferences(up.user_b_id) AS b_prefs
  FROM user_pair up
)
-- Smoking check (includes both M8_Q8 rule preference and actual smoking status)
SELECT 
  'SMOKING (M8_Q8 + smoking_preference)' AS check_type,
  jsonb_build_object(
    'M8_Q8', p.a_prefs->'M8_Q8',
    'smoking_preference', (SELECT smoking_preference FROM user_housing_preferences WHERE user_id = p.user_a_id)
  ) AS a_raw_value,
  jsonb_build_object(
    'M8_Q8', p.b_prefs->'M8_Q8',
    'smoking_preference', (SELECT smoking_preference FROM user_housing_preferences WHERE user_id = p.user_b_id)
  ) AS b_raw_value,
  'object'::TEXT AS a_type,
  'object'::TEXT AS b_type,
  jsonb_build_object(
    'M8_Q8_wants_no_smoking', extract_boolean_value(p.a_prefs->'M8_Q8')::TEXT,
    'is_smoker', CASE WHEN (SELECT smoking_preference FROM user_housing_preferences WHERE user_id = p.user_a_id) = 'smoking_ok' THEN 'true' ELSE 'false' END
  )::TEXT AS a_extracted,
  jsonb_build_object(
    'M8_Q8_wants_no_smoking', extract_boolean_value(p.b_prefs->'M8_Q8')::TEXT,
    'is_smoker', CASE WHEN (SELECT smoking_preference FROM user_housing_preferences WHERE user_id = p.user_b_id) = 'smoking_ok' THEN 'true' ELSE 'false' END
  )::TEXT AS b_extracted,
  CASE 
    WHEN extract_boolean_value(p.a_prefs->'M8_Q8') = true AND 
         (SELECT smoking_preference FROM user_housing_preferences WHERE user_id = p.user_b_id) = 'smoking_ok' THEN 'CONFLICT: A wants no smoking, B is a smoker'
    WHEN extract_boolean_value(p.b_prefs->'M8_Q8') = true AND 
         (SELECT smoking_preference FROM user_housing_preferences WHERE user_id = p.user_a_id) = 'smoking_ok' THEN 'CONFLICT: B wants no smoking, A is a smoker'
    WHEN extract_boolean_value(p.a_prefs->'M8_Q8') = true AND extract_boolean_value(p.b_prefs->'M8_Q8') = false THEN 'POTENTIAL CONFLICT: A wants no smoking rule, B doesn''t (but B may not be a smoker)'
    WHEN extract_boolean_value(p.b_prefs->'M8_Q8') = true AND extract_boolean_value(p.a_prefs->'M8_Q8') = false THEN 'POTENTIAL CONFLICT: B wants no smoking rule, A doesn''t (but A may not be a smoker)'
    ELSE 'OK - No conflict'
  END AS status
FROM prefs p

UNION ALL

-- Pet preference check
SELECT 
  'PETS (M8_Q14)' AS check_type,
  p.a_prefs->'M8_Q14' AS a_raw_value,
  p.b_prefs->'M8_Q14' AS b_raw_value,
  jsonb_typeof(p.a_prefs->'M8_Q14') AS a_type,
  jsonb_typeof(p.b_prefs->'M8_Q14') AS b_type,
  normalize_bipolar_value(p.a_prefs->'M8_Q14')::TEXT AS a_extracted,
  normalize_bipolar_value(p.b_prefs->'M8_Q14')::TEXT AS b_extracted,
  CASE 
    WHEN normalize_bipolar_value(p.a_prefs->'M8_Q14') < 0.3 THEN 'A prefers no pets'
    WHEN normalize_bipolar_value(p.a_prefs->'M8_Q14') > 0.7 THEN 'A wants pets'
    ELSE 'A neutral on pets'
  END AS status
FROM prefs p

UNION ALL

-- Pet toggles check
SELECT 
  'PET TOGGLES (M8_Q15/16/17)' AS check_type,
  jsonb_build_object(
    'M8_Q15', p.a_prefs->'M8_Q15',
    'M8_Q16', p.a_prefs->'M8_Q16',
    'M8_Q17', p.a_prefs->'M8_Q17'
  ) AS a_raw_value,
  jsonb_build_object(
    'M8_Q15', p.b_prefs->'M8_Q15',
    'M8_Q16', p.b_prefs->'M8_Q16',
    'M8_Q17', p.b_prefs->'M8_Q17'
  ) AS b_raw_value,
  'object'::TEXT AS a_type,
  'object'::TEXT AS b_type,
  jsonb_build_object(
    'M8_Q15', extract_boolean_value(p.a_prefs->'M8_Q15'),
    'M8_Q16', extract_boolean_value(p.a_prefs->'M8_Q16'),
    'M8_Q17', extract_boolean_value(p.a_prefs->'M8_Q17')
  )::TEXT AS a_extracted,
  jsonb_build_object(
    'M8_Q15', extract_boolean_value(p.b_prefs->'M8_Q15'),
    'M8_Q16', extract_boolean_value(p.b_prefs->'M8_Q16'),
    'M8_Q17', extract_boolean_value(p.b_prefs->'M8_Q17')
  )::TEXT AS b_extracted,
  CASE 
    WHEN normalize_bipolar_value(p.a_prefs->'M8_Q14') < 0.3 AND 
         (normalize_bipolar_value(p.b_prefs->'M8_Q14') > 0.7 OR
          extract_boolean_value(p.b_prefs->'M8_Q15') = true OR
          extract_boolean_value(p.b_prefs->'M8_Q16') = true OR
          extract_boolean_value(p.b_prefs->'M8_Q17') = true) THEN 'CONFLICT: A no pets, B wants pets'
    WHEN normalize_bipolar_value(p.b_prefs->'M8_Q14') < 0.3 AND 
         (normalize_bipolar_value(p.a_prefs->'M8_Q14') > 0.7 OR
          extract_boolean_value(p.a_prefs->'M8_Q15') = true OR
          extract_boolean_value(p.a_prefs->'M8_Q16') = true OR
          extract_boolean_value(p.a_prefs->'M8_Q17') = true) THEN 'CONFLICT: B no pets, A wants pets'
    ELSE 'OK - No conflict'
  END AS status
FROM prefs p

UNION ALL

-- Overall dealbreaker check
SELECT 
  'OVERALL DEALBREAKER CHECK' AS check_type,
  NULL::JSONB AS a_raw_value,
  NULL::JSONB AS b_raw_value,
  NULL::TEXT AS a_type,
  NULL::TEXT AS b_type,
  check_hard_constraints(
    (SELECT user_a_id FROM user_pair),
    (SELECT user_b_id FROM user_pair)
  )::TEXT AS a_extracted,
  NULL::TEXT AS b_extracted,
  CASE 
    WHEN check_hard_constraints(
      (SELECT user_a_id FROM user_pair),
      (SELECT user_b_id FROM user_pair)
    ) = true THEN 'PASS - No dealbreakers'
    ELSE 'FAIL - Dealbreaker conflict detected'
  END AS status
FROM prefs p;

