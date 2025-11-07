-- Fix RLS policy for messages INSERT to ensure it works correctly
-- Drop and recreate the policy to ensure it's properly structured

DROP POLICY IF EXISTS "Chat members can send messages" ON messages;

-- Recreate the policy with explicit NEW reference
CREATE POLICY "Chat members can send messages" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = NEW.chat_id
      AND cm.user_id = auth.uid()
    )
  );

