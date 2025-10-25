-- Add INSERT policy for users table
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (id = auth.uid());
