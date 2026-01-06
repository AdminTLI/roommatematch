-- Final fix: Update ALL match_created notifications to use "someone" 
-- UNLESS we can verify with 100% certainty that both users accepted (status = 'confirmed')
-- This handles both notifications created from matches table AND from match_suggestions (cron job)

-- First, fix notifications that reference match_suggestions (cron job created these with suggestion ID as match_id)
UPDATE notifications n
SET message = 'You have matched with someone! Check out your matches to see who.'
FROM match_suggestions ms
WHERE n.type = 'match_created'
  AND n.metadata->>'match_id' = ms.id::text
  AND (
    -- Suggestion is not confirmed OR both users haven't accepted
    ms.status != 'confirmed'
    OR ms.accepted_by IS NULL
    OR array_length(ms.accepted_by, 1) < 2
    OR NOT (ms.member_ids[1] = ANY(ms.accepted_by) AND ms.member_ids[2] = ANY(ms.accepted_by))
  )
  -- Only update if the message currently contains a name (not "someone")
  AND n.message NOT LIKE '%someone%'
  AND n.message LIKE '%You have a new match with%';

-- Second, fix notifications that reference matches table (trigger created these)
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

-- Report what was updated
SELECT 
  COUNT(*) as total_notifications_with_names,
  'Notifications that still have names (should be 0 if fix worked)' as message
FROM notifications n
WHERE n.type = 'match_created'
  AND n.message LIKE '%You have a new match with%'
  AND n.message NOT LIKE '%someone%';

