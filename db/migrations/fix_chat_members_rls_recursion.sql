-- Fix infinite recursion in chat_members RLS policy
-- The original policy queried chat_members from within a chat_members policy, causing infinite recursion

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

-- Drop the recursive policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can see chat members for their chats" ON chat_members;

-- Create new non-recursive policy using the security definer function
CREATE POLICY "Users can see chat members for their chats" ON chat_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_members.chat_id 
      AND chats.created_by = auth.uid()
    ) OR
    user_is_chat_member(chat_id)
  );

-- Also check for any other conflicting policies and drop them
DROP POLICY IF EXISTS "Chat members can manage membership" ON chat_members;

-- Create a cleaner policy for chat member management
CREATE POLICY "Chat members can manage membership" ON chat_members
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chats c
      WHERE c.id = chat_members.chat_id
      AND c.created_by = auth.uid()
    )
  );
