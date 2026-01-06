-- Migration: Add notifications system and chat enhancements
-- Date: 2024-12-20
-- Description: Add notifications table, enhance chats table, and create triggers for automatic chat creation

-- Create notification types enum (only if it doesn't exist)
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'match_created',
    'match_accepted', 
    'match_confirmed',
    'chat_message',
    'profile_updated',
    'questionnaire_completed',
    'verification_status',
    'housing_update',
    'agreement_update',
    'safety_alert',
    'system_announcement'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create notifications table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new fields to chats table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'match_id') THEN
    ALTER TABLE chats ADD COLUMN match_id UUID REFERENCES matches(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'first_message_at') THEN
    ALTER TABLE chats ADD COLUMN first_message_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_chats_match_id ON chats(match_id);
CREATE INDEX IF NOT EXISTS idx_chats_first_message_at ON chats(first_message_at);

-- Create function to create chat for a match
CREATE OR REPLACE FUNCTION create_chat_for_match(
  p_match_id UUID,
  p_user_a UUID,
  p_user_b UUID
) RETURNS UUID AS $$
DECLARE
  chat_id UUID;
BEGIN
  -- Create chat room
  INSERT INTO chats (is_group, created_by, match_id)
  VALUES (false, p_user_a, p_match_id)
  RETURNING id INTO chat_id;
  
  -- Add both users as members
  INSERT INTO chat_members (chat_id, user_id)
  VALUES 
    (chat_id, p_user_a),
    (chat_id, p_user_b);
    
  RETURN chat_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to create chat for group match
CREATE OR REPLACE FUNCTION create_chat_for_group_match(
  p_group_id UUID,
  p_member_ids UUID[]
) RETURNS UUID AS $$
DECLARE
  chat_id UUID;
  member_id UUID;
BEGIN
  -- Create group chat room
  INSERT INTO chats (is_group, group_id, created_by, match_id)
  VALUES (true, p_group_id, p_member_ids[1], NULL)
  RETURNING id INTO chat_id;
  
  -- Add all members
  FOREACH member_id IN ARRAY p_member_ids
  LOOP
    INSERT INTO chat_members (chat_id, user_id)
    VALUES (chat_id, member_id);
  END LOOP;
    
  RETURN chat_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title VARCHAR(255),
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update first_message_at when first message is sent
CREATE OR REPLACE FUNCTION update_chat_first_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first message in the chat
  IF NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = NEW.chat_id 
    AND id != NEW.id
  ) THEN
    -- Update the chat's first_message_at timestamp
    UPDATE chats 
    SET first_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for first message
DROP TRIGGER IF EXISTS trigger_update_first_message ON messages;
CREATE TRIGGER trigger_update_first_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_first_message();

-- Create trigger for automatic chat creation when match is created
CREATE OR REPLACE FUNCTION trigger_create_chat_on_match()
RETURNS TRIGGER AS $$
DECLARE
  chat_id UUID;
  user_a_name TEXT;
  user_b_name TEXT;
  both_users_accepted BOOLEAN := false;
  suggestion_status TEXT;
  suggestion_accepted_by UUID[];
  suggestion_member_ids UUID[];
BEGIN
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
  
  -- Create notifications for both users
  -- Only show names if both users have accepted, otherwise use "someone"
  IF both_users_accepted THEN
    PERFORM create_notification(
      NEW.a_user,
      'match_created',
      'New Match Found!',
      'You have a new match with ' || COALESCE(user_b_name, 'someone') || '! Check out their profile.',
      jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.b_user)
    );
    
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
      NEW.a_user,
      'match_created',
      'New Match Found!',
      'You have matched with someone! Check out your matches to see who.',
      jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.b_user)
    );
    
    PERFORM create_notification(
      NEW.b_user,
      'match_created', 
      'New Match Found!',
      'You have matched with someone! Check out your matches to see who.',
      jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.a_user)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_chat_on_match_insert ON matches;
CREATE TRIGGER trigger_create_chat_on_match_insert
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_chat_on_match();

-- Create trigger for match status changes
CREATE OR REPLACE FUNCTION trigger_notify_match_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_a_name TEXT;
  user_b_name TEXT;
  other_user_id UUID;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get user names
  SELECT p1.first_name, p2.first_name
  INTO user_a_name, user_b_name
  FROM profiles p1, profiles p2
  WHERE p1.user_id = NEW.a_user AND p2.user_id = NEW.b_user;
  
  -- Handle different status changes
  IF NEW.status = 'accepted' THEN
    -- Notify the other user that their match was accepted
    -- IMPORTANT: Only one user has accepted so far, so don't show names - use "someone"
    other_user_id := CASE 
      WHEN NEW.a_user = OLD.a_user THEN NEW.b_user 
      ELSE NEW.a_user 
    END;
    
    PERFORM create_notification(
      other_user_id,
      'match_accepted',
      'Match Accepted!',
      'Someone accepted your match request!',
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.a_user)
    );
    
  ELSIF NEW.status = 'confirmed' THEN
    -- Notify both users that match is confirmed
    PERFORM create_notification(
      NEW.a_user,
      'match_confirmed',
      'Match Confirmed!',
      'It''s official! You and ' || COALESCE(user_b_name, 'your match') || ' are now matched.',
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.b_user)
    );
    
    PERFORM create_notification(
      NEW.b_user,
      'match_confirmed',
      'Match Confirmed!', 
      'It''s official! You and ' || COALESCE(user_a_name, 'your match') || ' are now matched.',
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.a_user)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_match_status_change ON matches;
CREATE TRIGGER trigger_notify_match_status_change
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_match_status_change();

-- Create trigger for group suggestion confirmation
CREATE OR REPLACE FUNCTION trigger_create_chat_on_group_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  chat_id UUID;
  member_names TEXT[];
  notification_title TEXT;
  notification_message TEXT;
  member_id UUID;
BEGIN
  -- Only proceed if status changed to confirmed
  IF OLD.status = NEW.status OR NEW.status != 'confirmed' THEN
    RETURN NEW;
  END IF;
  
  -- Create group chat
  chat_id := create_chat_for_group_match(NEW.id, NEW.member_ids);
  
  -- Get member names for notification
  SELECT ARRAY_AGG(p.first_name)
  INTO member_names
  FROM profiles p
  WHERE p.user_id = ANY(NEW.member_ids);
  
  -- Create notifications for all members
  FOREACH member_id IN ARRAY NEW.member_ids
  LOOP
    notification_title := 'Group Match Confirmed!';
    notification_message := 'Your group match is confirmed! You can now chat with your ' || 
                          (array_length(NEW.member_ids, 1) - 1) || ' potential roommates.';
    
    PERFORM create_notification(
      member_id,
      'match_confirmed',
      notification_title,
      notification_message,
      jsonb_build_object('group_id', NEW.id, 'chat_id', chat_id, 'member_count', array_length(NEW.member_ids, 1))
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_chat_on_group_confirmed ON group_suggestions;
CREATE TRIGGER trigger_create_chat_on_group_confirmed
  AFTER UPDATE ON group_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_chat_on_group_confirmed();

-- Add RLS policies for notifications
-- Note: Enabling RLS multiple times is safe and idempotent
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications for any user
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'User notifications for matches, chats, and system events';
COMMENT ON COLUMN notifications.type IS 'Type of notification for categorization and display';
COMMENT ON COLUMN notifications.metadata IS 'Additional data for notification actions and links';
COMMENT ON COLUMN chats.match_id IS 'Links chat to the match that created it';
COMMENT ON COLUMN chats.first_message_at IS 'Timestamp of first message, used to distinguish recently matched from active chats';
