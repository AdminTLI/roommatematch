-- Complete diagnostic for signup issue
-- Run this to check everything

-- 1. Check if function exists and its properties
SELECT 
  'Function Check' as check_type,
  proname as name,
  prosecdef as security_definer,
  proconfig as search_path,
  proowner::regrole as owner,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Check if trigger exists and is enabled
SELECT 
  'Trigger Check' as check_type,
  tgname as trigger_name,
  CASE tgenabled 
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    WHEN 'R' THEN 'Replica'
    WHEN 'A' THEN 'Always'
    ELSE 'Unknown'
  END as status,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Check users table structure and constraints
SELECT 
  'Table Structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check all constraints on users table
SELECT
  'Constraints' as check_type,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass;

-- 5. Check RLS status
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 6. Check all policies on users table
SELECT 
  'RLS Policies' as check_type,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'users';

-- 7. Test if we can manually insert (this will help identify the issue)
-- Don't run this on production! Only for testing
-- SELECT 'Manual Insert Test' as check_type, 'Run manually with a test UUID' as note;













