-- Fix recursion in profiles RLS policy that referenced the profiles table from within itself
-- The old policy caused "infinite recursion detected" errors when joining profiles with other tables

DROP POLICY IF EXISTS "Minimal public profiles visible to university members" ON profiles;

-- Security definer helper so we can evaluate university membership without recursion
CREATE OR REPLACE FUNCTION public.can_view_minimal_profile(target_university_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_academic
    WHERE user_id = auth.uid()
      AND university_id = target_university_id
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.can_view_minimal_profile(UUID) TO authenticated;

CREATE POLICY "Minimal public profiles visible to university members" ON profiles
  FOR SELECT USING (
    minimal_public = true
    AND can_view_minimal_profile(university_id)
  );

