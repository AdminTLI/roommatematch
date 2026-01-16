-- Fix existing notifications that show names when they shouldn't
-- This updates notifications that were created before the privacy fix

-- Update match_created notifications to use "someone" if the match isn't confirmed
UPDATE notifications n
SET message = 'You have matched with someone! Check out your matches to see who.'
FROM matches m
LEFT JOIN match_suggestions ms ON (
  ms.kind = 'pair' 
  AND ms.member_ids @> ARRAY[m.a_user] 
  AND ms.member_ids @> ARRAY[m.b_user]
  AND array_length(ms.member_ids, 1) = 2
  AND ms.status = 'confirmed'
)
WHERE n.type = 'match_created'
  AND n.metadata->>'match_id' = m.id::text
  AND (
    -- Match doesn't have a confirmed suggestion
    ms.id IS NULL
    OR ms.status != 'confirmed'
    OR (
      -- Check if both users are in accepted_by
      ms.accepted_by IS NULL
      OR array_length(ms.accepted_by, 1) < 2
      OR NOT (ms.member_ids[1] = ANY(ms.accepted_by) AND ms.member_ids[2] = ANY(ms.accepted_by))
    )
  )
  -- Only update if the message currently contains a name (not "someone")
  AND n.message NOT LIKE '%someone%'
  AND n.message LIKE '%You have a new match with%';

-- Verify the update
-- This query should return 0 rows if all notifications are fixed
SELECT n.id, n.message, m.id as match_id, ms.status as suggestion_status
FROM notifications n
JOIN matches m ON n.metadata->>'match_id' = m.id::text
LEFT JOIN match_suggestions ms ON (
  ms.kind = 'pair' 
  AND ms.member_ids @> ARRAY[m.a_user] 
  AND ms.member_ids @> ARRAY[m.b_user]
  AND array_length(ms.member_ids, 1) = 2
)
WHERE n.type = 'match_created'
  AND n.message LIKE '%You have a new match with%'
  AND n.message NOT LIKE '%someone%'
  AND (ms.id IS NULL OR ms.status != 'confirmed');



