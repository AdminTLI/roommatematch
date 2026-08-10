-- Migration: add user_id to domu_ai_chat_log
-- Required for GDPR DSAR compliance (Art. 15), account deletion cascade, and retention enforcement.
-- Without user_id, chat log rows cannot be tied to a data subject, violating GDPR Art. 17 (right to erasure).

-- 1. Add nullable user_id column with FK referencing auth.users, cascading on user deletion.
ALTER TABLE public.domu_ai_chat_log
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Index for efficient per-user queries (DSAR export, retention purge).
CREATE INDEX IF NOT EXISTS idx_domu_ai_chat_log_user_id
  ON public.domu_ai_chat_log (user_id);

-- 3. Drop the blanket service-role-only policy so authenticated users can SELECT their own rows.
DROP POLICY IF EXISTS "Service role can manage Domu AI chat log" ON public.domu_ai_chat_log;

-- 4. Service role retains full management access.
CREATE POLICY "Service role can manage Domu AI chat log"
  ON public.domu_ai_chat_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Authenticated users may read only their own rows (DSAR access, user-facing history).
CREATE POLICY "Users can view own Domu AI chat log"
  ON public.domu_ai_chat_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
