-- Migration: Add user_id to domu_ai_chat_log for DSAR/GDPR compliance
-- Required by GDPR Art. 17 (right to erasure) and Art. 15 (right of access):
-- without user_id, personal data in user_message cannot be found, exported,
-- or deleted in response to a DSAR or account deletion.

-- 1. Add nullable user_id column (nullable so existing rows without a user don't break)
ALTER TABLE public.domu_ai_chat_log
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Index for fast DSAR lookups and retention purges by user
CREATE INDEX IF NOT EXISTS idx_domu_ai_chat_log_user_id
  ON public.domu_ai_chat_log (user_id)
  WHERE user_id IS NOT NULL;

-- 3. Allow authenticated users to SELECT their own rows (DSAR-readable)
DROP POLICY IF EXISTS "Users can view their own Domu AI chat log" ON public.domu_ai_chat_log;
CREATE POLICY "Users can view their own Domu AI chat log"
  ON public.domu_ai_chat_log
  FOR SELECT
  USING (auth.uid() = user_id);
