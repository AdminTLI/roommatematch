-- Part 5: Add INSERT policy for users table
-- Run this after Part 4

DROP POLICY IF EXISTS "Users can insert their own data" ON users;

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT 
  WITH CHECK (id = auth.uid());





