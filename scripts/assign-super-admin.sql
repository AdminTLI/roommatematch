-- Script: Assign Super Admin Role to a User
-- Description: This script assigns the super_admin role to an existing user
-- 
-- INSTRUCTIONS:
-- 1. Replace 'USER_EMAIL_HERE' with the email address of the user you want to make a super admin
-- 2. Run this script in your Supabase SQL editor or via psql
-- 3. After running, the user will have super admin access
--
-- SECURITY NOTE:
-- - Only run this script if you have direct database access
-- - Ensure you trust the user you're promoting to super admin
-- - Super admins have full control over the platform

BEGIN;

-- Step 1: Find the user ID from their email
-- Replace 'USER_EMAIL_HERE' with the actual email address
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'USER_EMAIL_HERE'; -- CHANGE THIS EMAIL
BEGIN
    -- Get user ID from auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found. Please check the email address.', v_user_email;
    END IF;

    -- Step 2: Ensure user exists in users table
    INSERT INTO users (id, email, is_active, created_at, updated_at)
    SELECT v_user_id, v_user_email, true, NOW(), NOW()
    ON CONFLICT (id) DO NOTHING;

    -- Step 3: Assign super_admin role in user_roles table
    INSERT INTO user_roles (user_id, role, created_at, updated_at)
    VALUES (v_user_id, 'super_admin', NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'super_admin',
        updated_at = NOW();

    -- Step 4: Ensure admin record exists (with NULL university_id for super admin)
    INSERT INTO admins (user_id, university_id, role, created_at, updated_at)
    VALUES (v_user_id, NULL, 'super_admin', NOW(), NOW())
    ON CONFLICT (user_id, university_id) 
    DO UPDATE SET 
        role = 'super_admin',
        updated_at = NOW();

    RAISE NOTICE 'Successfully assigned super_admin role to user: % (ID: %)', v_user_email, v_user_id;
END $$;

COMMIT;

-- Verification query (run separately to verify)
-- SELECT 
--     u.email,
--     ur.role,
--     a.role as admin_role,
--     a.university_id
-- FROM users u
-- LEFT JOIN user_roles ur ON u.id = ur.user_id
-- LEFT JOIN admins a ON u.id = a.user_id
-- WHERE u.email = 'USER_EMAIL_HERE'; -- Replace with the email you used above












