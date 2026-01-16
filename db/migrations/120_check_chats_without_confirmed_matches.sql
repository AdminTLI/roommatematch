-- Check which chats don't have confirmed match_suggestions
-- Replace YOUR_USER_ID with your actual user ID

-- Check all your chats and whether they have confirmed match_suggestions
SELECT 
    c.id as chat_id,
    c.is_group,
    c.created_at as chat_created_at,
    -- Get the other user in this chat
    (SELECT user_id FROM chat_members cm2 
     WHERE cm2.chat_id = c.id 
     AND cm2.user_id != 'YOUR_USER_ID'::uuid  -- Replace with your user ID
     LIMIT 1) as other_user_id,
    -- Check if there's a confirmed match_suggestion
    EXISTS(
        SELECT 1 FROM match_suggestions ms 
        WHERE ms.kind = 'pair' 
        AND 'YOUR_USER_ID'::uuid = ANY(ms.member_ids)  -- Replace with your user ID
        AND (SELECT user_id FROM chat_members cm2 
             WHERE cm2.chat_id = c.id 
             AND cm2.user_id != 'YOUR_USER_ID'::uuid  -- Replace with your user ID
             LIMIT 1) = ANY(ms.member_ids)
        AND ms.status = 'confirmed'
        AND ms.accepted_by IS NOT NULL
        AND 'YOUR_USER_ID'::uuid = ANY(ms.accepted_by)  -- Replace with your user ID
        AND array_length(ms.accepted_by, 1) = array_length(ms.member_ids, 1)
    ) as has_confirmed_suggestion,
    -- Also check if there's ANY match_suggestion (to see what status it has)
    (
        SELECT ms.status
        FROM match_suggestions ms 
        WHERE ms.kind = 'pair' 
        AND 'YOUR_USER_ID'::uuid = ANY(ms.member_ids)  -- Replace with your user ID
        AND (SELECT user_id FROM chat_members cm2 
             WHERE cm2.chat_id = c.id 
             AND cm2.user_id != 'YOUR_USER_ID'::uuid  -- Replace with your user ID
             LIMIT 1) = ANY(ms.member_ids)
        ORDER BY ms.created_at DESC
        LIMIT 1
    ) as latest_suggestion_status,
    -- Check if chat has any messages (to determine if it's "recently matched" or "active")
    (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.chat_id = c.id
        AND m.user_id != '00000000-0000-0000-0000-000000000000'::uuid  -- Exclude system messages if user_id is null/UUID zero
    ) as message_count,
    -- Check first message to see if it's a system greeting
    (
        SELECT m.content
        FROM messages m
        WHERE m.chat_id = c.id
        ORDER BY m.created_at ASC
        LIMIT 1
    ) as first_message_content
FROM chats c
INNER JOIN chat_members cm ON c.id = cm.chat_id
WHERE cm.user_id = 'YOUR_USER_ID'::uuid  -- Replace with your user ID
AND c.is_group = false
ORDER BY c.created_at DESC;
