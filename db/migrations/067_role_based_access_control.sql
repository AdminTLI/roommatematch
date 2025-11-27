-- Migration: Role-Based Access Control System
-- Date: 2025-01-XX
-- Description: Implements proper role-based access control with User, Admin, and Super Admin roles
--              Replaces hardcoded email checks with database-driven role system

BEGIN;

-- ============================================
-- 0. FIX UPDATE_UPDATED_AT_COLUMN FUNCTION (if it exists with wrong definition)
-- ============================================
-- Ensure the update_updated_at_column function uses the correct timestamp function
-- This must be done first before any triggers that use it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$;

-- ============================================
-- 1. CREATE USER_ROLE ENUM TYPE
-- ============================================
-- Create the enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
    END IF;
END $$;

-- ============================================
-- 2. CREATE USER_ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ============================================
-- 3. MODIFY ADMINS TABLE
-- ============================================
-- Make university_id nullable for Super Admins
ALTER TABLE admins ALTER COLUMN university_id DROP NOT NULL;

-- Add constraint: Super Admins must have NULL university_id, Admins must have a university_id
-- Note: We'll handle this via application logic and triggers, as CHECK constraints can't reference other tables easily

-- ============================================
-- 4. CREATE TRIGGER TO AUTO-ASSIGN USER ROLE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert default 'user' role for new users
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on users table
DROP TRIGGER IF EXISTS trigger_assign_default_user_role ON users;
CREATE TRIGGER trigger_assign_default_user_role
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_user_role();

-- ============================================
-- 5. MIGRATE EXISTING ADMINS TO USER_ROLES TABLE
-- ============================================
-- First, ensure all existing users have a 'user' role
INSERT INTO user_roles (user_id, role)
SELECT id, 'user'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- Migrate existing admins: super_admin role gets 'super_admin', others get 'admin'
INSERT INTO user_roles (user_id, role)
SELECT 
  a.user_id,
  CASE 
    WHEN a.role = 'super_admin' THEN 'super_admin'::user_role
    ELSE 'admin'::user_role
  END
FROM admins a
WHERE a.user_id NOT IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'super_admin'))
ON CONFLICT (user_id) 
DO UPDATE SET role = EXCLUDED.role;

-- Update admins table: set university_id to NULL for super_admins
UPDATE admins 
SET university_id = NULL 
WHERE role = 'super_admin' AND university_id IS NOT NULL;

-- ============================================
-- 6. CREATE HELPER FUNCTIONS FOR ROLE CHECKS
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_role, 'user'::public.user_role);
END;
$$;

CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = 'super_admin'::public.user_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role IN ('admin'::public.user_role, 'super_admin'::public.user_role)
  );
END;
$$;

-- ============================================
-- 7. UPDATE RLS POLICIES FOR USER_ROLES TABLE
-- ============================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own role
CREATE POLICY "Users can read their own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Super Admins can read all roles (for role management)
CREATE POLICY "Super admins can read all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- Super Admins can manage all roles
CREATE POLICY "Super admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- ============================================
-- 8. UPDATE ADMINS TABLE RLS POLICIES
-- ============================================
-- Update the policy to check user_roles table instead of admins table (avoid recursion)
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- Update admin read policy to use user_roles
DROP POLICY IF EXISTS "Admins can read admin data" ON admins;

CREATE POLICY "Admins can read admin data" ON admins
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('admin', 'super_admin')
      AND (
        -- Super admins can see all admins
        ur.role = 'super_admin' OR
        -- Regular admins can see admins in their university
        (admins.university_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM admins a2
          WHERE a2.user_id = auth.uid()
          AND a2.university_id = admins.university_id
        ))
      )
    )
  );

-- ============================================
-- 9. CREATE TRIGGER TO UPDATE UPDATED_AT
-- ============================================
-- Function was already created/fixed at the beginning of the migration
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================
-- Ensure authenticated users can read their own role
-- (handled by RLS policies above)

COMMIT;

