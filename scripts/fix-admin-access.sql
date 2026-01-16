-- Script: Fix Admin Access Issues
-- Description: This script diagnoses and fixes admin access issues
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_EMAIL_HERE' with your email address
-- 2. Run this script in your Supabase SQL editor or via psql
-- 3. The script will:
--    - Check your current admin status
--    - Fix any missing entries in user_roles or admins tables
--    - Ensure email verification is set
--
-- SECURITY NOTE:
-- - Only run this script if you have direct database access
-- - This script will grant you admin access if you have an entry in admins table

BEGIN;

-- Step 1: Find the user ID from their email
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT := 'YOUR_EMAIL_HERE'; -- CHANGE THIS EMAIL
    v_user_role TEXT;
    v_admin_record RECORD;
    v_user_exists BOOLEAN;
BEGIN
    -- Get user ID from auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found. Please check the email address.', v_user_email;
    END IF;

    RAISE NOTICE 'Found user: % (ID: %)', v_user_email, v_user_id;

    -- Step 2: Check current status
    RAISE NOTICE '=== DIAGNOSTIC INFORMATION ===';
    
    -- Check if user exists in users table
    SELECT EXISTS(SELECT 1 FROM users WHERE id = v_user_id) INTO v_user_exists;
    IF NOT v_user_exists THEN
        RAISE NOTICE 'User not found in users table - creating entry...';
        INSERT INTO users (id, email, is_active, created_at, updated_at)
        VALUES (v_user_id, v_user_email, true, NOW(), NOW());
    ELSE
        RAISE NOTICE 'User exists in users table';
    END IF;

    -- Check user_roles
    SELECT role INTO v_user_role
    FROM user_roles
    WHERE user_id = v_user_id;

    IF v_user_role IS NULL THEN
        RAISE NOTICE 'WARNING: No role found in user_roles table';
    ELSE
        RAISE NOTICE 'Current role in user_roles: %', v_user_role;
    END IF;

    -- Check admins table
    SELECT * INTO v_admin_record
    FROM admins
    WHERE user_id = v_user_id
    LIMIT 1;

    IF v_admin_record IS NULL THEN
        RAISE NOTICE 'WARNING: No entry found in admins table';
    ELSE
        RAISE NOTICE 'Admin record found: role=%, university_id=%', v_admin_record.role, v_admin_record.university_id;
    END IF;

    -- Step 3: Fix user_roles if missing or incorrect
    IF v_user_role IS NULL OR (v_user_role != 'admin' AND v_user_role != 'super_admin') THEN
        RAISE NOTICE 'Fixing user_roles table...';
        
        -- If user has admin record, assign 'admin' role
        -- If no admin record exists, we'll create one with 'admin' role
        IF v_admin_record IS NOT NULL THEN
            -- Determine role based on admin record
            IF v_admin_record.role = 'super_admin' THEN
                INSERT INTO user_roles (user_id, role, created_at, updated_at)
                VALUES (v_user_id, 'super_admin', NOW(), NOW())
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    role = 'super_admin',
                    updated_at = NOW();
                RAISE NOTICE 'Assigned super_admin role in user_roles table';
            ELSE
                INSERT INTO user_roles (user_id, role, created_at, updated_at)
                VALUES (v_user_id, 'admin', NOW(), NOW())
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    role = 'admin',
                    updated_at = NOW();
                RAISE NOTICE 'Assigned admin role in user_roles table';
            END IF;
        ELSE
            -- No admin record, but user wants admin access
            -- Create admin role in user_roles and admins table
            RAISE NOTICE 'Creating admin access from scratch...';
            
            -- First, get a university_id (use the first active university)
            DECLARE
                v_university_id UUID;
            BEGIN
                SELECT id INTO v_university_id
                FROM universities
                WHERE is_active = true
                LIMIT 1;

                IF v_university_id IS NULL THEN
                    RAISE EXCEPTION 'No active university found. Cannot create admin record.';
                END IF;

                -- Create admin role
                INSERT INTO user_roles (user_id, role, created_at, updated_at)
                VALUES (v_user_id, 'admin', NOW(), NOW())
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    role = 'admin',
                    updated_at = NOW();

                -- Create admin record
                INSERT INTO admins (user_id, university_id, role, created_at, updated_at)
                VALUES (v_user_id, v_university_id, 'university_admin', NOW(), NOW())
                ON CONFLICT (user_id, university_id) 
                DO UPDATE SET 
                    role = 'university_admin',
                    updated_at = NOW();

                RAISE NOTICE 'Created admin access with university_id: %', v_university_id;
            END;
        END IF;
    ELSE
        RAISE NOTICE 'User role is already correct: %', v_user_role;
    END IF;

    -- Step 4: Ensure admin record exists if user has admin role
    IF v_user_role IN ('admin', 'super_admin') AND v_admin_record IS NULL THEN
        RAISE NOTICE 'Creating admin record...';
        
        DECLARE
            v_university_id UUID;
        BEGIN
            IF v_user_role = 'super_admin' THEN
                -- Super admin can have NULL university_id
                -- But the schema requires NOT NULL, so we need to check if that's allowed
                -- For now, assign to first university
                SELECT id INTO v_university_id
                FROM universities
                WHERE is_active = true
                LIMIT 1;

                IF v_university_id IS NULL THEN
                    RAISE EXCEPTION 'No active university found. Cannot create admin record.';
                END IF;

                INSERT INTO admins (user_id, university_id, role, created_at, updated_at)
                VALUES (v_user_id, v_university_id, 'super_admin', NOW(), NOW())
                ON CONFLICT (user_id, university_id) 
                DO UPDATE SET 
                    role = 'super_admin',
                    updated_at = NOW();
            ELSE
                SELECT id INTO v_university_id
                FROM universities
                WHERE is_active = true
                LIMIT 1;

                IF v_university_id IS NULL THEN
                    RAISE EXCEPTION 'No active university found. Cannot create admin record.';
                END IF;

                INSERT INTO admins (user_id, university_id, role, created_at, updated_at)
                VALUES (v_user_id, v_university_id, 'university_admin', NOW(), NOW())
                ON CONFLICT (user_id, university_id) 
                DO UPDATE SET 
                    role = 'university_admin',
                    updated_at = NOW();
            END IF;

            RAISE NOTICE 'Created admin record with university_id: %', v_university_id;
        END;
    END IF;

    -- Step 5: Verify email confirmation
    DECLARE
        v_email_confirmed BOOLEAN;
    BEGIN
        SELECT email_confirmed_at IS NOT NULL INTO v_email_confirmed
        FROM auth.users
        WHERE id = v_user_id;

        IF NOT v_email_confirmed THEN
            RAISE WARNING 'Email is not confirmed. Admin access requires email verification.';
            RAISE NOTICE 'To fix: Go to Supabase Dashboard > Authentication > Users > Find your user > Click "Confirm Email"';
        ELSE
            RAISE NOTICE 'Email is confirmed ✓';
        END IF;
    END;

    RAISE NOTICE '=== FIX COMPLETE ===';
    RAISE NOTICE 'Please refresh your browser and try accessing /admin again.';
END $$;

COMMIT;

-- Verification query (run separately to verify)
-- Replace 'YOUR_EMAIL_HERE' with your email
/*
SELECT 
    u.email,
    u.is_active as user_active,
    ur.role as user_role,
    a.role as admin_role,
    a.university_id,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN admins a ON u.id = a.user_id
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'YOUR_EMAIL_HERE';
*/















