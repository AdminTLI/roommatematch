-- Fix infinite recursion in admins RLS policy
-- Many policies query the admins table, which triggers admins RLS policy that queries admins again
-- This creates infinite recursion when checking admin status

-- The issue: When policies query "SELECT 1 FROM admins WHERE user_id = auth.uid()",
-- PostgreSQL checks RLS on admins, which might trigger other policies that query admins again.

-- Solution: Create a SECURITY DEFINER function that bypasses RLS when checking admin status
-- This function runs with elevated privileges, so it doesn't trigger RLS policies

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- SECURITY DEFINER means this function runs with the privileges of the function owner
  -- This bypasses RLS, preventing infinite recursion
  RETURN EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

COMMENT ON FUNCTION public.is_admin() IS 'Check if current user is admin, using SECURITY DEFINER to avoid RLS recursion. Use this function instead of querying admins table directly in RLS policies.';

-- Fix the recursive policy on admins table
-- The policy "Admins can read admin data" queries admins from within an admins policy, causing recursion
DROP POLICY IF EXISTS "Admins can read admin data" ON public.admins;

-- Recreate the policy using the function to avoid recursion
CREATE POLICY "Admins can read admin data" ON public.admins
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_admin()
  );

