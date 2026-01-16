-- Diagnostic query to find why there's a mismatch between chats and confirmed matches
-- 
-- STEP 1: First, get your user ID by running this (replace with your email):
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
--
-- STEP 2: Copy your user ID from above, then replace 'YOUR_USER_ID_HERE' below with that UUID
-- For example: '550e8400-e29b-41d4-a716-446655440000'::uuid

-- Replace this with your actual user ID from Step 1:
\set user_id 'YOUR_USER_ID_HERE'::uuid

-- STEP 1: Get your user ID (replace email)
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- STEP 2: Replace YOUR_USER_ID_HERE below with the ID from Step 1, then run the queries below
-- Example format: '550e8400-e29b-41d4-a716-446655440000'

-- Check individual vs group chats
SELECT 
    'Chats Summary' as section,
    COUNT(*) FILTER (WHERE is_group = false) as individual_chats,
    COUNT(*) FILTER (WHERE is_group = true) as group_chats,
    COUNT(*) as total_chats
FROM chats c
WHERE EXISTS (
    SELECT 1 FROM chat_members cm 
    WHERE cm.chat_id = c.id 
    AND cm.user_id = 'YOUR_USER_ID_HERE'::uuid  -- Replace with your user ID from Step 1
);

-- Find all individual chats and their match status
SELECT 
    'All Individual Chats' as section,
    c.id as chat_id,
    c.is_group,
    c.match_id,
    c.created_at as chat_created_at,
    m.id as match_record_id,
    m.status as match_status,
    m.a_user,
    m.b_user,
    -- Get other user ID from chat_members
    (SELECT user_id FROM chat_members WHERE chat_id = c.id AND user_id != 'YOUR_USER_ID_HERE'::uuid LIMIT 1) as other_user_id,
    -- Check for match_suggestions
    (SELECT COUNT(*) FROM match_suggestions ms 
     WHERE ms.kind = 'pair' 
     AND 'YOUR_USER_ID_HERE'::uuid = ANY(ms.member_ids)
     AND (SELECT user_id FROM chat_members WHERE chat_id = c.id AND user_id != 'YOUR_USER_ID_HERE'::uuid LIMIT 1) = ANY(ms.member_ids)
     AND ms.status = 'confirmed') as confirmed_suggestions_count
FROM chats c
INNER JOIN chat_members cm ON c.id = cm.chat_id
LEFT JOIN matches m ON c.match_id = m.id
WHERE cm.user_id = 'YOUR_USER_ID_HERE'::uuid  -- Replace with your user ID
AND c.is_group = false  -- Only individual chats
ORDER BY c.created_at DESC;

-- Find individual chats that don't have a corresponding confirmed match_suggestion
-- (These are the ones that might be missing from the Confirmed tab)
WITH chat_users AS (
    SELECT 
        c.id as chat_id,
        c.match_id,
        cm.user_id,
        (SELECT user_id FROM chat_members cm2 WHERE cm2.chat_id = c.id AND cm2.user_id != cm.user_id LIMIT 1) as other_user_id
    FROM chats c
    INNER JOIN chat_members cm ON c.id = cm.chat_id
    WHERE cm.user_id = 'YOUR_USER_ID_HERE'::uuid  -- Replace with your user ID
    AND c.is_group = false
)
SELECT 
    'Potentially Missing from Confirmed Tab' as section,
    cu.chat_id,
    cu.match_id,
    cu.other_user_id,
    ms.id as suggestion_id,
    ms.status as suggestion_status,
    ms.accepted_by,
    ms.member_ids,
    array_length(ms.member_ids, 1) as member_count,
    array_length(ms.accepted_by, 1) as accepted_count,
    CASE 
        WHEN ms.id IS NULL THEN 'No match_suggestion found'
        WHEN ms.status != 'confirmed' THEN 'Suggestion status is ' || ms.status
        WHEN ms.accepted_by IS NULL THEN 'accepted_by is NULL'
        WHEN NOT (auth.uid() = ANY(ms.accepted_by)) THEN 'User not in accepted_by'
        WHEN array_length(ms.accepted_by, 1) != array_length(ms.member_ids, 1) THEN 'Not all members accepted'
        ELSE 'Should be visible - check other conditions'
    END as issue_reason
FROM chat_users cu
LEFT JOIN match_suggestions ms ON (
    ms.kind = 'pair'
    AND 'YOUR_USER_ID_HERE'::uuid = ANY(ms.member_ids)  -- Replace with your user ID
    AND cu.other_user_id = ANY(ms.member_ids)
    AND array_length(ms.member_ids, 1) = 2
)
WHERE (
    ms.id IS NULL  -- No matching suggestion found
    OR ms.status != 'confirmed'  -- Or suggestion is not confirmed
    OR (ms.accepted_by IS NULL OR NOT ('YOUR_USER_ID_HERE'::uuid = ANY(ms.accepted_by)))  -- Replace with your user ID
    OR (ms.accepted_by IS NOT NULL AND array_length(ms.accepted_by, 1) != array_length(ms.member_ids, 1))  -- Or not all members accepted
)
ORDER BY cu.chat_id;
