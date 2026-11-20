-- Persistent group bio for group chats (WhatsApp-style description)
ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.chats.description IS 'Optional group bio / description shown to members';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chats_description_length_check'
  ) THEN
    ALTER TABLE public.chats
      ADD CONSTRAINT chats_description_length_check
      CHECK (description IS NULL OR char_length(description) <= 500);
  END IF;
END $$;
