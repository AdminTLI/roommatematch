-- GDPR fix: add user_id to domu_ai_chat_log so personal data (user messages) can be
-- linked to their data subject for DSAR access (Art. 15) and erasure (Art. 17) requests.
--
-- user_id is nullable to preserve existing anonymous rows; all new rows will have it set.
-- ON DELETE CASCADE ensures the row is purged automatically when the auth user is deleted.

ALTER TABLE public.domu_ai_chat_log
  ADD COLUMN IF NOT EXISTS user_id uuid
    REFERENCES public.users(id) ON DELETE CASCADE;

-- Index to make per-user lookups (DSAR export / retention scans) efficient.
CREATE INDEX IF NOT EXISTS idx_domu_ai_chat_log_user_id
  ON public.domu_ai_chat_log (user_id);

-- Update the RLS policy to also allow users to select their own rows (DSAR export).
DROP POLICY IF EXISTS "Service role can manage Domu AI chat log" ON public.domu_ai_chat_log;

-- Service role: full access (API writes).
CREATE POLICY "Service role can manage Domu AI chat log"
  ON public.domu_ai_chat_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users: read their own rows only (needed for DSAR export via user-scoped client).
CREATE POLICY "Users can read own Domu AI chat log"
  ON public.domu_ai_chat_log
  FOR SELECT
  USING (auth.uid() = user_id);
