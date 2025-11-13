-- Fix infinite recursion in user_academic_admin_read policy
-- The policy was querying admins table, which triggered admins policy that queried admins again

-- Drop the problematic policy
DROP POLICY IF EXISTS "user_academic_admin_read" ON user_academic;

-- Create a SECURITY DEFINER function to check if user is admin
-- This breaks the recursion by executing with elevated privileges
CREATE OR REPLACE FUNCTION is_user_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS when checking admin status
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policy using the function (no recursion)
CREATE POLICY "user_academic_admin_read" ON user_academic
    FOR SELECT USING (
        is_user_admin(auth.uid())
    );

COMMENT ON FUNCTION is_user_admin IS 'Check if user is admin, using SECURITY DEFINER to avoid RLS recursion';

