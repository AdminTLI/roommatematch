# Signup Issue Fix Instructions

## Problem
Users cannot sign up - getting "database error saving new user" and 500 error from Supabase auth endpoint.

## Root Cause
The `handle_new_user()` trigger function is failing because:
1. It uses `CURRENT_TIMESTAMP` which doesn't work with `SET search_path = ''`
2. Missing error handling
3. Possible RLS policy issues

## Solution

### Step 1: Run Diagnostic Query
First, run the diagnostic query to see the current state:

1. Go to your Supabase Dashboard → SQL Editor
2. Run the file: `db/migrations/DIAGNOSE_signup_issue_current.sql`
3. Review the results to see what's wrong

### Step 2: Apply the Fix
Run the comprehensive fix migration:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `db/migrations/124_fix_signup_trigger_comprehensive.sql`
3. Execute the migration
4. Check the output for any errors or warnings

The migration will:
- Create `public.now()` function if it doesn't exist
- Fix the `handle_new_user()` function with proper error handling
- Ensure the trigger is properly configured
- Add the INSERT policy for users table
- Verify everything is set up correctly

### Step 3: Test Signup
1. Try signing up a new user on your localhost
2. Check if the user is created successfully
3. Verify the user record exists in the `users` table

### Step 4: Check Terminal/Logs
If the issue persists, check:
- Your Next.js server terminal for any errors
- Supabase Dashboard → Logs → Postgres Logs for trigger errors
- Browser console for any additional error messages

## Manual Verification

Run this query in Supabase SQL Editor to verify the fix:

```sql
-- Check function exists and is configured correctly
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as search_path_config,
  proowner::regrole as owner
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check trigger exists and is enabled
SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Check INSERT policy exists
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'INSERT';
```

## Expected Results

After applying the fix:
- Function should exist with `SECURITY DEFINER` and `SET search_path = ''`
- Function owner should be `postgres`
- Trigger should exist and be enabled
- INSERT policy should exist for users table
- Signup should work without errors

## If Issue Persists

If signup still fails after applying the fix:

1. Check Supabase Postgres logs for the exact error
2. Verify the function has proper permissions:
   ```sql
   GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
   ```

3. Test the function manually:
   ```sql
   -- This should not error
   SELECT public.handle_new_user();
   ```

4. Check if RLS is blocking the insert:
   ```sql
   -- Temporarily disable RLS to test (NOT RECOMMENDED FOR PRODUCTION)
   -- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```



