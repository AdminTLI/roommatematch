-- Fix: Replace public.now() with CURRENT_TIMESTAMP in set_message_retention function
-- The error is: function public.now() does not exist
-- When SET search_path = '', we need to use CURRENT_TIMESTAMP or pg_catalog.now()
-- This function is triggered BEFORE INSERT on messages table

-- Fix the set_message_retention function (WITH SET search_path = '')
-- This version works when search_path is empty - must use CURRENT_TIMESTAMP
CREATE OR REPLACE FUNCTION public.set_message_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 1 year (365 days) after message creation
  IF NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := CURRENT_TIMESTAMP + INTERVAL '365 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Also ensure update_updated_at_column uses CURRENT_TIMESTAMP (migration 100 should have fixed it, but ensure it's correct)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Fix update_chat_first_message to use schema-qualified table names when SET search_path = ''
-- Migration 066 set search_path = '' on this function, so it needs public. prefix
CREATE OR REPLACE FUNCTION public.update_chat_first_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first message in the chat
  -- Use public. prefix because SET search_path = ''
  IF NOT EXISTS (
    SELECT 1 FROM public.messages 
    WHERE chat_id = NEW.chat_id 
    AND id != NEW.id
  ) THEN
    -- Update the chat's first_message_at timestamp
    -- Use public. prefix because SET search_path = ''
    UPDATE public.chats 
    SET first_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Verify the functions were updated
SELECT 
  'Function updated' as status,
  proname as function_name,
  pronamespace::regnamespace as schema_name
FROM pg_proc 
WHERE proname IN ('set_message_retention', 'update_updated_at_column', 'update_chat_first_message') 
  AND pronamespace = 'public'::regnamespace;

