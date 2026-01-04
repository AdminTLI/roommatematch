-- Fix for user_roles trigger function
-- The trigger function uses SET search_path = '' which requires fully qualified table names
-- This script fixes the assign_default_user_role function to use public.user_roles

CREATE OR REPLACE FUNCTION assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert default 'user' role for new users
  -- Use fully qualified table name since search_path is empty
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

