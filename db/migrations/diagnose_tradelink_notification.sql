-- Diagnostic query to check the "Tradelink" notification
-- This will help us understand if it's a legitimate confirmed match or needs to be fixed

-- Find notifications with "Tradelink" in the message
SELECT 
  n.id,
  n.user_id,
  n.type,
  n.title,
  n.message,
  n.created_at,
  n.metadata->>'match_id' as match_id,
  n.metadata->>'other_user_id' as other_user_id,
  m.a_user,
  m.b_user,
  m.status as match_status,
  ms.id as suggestion_id,
  ms.status as suggestion_status,
  ms.accepted_by,
  ms.member_ids as suggestion_member_ids,
  CASE 
    WHEN ms.status = 'confirmed' 
      AND ms.accepted_by IS NOT NULL 
      AND array_length(ms.accepted_by, 1) >= 2
      AND ms.member_ids[1] = ANY(ms.accepted_by)
      AND ms.member_ids[2] = ANY(ms.accepted_by)
    THEN 'LEGITIMATE - Both users accepted'
    ELSE 'SHOULD BE ANONYMOUS - Not confirmed or not both accepted'
  END as privacy_status
FROM notifications n
LEFT JOIN matches m ON n.metadata->>'match_id' = m.id::text
LEFT JOIN match_suggestions ms ON (
  ms.kind = 'pair'
  AND ms.member_ids @> ARRAY[m.a_user]
  AND ms.member_ids @> ARRAY[m.b_user]
  AND array_length(ms.member_ids, 1) = 2
)
WHERE n.message LIKE '%Tradelink%'
  OR n.message LIKE '%You have a new match with%'
ORDER BY n.created_at DESC;

