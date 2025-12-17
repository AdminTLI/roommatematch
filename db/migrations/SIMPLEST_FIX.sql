-- SIMPLEST POSSIBLE FIX - Minimal trigger function
-- This is the absolute simplest version to test if the concept works

-- Drop everything first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the simplest possible function
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, is_active, created_at, updated_at)
  VALUES (NEW.id, NEW.email, true, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT 
  'Setup Complete' as status,
  proname as function_name,
  tgname as trigger_name
FROM pg_proc p
CROSS JOIN pg_trigger t
WHERE p.proname = 'handle_new_user'
  AND t.tgname = 'on_auth_user_created';












