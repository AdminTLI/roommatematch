-- ============================================
-- FIX: function public.now() does not exist
-- ============================================
-- This script fixes the update_updated_at_column function
-- that's causing errors when updating the chats table
--
-- Run this in Supabase SQL Editor:
-- 1. Go to Supabase Dashboard
-- 2. Click on SQL Editor
-- 3. Paste this entire script
-- 4. Click Run

-- Fix the update_updated_at_column function (standard version)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the public.update_updated_at_column function (with SET search_path = '')
-- When search_path is empty, we MUST use CURRENT_TIMESTAMP (not NOW() or public.now())
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the functions were updated
SELECT 
  'Function fixed' as status,
  proname as function_name,
  pronamespace::regnamespace as schema_name
FROM pg_proc 
WHERE proname = 'update_updated_at_column'
ORDER BY pronamespace;

-- Test that the function works
DO $$
DECLARE
  test_result TIMESTAMP WITH TIME ZONE;
BEGIN
  test_result := CURRENT_TIMESTAMP;
  RAISE NOTICE 'Test successful: CURRENT_TIMESTAMP works: %', test_result;
END $$;











