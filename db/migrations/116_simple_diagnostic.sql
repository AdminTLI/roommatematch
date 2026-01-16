-- SIMPLE DIAGNOSTIC QUERY - Easy to run
-- 
-- STEP 1: Get your user ID by replacing your email below and running:
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- STEP 2: Copy the ID from above, then replace 'REPLACE_WITH_YOUR_USER_ID' below and run:

-- Simple query to see all chats and check for confirmed match_suggestions
SELECT 
    c.id as chat_id,
    c.is_group,
    c.match_id,
    c.created_at,
    -- Get the other user in this chat
    (SELECT user_id FROM chat_members cm2 
     WHERE cm2.chat_id = c.id 
     AND cm2.user_id != 'REPLACE_WITH_YOUR_USER_ID'::uuid  -- Replace with your user ID
     LIMIT 1) as other_user_id,
    -- Check if there's a confirmed match_suggestion
    EXISTS(
        SELECT 1 FROM match_suggestions ms 
        WHERE ms.kind = 'pair' 
        AND 'REPLACE_WITH_YOUR_USER_ID'::uuid = ANY(ms.member_ids)  -- Replace with your user ID
        AND (SELECT user_id FROM chat_members cm2 
             WHERE cm2.chat_id = c.id 
             AND cm2.user_id != 'REPLACE_WITH_YOUR_USER_ID'::uuid  -- Replace with your user ID
             LIMIT 1) = ANY(ms.member_ids)
        AND ms.status = 'confirmed'
        AND ms.accepted_by IS NOT NULL
        AND 'REPLACE_WITH_YOUR_USER_ID'::uuid = ANY(ms.accepted_by)  -- Replace with your user ID
        AND array_length(ms.accepted_by, 1) = array_length(ms.member_ids, 1)
    ) as has_confirmed_suggestion
FROM chats c
INNER JOIN chat_members cm ON c.id = cm.chat_id
WHERE cm.user_id = 'REPLACE_WITH_YOUR_USER_ID'::uuid  -- Replace with your user ID
AND c.is_group = false
ORDER BY c.created_at DESC;
