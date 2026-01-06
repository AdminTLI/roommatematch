-- Fix duplicate notifications - Version 2
-- This migration:
-- 1. Removes duplicate match_created notifications for the same user pair (not just match_id)
-- 2. Adds a unique constraint based on user_id + other_user_id to prevent duplicates
-- 3. Updates the trigger to check for existing notifications by user pair

-- Step 0: Drop any existing unique indexes FIRST (before deleting duplicates)
-- This allows the DELETE to work properly
DROP INDEX IF EXISTS idx_notifications_unique_match_created;
DROP INDEX IF EXISTS idx_notifications_unique_user_pair;

-- Step 1: Remove duplicate match_created notifications for the same user pair
-- First, try to infer other_user_id from match_id if it's missing
-- Then remove duplicates keeping only the oldest one per user pair

-- Update notifications to add other_user_id if missing
-- First, try to infer from matches table
UPDATE notifications n
SET metadata = jsonb_set(
  COALESCE(n.metadata, '{}'::jsonb),
  '{other_user_id}',
  to_jsonb(m.b_user::text)
)
FROM matches m
WHERE n.type = 'match_created'
  AND n.metadata->>'match_id' = m.id::text
  AND n.user_id = m.a_user
  AND (n.metadata->>'other_user_id' IS NULL OR n.metadata->>'other_user_id' = '');

UPDATE notifications n
SET metadata = jsonb_set(
  COALESCE(n.metadata, '{}'::jsonb),
  '{other_user_id}',
  to_jsonb(m.a_user::text)
)
FROM matches m
WHERE n.type = 'match_created'
  AND n.metadata->>'match_id' = m.id::text
  AND n.user_id = m.b_user
  AND (n.metadata->>'other_user_id' IS NULL OR n.metadata->>'other_user_id' = '');

-- Then, try to infer from match_suggestions table (for notifications created by cron)
UPDATE notifications n
SET metadata = jsonb_set(
  COALESCE(n.metadata, '{}'::jsonb),
  '{other_user_id}',
  to_jsonb(
    CASE 
      WHEN ms.member_ids[1] = n.user_id THEN ms.member_ids[2]::text
      ELSE ms.member_ids[1]::text
    END
  )
)
FROM match_suggestions ms
WHERE n.type = 'match_created'
  AND n.metadata->>'match_id' = ms.id::text
  AND n.user_id = ANY(ms.member_ids)
  AND array_length(ms.member_ids, 1) = 2
  AND (n.metadata->>'other_user_id' IS NULL OR n.metadata->>'other_user_id' = '');

-- Now remove duplicates based on user pair, keeping the oldest (by created_at)
-- Use a CTE to identify which notifications to keep (oldest per user pair)
WITH duplicates_to_keep AS (
  SELECT DISTINCT ON (n.user_id, n.metadata->>'other_user_id')
    n.id
  FROM notifications n
  WHERE n.type = 'match_created'
    AND n.metadata->>'other_user_id' IS NOT NULL
  ORDER BY n.user_id, n.metadata->>'other_user_id', n.created_at ASC, n.id ASC
)
DELETE FROM notifications n1
WHERE n1.type = 'match_created'
  AND n1.metadata->>'other_user_id' IS NOT NULL
  AND n1.id NOT IN (SELECT id FROM duplicates_to_keep);

-- Step 2: Verify no duplicates remain (for debugging - can be removed)
-- This query should return 0 rows
-- SELECT user_id, metadata->>'other_user_id', COUNT(*) 
-- FROM notifications 
-- WHERE type = 'match_created' AND metadata->>'other_user_id' IS NOT NULL
-- GROUP BY user_id, metadata->>'other_user_id' 
-- HAVING COUNT(*) > 1;

-- Step 3: Create a new unique index based on user pair (user_id + other_user_id)
-- This prevents duplicate notifications for the same user pair regardless of match_id/suggestion_id
-- Note: This will fail if duplicates still exist, so we ensure Step 1 removes them first
CREATE UNIQUE INDEX idx_notifications_unique_user_pair
ON notifications (user_id, type, (metadata->>'other_user_id'))
WHERE type = 'match_created' AND metadata->>'other_user_id' IS NOT NULL;

