-- Add UPSERT policy for profiles table
-- This fixes the "Profile Save Failed" error when submitting questionnaire in edit mode
-- The existing INSERT and UPDATE policies don't cover UPSERT operations

CREATE POLICY "Users can upsert their own profile" ON profiles
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add UPSERT policy for user_academic table
-- This ensures academic data can also be upserted during questionnaire submission

CREATE POLICY "Users can upsert their own academic data" ON user_academic
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
