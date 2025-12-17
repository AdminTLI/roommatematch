-- Script: Check Admin Access Status
-- Description: This script checks your current admin access status
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_EMAIL_HERE' with your email address
-- 2. Run this script in your Supabase SQL editor or via psql
-- 3. Review the output to see what's missing

-- Replace 'YOUR_EMAIL_HERE' with your actual email address
\set email 'YOUR_EMAIL_HERE'

SELECT 
    '=== ADMIN ACCESS DIAGNOSTIC ===' as diagnostic;

SELECT 
    u.email,
    u.id as user_id,
    u.is_active as user_active,
    ur.role as user_role,
    CASE 
        WHEN ur.role IS NULL THEN '❌ MISSING - No role in user_roles table'
        WHEN ur.role NOT IN ('admin', 'super_admin') THEN '❌ INVALID - Role is: ' || ur.role
        ELSE '✓ OK - Role: ' || ur.role
    END as user_role_status,
    a.role as admin_role,
    a.university_id,
    CASE 
        WHEN a.id IS NULL THEN '❌ MISSING - No entry in admins table'
        ELSE '✓ OK - Admin record exists'
    END as admin_record_status,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    CASE 
        WHEN au.email_confirmed_at IS NULL THEN '❌ MISSING - Email not confirmed'
        ELSE '✓ OK - Email confirmed'
    END as email_status,
    au.created_at as account_created
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN admins a ON u.id = a.user_id
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = :'email';

-- Summary check
SELECT 
    '=== SUMMARY ===' as summary;

WITH user_check AS (
    SELECT 
        u.id,
        u.email,
        ur.role as user_role,
        a.id as admin_id,
        au.email_confirmed_at IS NOT NULL as email_confirmed
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN admins a ON u.id = a.user_id
    LEFT JOIN auth.users au ON u.id = au.id
    WHERE u.email = :'email'
)
SELECT 
    CASE 
        WHEN id IS NULL THEN '❌ User not found in users table'
        WHEN user_role IS NULL THEN '❌ Missing role in user_roles table'
        WHEN user_role NOT IN ('admin', 'super_admin') THEN '❌ Invalid role: ' || user_role
        WHEN admin_id IS NULL THEN '❌ Missing entry in admins table'
        WHEN NOT email_confirmed THEN '❌ Email not confirmed'
        ELSE '✓ All checks passed - Admin access should work'
    END as overall_status
FROM user_check;










