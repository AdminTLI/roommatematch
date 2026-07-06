-- GDPR/UAVG Compliance Fix: link domu_ai_chat_log rows to their author
--
-- Without a user_id column, user_message text (personal data) cannot be
-- included in DSAR exports, erased on account deletion, or purged by the
-- 365-day retention cron.  This migration adds the FK and an RLS policy so
-- each user can read their own rows.
--
-- ON DELETE CASCADE ensures that when auth.users removes a row (account
-- deletion), all associated AI chat log rows are erased automatically.

ALTER TABLE public.domu_ai_chat_log
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_domu_ai_chat_log_user_id
  ON public.domu_ai_chat_log (user_id);

-- RLS: let authenticated users read their own rows (service_role retains full access via bypass)
DROP POLICY IF EXISTS "Users can view their own Domu AI chat log" ON public.domu_ai_chat_log;
CREATE POLICY "Users can view their own Domu AI chat log"
  ON public.domu_ai_chat_log
  FOR SELECT
  USING (auth.uid() = user_id);
