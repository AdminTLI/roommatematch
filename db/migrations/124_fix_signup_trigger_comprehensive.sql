-- Comprehensive fix for signup trigger issue
-- This migration ensures the handle_new_user trigger function works correctly
-- and can bypass RLS to insert users when auth users are created

-- Step 1: Ensure we have a now() function in public schema if it doesn't exist
CREATE OR REPLACE FUNCTION public.now()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE sql
STABLE
AS $$
  SELECT NOW();
$$;

-- Step 2: Create/replace the handle_new_user function with proper configuration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Insert into users table
  -- SECURITY DEFINER should bypass RLS, but we ensure proper error handling
  INSERT INTO public.users (id, email, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    true,
    public.now(),
    public.now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    -- Re-raise with context for debugging
    RAISE WARNING 'Error in handle_new_user trigger: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    -- Still return NEW to allow auth user creation to succeed
    RETURN NEW;
END;
$$;

-- Step 3: Ensure the function is owned by postgres (should bypass RLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Step 4: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Step 5: Ensure trigger exists and is enabled
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Ensure INSERT policy exists for users table
-- This policy allows users to insert their own record (for manual inserts)
-- SECURITY DEFINER functions should bypass RLS, but this is a safety net
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Step 7: Verify the setup
DO $$
DECLARE
  func_exists BOOLEAN;
  trigger_exists BOOLEAN;
  rls_enabled BOOLEAN;
  policy_exists BOOLEAN;
BEGIN
  -- Check function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO func_exists;
  
  -- Check trigger exists
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
    AND tgrelid = 'auth.users'::regclass
  ) INTO trigger_exists;
  
  -- Check RLS is enabled
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'users';
  
  -- Check policy exists
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert their own data'
    AND cmd = 'INSERT'
  ) INTO policy_exists;
  
  -- Output verification results
  RAISE NOTICE 'Function exists: %', func_exists;
  RAISE NOTICE 'Trigger exists: %', trigger_exists;
  RAISE NOTICE 'RLS enabled: %', rls_enabled;
  RAISE NOTICE 'INSERT policy exists: %', policy_exists;
  
  IF NOT func_exists THEN
    RAISE EXCEPTION 'Function handle_new_user does not exist';
  END IF;
  
  IF NOT trigger_exists THEN
    RAISE EXCEPTION 'Trigger on_auth_user_created does not exist';
  END IF;
END $$;



