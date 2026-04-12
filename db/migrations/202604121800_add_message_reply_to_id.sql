-- Allow messages to reference another message in the same thread (reply / quote).
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id);

COMMENT ON COLUMN public.messages.reply_to_id IS 'Optional message this row replies to (same chat). Cleared if parent is deleted.';
