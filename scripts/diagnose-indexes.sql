-- Diagnostic Query: Check what indexes actually exist
-- Run this to see the current state

-- 1. Check if tables exist
SELECT 
    'Table Check' as check_type,
    schemaname,
    tablename,
    CASE 
        WHEN tablename IS NOT NULL THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'match_suggestions',
        'messages',
        'chat_members',
        'profiles',
        'message_reads'
    )
ORDER BY tablename;

-- 2. List ALL indexes on these tables (not just our new ones)
SELECT 
    'All Indexes' as check_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN (
        'match_suggestions',
        'messages',
        'chat_members',
        'profiles',
        'message_reads'
    )
ORDER BY tablename, indexname;

-- 3. Specifically check for our new indexes
SELECT 
    'Our Indexes' as check_type,
    indexname,
    tablename,
    CASE 
        WHEN indexname IS NOT NULL THEN '✅ Found'
        ELSE '❌ Not Found'
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_match_suggestions_member_ids_gin',
        'idx_match_suggestions_status_created',
        'idx_match_suggestions_status_created_fit',
        'idx_messages_chat_created',
        'idx_messages_user_created',
        'idx_chat_members_user_chat',
        'idx_chat_members_chat_id',
        'idx_profiles_user_id',
        'idx_profiles_university_id',
        'idx_message_reads_message_user',
        'idx_message_reads_user_id'
    )
ORDER BY tablename, indexname;













