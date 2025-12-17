-- Fix: Replace public.now() with CURRENT_TIMESTAMP in update_updated_at_column function
-- The error is: function public.now() does not exist
-- When SET search_path = '', we need to use CURRENT_TIMESTAMP or pg_catalog.now()

-- Fix the update_updated_at_column function (WITHOUT SET search_path = '')
-- This version works in normal contexts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the public.update_updated_at_column version (WITH SET search_path = '')
-- This version works when search_path is empty - must use CURRENT_TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also ensure the function works even with SET search_path = '' by using pg_catalog.now() as fallback
-- But CURRENT_TIMESTAMP is preferred as it's SQL standard and always available

-- Verify the function was updated
SELECT 
  'Function updated' as status,
  proname as function_name,
  pronamespace::regnamespace as schema_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

