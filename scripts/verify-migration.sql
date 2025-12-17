-- Verification Script for Migration 112
-- Run this in Supabase SQL Editor after running the migration
-- This verifies all indexes were created successfully

-- 1. Check if all indexes exist
SELECT 
    'Index Check' as check_type,
    indexname,
    tablename,
    CASE 
        WHEN indexname IS NOT NULL THEN '✅ Created'
        ELSE '❌ Missing'
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

-- 2. Check index definitions
SELECT 
    'Index Definition' as check_type,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
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

-- 3. Check table sizes (to understand index impact)
SELECT 
    'Table Size' as check_type,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'match_suggestions',
        'messages',
        'chat_members',
        'profiles',
        'message_reads'
    )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Check if GIN extension is available (required for member_ids index)
SELECT 
    'Extension Check' as check_type,
    extname,
    extversion,
    CASE 
        WHEN extname = 'vector' THEN '✅ Available'
        ELSE '⚠️ Check if needed'
    END as status
FROM pg_extension
WHERE extname IN ('vector', 'pg_trgm');

-- Expected Results:
-- 1. All 11 indexes should be listed with "✅ Created" status
--    Note: match_suggestions uses member_ids array (UUID[]), not user_id column
--    The GIN index on member_ids enables efficient array containment queries
-- 2. Index definitions should match the migration file
-- 3. Table sizes help understand index creation time
-- 4. Vector extension should be available for GIN indexes

