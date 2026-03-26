-- Fix trigger function resolution issues when search_path is restricted.
-- Symptoms: inserts into public.messages fail with
--   ERROR: relation "messages" does not exist
-- CONTEXT: PL/pgSQL function public.update_chat_first_message()

BEGIN;

CREATE OR REPLACE FUNCTION public.update_chat_first_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- Check if this is the first message in the chat
  IF NOT EXISTS (
    SELECT 1
    FROM public.messages
    WHERE chat_id = NEW.chat_id
      AND id <> NEW.id
  ) THEN
    -- Update the chat's first_message_at timestamp
    UPDATE public.chats
    SET first_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;

