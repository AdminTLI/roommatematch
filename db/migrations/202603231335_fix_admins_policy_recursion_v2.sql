-- Fix infinite recursion in admins policies.
-- Old admins policies queried admins from within admins policy conditions.

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admins
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_admin_in_university(target_university_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admins
    WHERE user_id = auth.uid()
      AND university_id = target_university_id
      AND role IN ('super_admin', 'university_admin')
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_in_university(UUID) TO authenticated;

DROP POLICY IF EXISTS "Admins can read admin data" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

CREATE POLICY "Admins can read admin data" ON admins
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_admin_in_university(university_id)
  );

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (is_super_admin());
