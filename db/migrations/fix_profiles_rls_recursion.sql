-- Fix infinite recursion in profiles RLS policy
-- The original policy queried profiles from within a profiles policy, causing infinite recursion

-- Drop the policy that causes infinite recursion
DROP POLICY IF EXISTS "Minimal public profiles visible to university members" ON profiles;

-- Create a security definer function to check university membership
-- This breaks the recursion by executing with elevated privileges
CREATE OR REPLACE FUNCTION user_in_same_university(target_university_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_academic
    WHERE user_id = auth.uid()
    AND university_id = target_university_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policy using the function (no recursion)
CREATE POLICY "Minimal public profiles visible to university members" ON profiles
  FOR SELECT USING (
    minimal_public = true AND
    user_in_same_university(university_id)
  );
