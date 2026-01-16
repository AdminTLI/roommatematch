-- Check the specific chat that's missing from Confirmed tab
-- Replace YOUR_USER_ID with your user ID and OTHER_USER_ID with: 2a90afca-dbf3-433b-a968-cb0f7f6deca3

-- Check if there's any match_suggestion for this pair
SELECT 
    'Match Suggestions for Missing Chat' as section,
    ms.id,
    ms.kind,
    ms.status,
    ms.member_ids,
    ms.accepted_by,
    array_length(ms.member_ids, 1) as member_count,
    array_length(ms.accepted_by, 1) as accepted_count,
    ms.created_at,
    ms.expires_at,
    CASE 
        WHEN ms.status != 'confirmed' THEN 'Status is ' || ms.status || ' (needs to be confirmed)'
        WHEN ms.accepted_by IS NULL THEN 'accepted_by is NULL'
        WHEN NOT ('YOUR_USER_ID'::uuid = ANY(ms.accepted_by)) THEN 'User not in accepted_by'
        WHEN NOT ('2a90afca-dbf3-433b-a968-cb0f7f6deca3'::uuid = ANY(ms.accepted_by)) THEN 'Other user not in accepted_by'
        WHEN array_length(ms.accepted_by, 1) != array_length(ms.member_ids, 1) THEN 'Not all members accepted (accepted: ' || array_length(ms.accepted_by, 1) || ', members: ' || array_length(ms.member_ids, 1) || ')'
        ELSE 'Should be visible - unknown issue'
    END as issue_reason
FROM match_suggestions ms
WHERE ms.kind = 'pair'
AND (
    'YOUR_USER_ID'::uuid = ANY(ms.member_ids)  -- Replace with your user ID
    AND '2a90afca-dbf3-433b-a968-cb0f7f6deca3'::uuid = ANY(ms.member_ids)
)
ORDER BY ms.created_at DESC;
