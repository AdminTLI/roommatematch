-- Fix duplicate "someone" notifications
-- Remove duplicates, keeping only the oldest one per user pair

-- First, identify duplicates
WITH duplicates AS (
  SELECT 
    n.id,
    n.user_id,
    n.metadata->>'other_user_id' as other_user_id,
    n.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY n.user_id, n.metadata->>'other_user_id' 
      ORDER BY n.created_at ASC, n.id ASC
    ) as rn
  FROM notifications n
  WHERE n.type = 'match_created'
    AND n.message LIKE '%someone%'
    AND n.metadata->>'other_user_id' IS NOT NULL
)
-- Delete duplicates, keeping only the first one (rn = 1)
DELETE FROM notifications
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Show what was deleted
SELECT 
  COUNT(*) as deleted_count,
  'Duplicate "someone" notifications removed' as message
FROM notifications n1
WHERE n1.type = 'match_created'
  AND n1.message LIKE '%someone%'
  AND EXISTS (
    SELECT 1 FROM notifications n2
    WHERE n2.type = 'match_created'
      AND n2.message LIKE '%someone%'
      AND n2.user_id = n1.user_id
      AND n2.metadata->>'other_user_id' = n1.metadata->>'other_user_id'
      AND n2.id != n1.id
  );

