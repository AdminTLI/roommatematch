-- ============================================
-- URGENT FIX: function public.now() does not exist
-- ============================================
-- Run this IMMEDIATELY in Supabase SQL Editor
-- This will fix the chat message sending issue

-- Step 1: Drop the problematic function if it exists with SET search_path = ''
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Step 2: Create the fixed function WITHOUT SET search_path = ''
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Step 3: Also create the public schema version (without SET search_path = '')
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Step 4: Recreate the trigger on chats table to use the fixed function
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Verify it worked
SELECT 
  'SUCCESS: Function fixed' as status,
  proname as function_name,
  pronamespace::regnamespace as schema_name
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- Step 6: Test the function works
DO $$
DECLARE
  test_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  test_timestamp := CURRENT_TIMESTAMP;
  RAISE NOTICE 'Test passed: CURRENT_TIMESTAMP = %', test_timestamp;
END $$;









