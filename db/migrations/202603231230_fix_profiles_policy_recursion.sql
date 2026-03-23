-- Fix profiles RLS recursion by replacing self-referencing policy condition
-- with a SECURITY DEFINER helper function.

CREATE OR REPLACE FUNCTION public.can_view_minimal_profile(target_university_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
SET search_path = public
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

DROP POLICY IF EXISTS "Minimal public profiles visible to university members" ON profiles;

CREATE POLICY "Minimal public profiles visible to university members" ON profiles
  FOR SELECT USING (
    minimal_public = true
    AND can_view_minimal_profile(university_id)
  );
