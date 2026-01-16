-- Simple fix: Update ALL match_created notifications to use "someone" 
-- unless we can verify the match is confirmed
-- This is a safe approach - better to be anonymous than show names incorrectly

UPDATE notifications n
SET message = 'You have matched with someone! Check out your matches to see who.'
FROM matches m
LEFT JOIN match_suggestions ms ON (
  ms.kind = 'pair' 
  AND ms.member_ids @> ARRAY[m.a_user] 
  AND ms.member_ids @> ARRAY[m.b_user]
  AND array_length(ms.member_ids, 1) = 2
  AND ms.status = 'confirmed'
  AND ms.accepted_by IS NOT NULL
  AND array_length(ms.accepted_by, 1) >= 2
  AND ms.member_ids[1] = ANY(ms.accepted_by)
  AND ms.member_ids[2] = ANY(ms.accepted_by)
)
WHERE n.type = 'match_created'
  AND n.metadata->>'match_id' = m.id::text
  AND (
    -- Match doesn't have a confirmed suggestion with both users accepted
    ms.id IS NULL
  )
  -- Only update if the message currently contains a name (not "someone")
  AND n.message NOT LIKE '%someone%'
  AND n.message LIKE '%You have a new match with%';

-- Show what was updated (for verification)
SELECT 
  n.id,
  n.message as old_message,
  'You have matched with someone! Check out your matches to see who.' as new_message,
  m.id as match_id,
  ms.status as suggestion_status
FROM notifications n
JOIN matches m ON n.metadata->>'match_id' = m.id::text
LEFT JOIN match_suggestions ms ON (
  ms.kind = 'pair' 
  AND ms.member_ids @> ARRAY[m.a_user] 
  AND ms.member_ids @> ARRAY[m.b_user]
  AND array_length(ms.member_ids, 1) = 2
  AND ms.status = 'confirmed'
)
WHERE n.type = 'match_created'
  AND n.message LIKE '%You have a new match with%'
  AND n.message NOT LIKE '%someone%'
  AND ms.id IS NULL;



