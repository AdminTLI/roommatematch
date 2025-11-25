-- Fix duplicate notifications and prevent future duplicates
-- This migration:
-- 1. Removes duplicate match_created notifications for the same match_id
-- 2. Adds a unique constraint to prevent future duplicates
-- 3. Updates the trigger to check for existing notifications before creating new ones

-- Step 1: Remove duplicate match_created notifications, keeping only the oldest one per match_id/user_id
DELETE FROM notifications n1
WHERE n1.type = 'match_created'
  AND EXISTS (
    SELECT 1 FROM notifications n2
    WHERE n2.user_id = n1.user_id
      AND n2.type = n1.type
      AND n2.metadata->>'match_id' = n1.metadata->>'match_id'
      AND n2.id < n1.id
  );

-- Step 2: Create a unique index to prevent duplicate match notifications
-- This ensures one notification per user per match_id for match_created type
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique_match_created
ON notifications (user_id, type, (metadata->>'match_id'))
WHERE type = 'match_created' AND metadata->>'match_id' IS NOT NULL;

-- Step 3: Update the trigger function to check for existing notifications before creating
CREATE OR REPLACE FUNCTION trigger_create_chat_on_match()
RETURNS TRIGGER AS $$
DECLARE
  chat_id UUID;
  user_a_name TEXT;
  user_b_name TEXT;
  existing_notification_a UUID;
  existing_notification_b UUID;
BEGIN
  -- Prevent self-matches
  IF NEW.a_user = NEW.b_user THEN
    RAISE EXCEPTION 'Cannot create match with yourself';
  END IF;

  -- Create chat for the match
  chat_id := create_chat_for_match(NEW.id, NEW.a_user, NEW.b_user);
  
  -- Get user names for notifications
  SELECT p1.first_name, p2.first_name
  INTO user_a_name, user_b_name
  FROM profiles p1, profiles p2
  WHERE p1.user_id = NEW.a_user AND p2.user_id = NEW.b_user;
  
  -- Check if notification already exists for user A
  SELECT id INTO existing_notification_a
  FROM notifications
  WHERE user_id = NEW.a_user
    AND type = 'match_created'
    AND metadata->>'match_id' = NEW.id::text
  LIMIT 1;
  
  -- Only create notification for user A if it doesn't exist
  IF existing_notification_a IS NULL THEN
    PERFORM create_notification(
      NEW.a_user,
      'match_created',
      'New Match Found!',
      'You have a new match with ' || COALESCE(user_b_name, 'a potential roommate') || '! Check out their profile.',
      jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.b_user)
    );
  END IF;
  
  -- Check if notification already exists for user B
  SELECT id INTO existing_notification_b
  FROM notifications
  WHERE user_id = NEW.b_user
    AND type = 'match_created'
    AND metadata->>'match_id' = NEW.id::text
  LIMIT 1;
  
  -- Only create notification for user B if it doesn't exist
  IF existing_notification_b IS NULL THEN
    PERFORM create_notification(
      NEW.b_user,
      'match_created', 
      'New Match Found!',
      'You have a new match with ' || COALESCE(user_a_name, 'a potential roommate') || '! Check out their profile.',
      jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.a_user)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


