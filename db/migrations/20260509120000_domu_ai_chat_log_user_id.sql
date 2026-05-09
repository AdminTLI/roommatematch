-- Domu AI chat log: associate rows with the authenticated user for audit and support.
-- Server route `/api/domu/chat` enforces session; this column stores the caller.

ALTER TABLE public.domu_ai_chat_log
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_domu_ai_chat_log_user_id
  ON public.domu_ai_chat_log (user_id);

COMMENT ON COLUMN public.domu_ai_chat_log.user_id IS
  'User who called Domu Assistant (set by server from Supabase session).';
