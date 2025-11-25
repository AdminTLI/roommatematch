-- Test script to verify notification fixes
-- Run this in Supabase SQL Editor to check the current state

-- 1. Check for duplicate notifications (should return 0 rows after migration)
SELECT 
  user_id, 
  metadata->>'other_user_id' as other_user_id,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at) as notification_ids
FROM notifications
WHERE type = 'match_created'
  AND metadata->>'other_user_id' IS NOT NULL
GROUP BY user_id, metadata->>'other_user_id'
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 10;

-- 2. Check if unique index exists
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'notifications'
  AND indexname LIKE '%unique%';

-- 3. Check trigger function exists and is updated
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'trigger_create_chat_on_match'
LIMIT 1;

-- 4. Count notifications without other_user_id (should be 0 after migration)
SELECT COUNT(*) as notifications_without_other_user_id
FROM notifications
WHERE type = 'match_created'
  AND (metadata->>'other_user_id' IS NULL OR metadata->>'other_user_id' = '');

-- 5. Sample notifications to check metadata structure
SELECT 
  id,
  user_id,
  type,
  metadata->>'match_id' as match_id,
  metadata->>'other_user_id' as other_user_id,
  created_at
FROM notifications
WHERE type = 'match_created'
ORDER BY created_at DESC
LIMIT 5;


