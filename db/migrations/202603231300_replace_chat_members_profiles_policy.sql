-- Replace function-based chat profile visibility policy with inline SQL.
-- This avoids relying on function owner/runtime behavior for RLS evaluation.

DROP POLICY IF EXISTS "Chat members can see each other's profiles" ON profiles;

CREATE POLICY "Chat members can see each other's profiles" ON profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM chat_members cm1
      JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
      WHERE cm1.user_id = auth.uid()
        AND cm2.user_id = profiles.user_id
    )
  );
