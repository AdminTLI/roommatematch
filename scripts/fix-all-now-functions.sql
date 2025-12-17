-- ============================================
-- COMPREHENSIVE FIX: function public.now() does not exist
-- ============================================
-- This script fixes ALL functions that use public.now()
-- Run this in Supabase SQL Editor

-- First, let's see what functions exist
SELECT 
  proname as function_name,
  pronamespace::regnamespace as schema_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE proname LIKE '%updated_at%' OR proname LIKE '%now%'
ORDER BY proname;

-- Fix update_updated_at_column function (standard version)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix public.update_updated_at_column function (WITHOUT SET search_path = '')
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check what triggers are on the chats table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'chats'::regclass
AND tgisinternal = false;

-- Drop and recreate the trigger to ensure it uses the correct function
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the function definition
SELECT 
  'Function fixed' as status,
  proname as function_name,
  pronamespace::regnamespace as schema_name,
  substring(pg_get_functiondef(oid), 1, 200) as definition_preview
FROM pg_proc 
WHERE proname = 'update_updated_at_column'
ORDER BY pronamespace;




