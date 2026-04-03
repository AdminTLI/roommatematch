-- Check if all required questions for dimension calculation are present in resolved preferences
-- This will help identify if get_dimension_value is falling back incorrectly

WITH required_questions AS (
  SELECT question_key FROM (
    VALUES 
      ('M4_Q1'), ('M4_Q2'), ('M4_Q3'), ('M4_Q4'), ('M4_Q5'), ('M4_Q13'), ('M4_Q23'),  -- Cleanliness dimension inputs
      ('M3_Q1'), ('M3_Q2'), ('M3_Q4'),  -- Noise
      ('M5_Q6'), ('M5_Q9'), ('M5_Q11'), ('M5_Q16'), ('M5_Q20'),  -- Guests dimension (new M5)
      ('M2_Q1'), ('M2_Q2'),  -- Sleep
      ('M4_Q6'), ('M4_Q7'), ('M4_Q8'),  -- Chores / home ops (mapped keys)
      ('M5_Q7'), ('M5_Q11'),  -- Substances proxy (pre-drinks + party frequency)
      ('M1_Q6'), ('M1_Q10'), ('M1_Q14'), ('M5_Q1'), ('M5_Q2')  -- Study/social + home vibe
  ) AS t(question_key)
),
resolved_prefs AS (
  SELECT public.resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid) as resolved
)
SELECT 
  rq.question_key,
  CASE 
    WHEN rp.resolved ? rq.question_key THEN 'Present in resolved prefs'
    ELSE 'MISSING - will use fallback'
  END as status,
  CASE 
    WHEN rp.resolved ? rq.question_key AND rp.resolved->rq.question_key IS NOT NULL THEN (rp.resolved->rq.question_key)::text
    WHEN rp.resolved ? rq.question_key THEN '(null value)'
    ELSE 'N/A (not found)'
  END as value_in_resolved_prefs
FROM required_questions rq
CROSS JOIN resolved_prefs rp
ORDER BY status, rq.question_key;

