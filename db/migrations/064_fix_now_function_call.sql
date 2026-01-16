-- Fix: Replace public.now() with CURRENT_TIMESTAMP
-- The error is: function public.now() does not exist
-- With SET search_path = '', we need to use CURRENT_TIMESTAMP or pg_catalog.now()

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating user record: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Verify it's updated
SELECT 
  'Function updated' as status,
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

















