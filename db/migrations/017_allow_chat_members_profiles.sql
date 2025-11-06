-- Allow chat members to see each other's profiles
-- This is necessary for displaying names in chat interfaces

-- Create a security definer function to check if users are in the same chat
-- This breaks potential recursion by executing with elevated privileges
CREATE OR REPLACE FUNCTION users_in_same_chat(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_members cm1
    INNER JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
    WHERE cm1.user_id = auth.uid()
    AND cm2.user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add policy to allow chat members to see each other's profiles
CREATE POLICY "Chat members can see each other's profiles" ON profiles
  FOR SELECT USING (
    user_id = auth.uid() OR
    users_in_same_chat(user_id)
  );

