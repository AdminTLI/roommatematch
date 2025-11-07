-- Fix RLS policy for messages INSERT to ensure it works correctly
-- Drop and recreate the policy to ensure it's properly structured
-- 
-- IMPORTANT: This migration must be applied in Supabase SQL Editor
-- The issue is that WITH CHECK policies reference columns directly (not NEW.column_name)
-- Unqualified column names in WITH CHECK refer to the row being inserted

DROP POLICY IF EXISTS "Chat members can send messages" ON messages;

-- Recreate the policy with correct syntax
-- In WITH CHECK policies, unqualified column names refer to the row being inserted
CREATE POLICY "Chat members can send messages" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chat_id
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

