-- Diagnostic queries to identify the current signup issue
-- Run these in Supabase SQL Editor to see what's wrong

-- 1. Check if the function exists and its configuration
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as search_path_config,
  proowner::regrole as owner,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Check if the trigger exists and is enabled
SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    WHEN 'R' THEN 'Replica'
    WHEN 'A' THEN 'Always'
    ELSE 'Unknown'
  END as enabled_status,
  tgrelid::regclass as table_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Check users table structure and constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- 5. Check if RLS is enabled on users table
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 6. Check if public.now() function exists
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'now'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 7. Test the function manually (this will show any errors)
-- Uncomment the line below to test (replace with a test UUID)
-- SELECT public.handle_new_user() FROM (SELECT '00000000-0000-0000-0000-000000000000'::uuid as id, 'test@example.com' as email) as test_user;

-- 8. Check recent auth user creations and whether corresponding users exist
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  au.created_at as auth_created_at,
  CASE WHEN u.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as user_record_status,
  u.created_at as user_created_at
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;