-- Step 4: Update the trigger function to check by user pair
CREATE OR REPLACE FUNCTION trigger_create_chat_on_match()
RETURNS TRIGGER AS $$
DECLARE
  chat_id UUID;
  user_a_name TEXT;
  user_b_name TEXT;
  existing_notification_a UUID;
  existing_notification_b UUID;
  both_users_accepted BOOLEAN := false;
  suggestion_status TEXT;
  suggestion_accepted_by UUID[];
  suggestion_member_ids UUID[];
BEGIN
  -- Prevent self-matches
  IF NEW.a_user = NEW.b_user THEN
    RAISE EXCEPTION 'Cannot create match with yourself';
  END IF;

  -- Create chat for the match
  chat_id := create_chat_for_match(NEW.id, NEW.a_user, NEW.b_user);
  
  -- STRICT RULE: Only show names if BOTH users have explicitly accepted
  -- Check if both users have accepted by looking at match_suggestions table
  -- Find the corresponding suggestion where member_ids contains both a_user and b_user
  SELECT status, accepted_by, member_ids
  INTO suggestion_status, suggestion_accepted_by, suggestion_member_ids
  FROM match_suggestions
  WHERE kind = 'pair'
    AND (member_ids @> ARRAY[NEW.a_user] AND member_ids @> ARRAY[NEW.b_user])
    AND array_length(member_ids, 1) = 2
    AND status = 'confirmed'  -- ONLY check confirmed suggestions
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if both users have accepted - STRICT: Only if status is 'confirmed'
  -- Default to false (don't show names) unless we're absolutely certain
  IF suggestion_status = 'confirmed' THEN
    -- Double-check that both users are in accepted_by array
    IF suggestion_accepted_by IS NOT NULL AND suggestion_member_ids IS NOT NULL THEN
      -- Verify both member_ids are in accepted_by array
      both_users_accepted := (
        array_length(suggestion_member_ids, 1) = 2 AND
        suggestion_member_ids[1] = ANY(suggestion_accepted_by) AND
        suggestion_member_ids[2] = ANY(suggestion_accepted_by) AND
        array_length(suggestion_accepted_by, 1) >= 2  -- At least 2 users accepted
      );
    END IF;
  END IF;
  
  -- If we couldn't find a confirmed suggestion, default to NOT showing names
  -- This is the safe default - only show names when we're certain both accepted
  
  -- Get user names for notifications (only if both users accepted)
  IF both_users_accepted THEN
    SELECT p1.first_name, p2.first_name
    INTO user_a_name, user_b_name
    FROM profiles p1, profiles p2
    WHERE p1.user_id = NEW.a_user AND p2.user_id = NEW.b_user;
  END IF;
  
  -- Check if notification already exists for user A with user B
  SELECT id INTO existing_notification_a
  FROM notifications
  WHERE user_id = NEW.a_user
    AND type = 'match_created'
    AND metadata->>'other_user_id' = NEW.b_user::text
  LIMIT 1;
  
  -- Only create notification for user A if it doesn't exist
  IF existing_notification_a IS NULL THEN
    IF both_users_accepted THEN
      PERFORM create_notification(
        NEW.a_user,
        'match_created',
        'New Match Found!',
        'You have a new match with ' || COALESCE(user_b_name, 'someone') || '! Check out their profile.',
        jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.b_user)
      );
    ELSE
      -- Not both accepted yet - use anonymous message
      PERFORM create_notification(
        NEW.a_user,
        'match_created',
        'New Match Found!',
        'You have matched with someone! Check out your matches to see who.',
        jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.b_user)
      );
    END IF;
  END IF;
  
  -- Check if notification already exists for user B with user A
  SELECT id INTO existing_notification_b
  FROM notifications
  WHERE user_id = NEW.b_user
    AND type = 'match_created'
    AND metadata->>'other_user_id' = NEW.a_user::text
  LIMIT 1;
  
  -- Only create notification for user B if it doesn't exist
  IF existing_notification_b IS NULL THEN
    IF both_users_accepted THEN
      PERFORM create_notification(
        NEW.b_user,
        'match_created', 
        'New Match Found!',
        'You have a new match with ' || COALESCE(user_a_name, 'someone') || '! Check out their profile.',
        jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.a_user)
      );
    ELSE
      -- Not both accepted yet - use anonymous message
      PERFORM create_notification(
        NEW.b_user,
        'match_created', 
        'New Match Found!',
        'You have matched with someone! Check out your matches to see who.',
        jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.a_user)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

