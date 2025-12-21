-- Simple Index Check
-- Run this to see if indexes were created

-- Check all indexes on our tables
SELECT 
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
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;











