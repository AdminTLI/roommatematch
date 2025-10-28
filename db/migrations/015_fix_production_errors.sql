-- Migration: Fix critical production errors
-- Date: 2025-10-28
-- Description: Fix chat_members RLS infinite recursion, ensure notifications table exists, and clean up policies

BEGIN;

-- ========================================
-- 1. FIX CHAT_MEMBERS RLS INFINITE RECURSION
-- ========================================

-- Drop all existing problematic chat_members policies
DROP POLICY IF EXISTS "Users can see chat members for their chats" ON chat_members;
DROP POLICY IF EXISTS "Chat members can manage membership" ON chat_members;
DROP POLICY IF EXISTS "chat_members_participants_read" ON chat_members;
DROP POLICY IF EXISTS "chat_members_participants_own" ON chat_members;

-- Create security definer function to check chat membership without recursion
-- This breaks the recursion by executing with elevated privileges
CREATE OR REPLACE FUNCTION user_is_chat_member(target_chat_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_members
    WHERE chat_id = target_chat_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION user_is_chat_member TO authenticated;

-- Create clean, non-recursive policies for chat_members
CREATE POLICY "chat_members_view_own" ON chat_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chats c
      WHERE c.id = chat_members.chat_id 
      AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "chat_members_manage_own" ON chat_members
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chats c
      WHERE c.id = chat_members.chat_id
      AND c.created_by = auth.uid()
    )
  );

-- ========================================
-- 2. ENSURE NOTIFICATIONS TABLE EXISTS
-- ========================================

-- Create notification_type enum if it doesn't exist
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

-- Create notifications table if it doesn't exist
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop any existing notification policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

-- Create RLS policies for notifications
CREATE POLICY "notifications_users_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Create function to create notification (if not exists)
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- ========================================
-- 3. CLEAN UP CONFLICTING POLICIES
-- ========================================

-- Ensure chats policies are clean and don't conflict
DROP POLICY IF EXISTS "Users can see their chats" ON chats;

CREATE POLICY "chats_members_can_view" ON chats
  FOR SELECT USING (
    created_by = auth.uid() OR
    user_is_chat_member(id)
  );

-- Grant necessary permissions
GRANT SELECT ON notifications TO authenticated;
GRANT INSERT ON notifications TO authenticated;
GRANT UPDATE ON notifications TO authenticated;

COMMIT;
