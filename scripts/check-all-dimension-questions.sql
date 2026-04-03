-- Check if all questions needed for dimensions are present in resolved preferences
-- Missing questions cause dimensions to default to 0.5, causing clustering

WITH required_questions AS (
  SELECT question_key, dimension FROM (
    VALUES 
      ('M4_Q1', 'cleanliness'), ('M4_Q2', 'cleanliness'), ('M4_Q3', 'cleanliness'),
      ('M4_Q4', 'cleanliness'), ('M4_Q5', 'cleanliness'), ('M4_Q13', 'cleanliness'), ('M4_Q23', 'cleanliness'),
      ('M3_Q1', 'noise'), ('M3_Q2', 'noise'), ('M3_Q4', 'noise'),
      ('M5_Q6', 'guests'), ('M5_Q9', 'guests'), ('M5_Q11', 'guests'), ('M5_Q16', 'guests'), ('M5_Q20', 'guests'),
      ('M2_Q1', 'sleep'), ('M2_Q2', 'sleep'),
      ('M7_Q1', 'shared_spaces'), ('M7_Q3', 'shared_spaces'), ('M7_Q4', 'shared_spaces'),
      ('M5_Q7', 'substances'), ('M5_Q11', 'substances'),
      ('M1_Q14', 'study_social'), ('M5_Q1', 'study_social'), ('M5_Q2', 'study_social'),
      ('M1_Q6', 'home_vibe')
  ) AS t(question_key, dimension)
),
resolved_prefs AS (
  SELECT public.resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid) as resolved
)
SELECT 
  rq.dimension,
  rq.question_key,
  CASE 
    WHEN rp.resolved ? rq.question_key AND rp.resolved->rq.question_key IS NOT NULL THEN 'Present'
    ELSE 'MISSING - will default to 0.5'
  END as status,
  CASE 
    WHEN rp.resolved ? rq.question_key AND rp.resolved->rq.question_key IS NOT NULL 
    THEN (rp.resolved->rq.question_key)::text
    ELSE 'N/A'
  END as value
FROM required_questions rq
CROSS JOIN resolved_prefs rp
ORDER BY rq.dimension, rq.question_key;






