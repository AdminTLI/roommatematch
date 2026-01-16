-- Analyze score clustering: check if harmony and context scores explain the 74% and 68% clustering

-- Calculate what harmony + context combinations produce 74% and 68%
-- Formula: global = 0.75 * harmony + 0.25 * context
-- So: context = (global - 0.75 * harmony) / 0.25

-- If global = 0.74 and harmony = 0.767:
-- context = (0.74 - 0.75 * 0.767) / 0.25 = (0.74 - 0.575) / 0.25 = 0.66

-- If global = 0.68 and harmony = 0.818:
-- context = (0.68 - 0.75 * 0.818) / 0.25 = (0.68 - 0.614) / 0.25 = 0.264

-- Check actual harmony and context score distribution
SELECT 
  ROUND(cs.harmony_score::numeric * 100, 1) as harmony_percent,
  ROUND(cs.context_score::numeric * 100, 1) as context_percent,
  ROUND(cs.compatibility_score::numeric * 100, 1) as compatibility_percent,
  COUNT(*) as match_count
FROM auth.users user_a
CROSS JOIN auth.users user_b
CROSS JOIN LATERAL public.compute_compatibility_score(user_a.id, user_b.id) cs
WHERE user_a.id != user_b.id
  AND cs.is_valid_match = true
  AND user_a.id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid
GROUP BY 
  ROUND(cs.harmony_score::numeric * 100, 1),
  ROUND(cs.context_score::numeric * 100, 1),
  ROUND(cs.compatibility_score::numeric * 100, 1)
ORDER BY match_count DESC
LIMIT 20;






