ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS metadata JSONB;

COMMENT ON COLUMN public.messages.metadata IS 'Optional structured payload (e.g. group_invite cards)';

CREATE INDEX IF NOT EXISTS idx_messages_metadata_type
  ON public.messages ((metadata->>'type'))
  WHERE metadata IS NOT NULL;
