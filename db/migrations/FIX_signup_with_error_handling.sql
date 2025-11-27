-- FIX: handle_new_user with better error handling and logging
-- This version includes error handling to help diagnose issues

-- Drop and recreate the function with error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_email TEXT;
  v_user_id UUID;
BEGIN
  -- Get values from NEW record
  v_user_id := NEW.id;
  v_email := NEW.email;
  
  -- Validate email is not null
  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Email cannot be null for new user';
  END IF;
  
  -- Insert into users table
  INSERT INTO public.users (id, email, is_active, created_at, updated_at)
  VALUES (
    v_user_id,
    v_email,
    true,
    public.now(),
    public.now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (you can check Supabase logs)
    RAISE EXCEPTION 'Error in handle_new_user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permission (should already exist, but ensure it)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;



