-- Part 6: Verify the setup
-- Run this last to verify everything is working

SELECT 
  'Function exists' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
  'Trigger exists',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
    AND tgrelid = 'auth.users'::regclass
  ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
  'RLS enabled on users',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND rowsecurity = true
  ) THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 
  'INSERT policy exists',
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert their own data'
    AND cmd = 'INSERT'
  ) THEN 'YES' ELSE 'NO' END;

