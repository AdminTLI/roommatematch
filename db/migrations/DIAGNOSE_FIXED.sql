-- Fixed diagnostic queries
-- Run these one at a time or separately

-- 1. Check if function exists
SELECT 
  'Function exists' as check_type,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
    THEN 'YES' ELSE 'NO' END as status;

-- 2. Check if trigger exists
SELECT 
  'Trigger exists' as check_type,
  CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
    THEN 'YES' ELSE 'NO' END as status;

-- 3. Check trigger status (run this separately)
SELECT 
  'Trigger status' as check_type,
  tgname as trigger_name,
  CASE tgenabled 
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    WHEN 'R' THEN 'Replica'
    WHEN 'A' THEN 'Always'
    ELSE 'Unknown: ' || tgenabled::text
  END as status,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 4. Check function definition
SELECT 
  'Function definition' as check_type,
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as search_path,
  pg_get_functiondef(oid) as full_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

