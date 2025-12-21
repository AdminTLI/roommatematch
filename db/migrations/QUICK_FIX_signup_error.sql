-- QUICK FIX: Apply this directly in Supabase SQL Editor to fix signup errors
-- This fixes the handle_new_user trigger function that's causing 500 errors

-- Function: handle_new_user
-- This function automatically creates a user record when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    true,
    public.now(),
    public.now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the function was created correctly
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as search_path_config
FROM pg_proc 
WHERE proname = 'handle_new_user';













