-- Fix RLS policy for messages INSERT to ensure it works correctly
-- Drop and recreate the policy to ensure it's properly structured
-- 
-- IMPORTANT: This migration must be applied in Supabase SQL Editor
-- The issue is that WITH CHECK policies need to use NEW.column_name
-- instead of table_name.column_name for proper evaluation

DROP POLICY IF EXISTS "Chat members can send messages" ON messages;

-- Recreate the policy with explicit NEW reference
-- This ensures PostgreSQL can properly evaluate the policy during INSERT
CREATE POLICY "Chat members can send messages" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = NEW.chat_id
      AND cm.user_id = auth.uid()
    )
  );

-- Verify the policy was created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'messages' 
    AND policyname = 'Chat members can send messages'
  ) THEN
    RAISE EXCEPTION 'Policy creation failed';
  END IF;
  RAISE NOTICE 'Policy "Chat members can send messages" created successfully';
END $$;

