-- Supabase linter: RLS enabled but no policy on several tables.
-- These tables are accessed by server code using the Supabase service role key.
-- Add explicit service-role-only policies to satisfy the linter while keeping
-- anon/authenticated blocked.

BEGIN;

-- ---------------------------------------------------------------------------
-- announcement_email_log
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.announcement_email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage announcement email log" ON public.announcement_email_log;

CREATE POLICY "Service role can manage announcement email log"
  ON public.announcement_email_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- notification_email_digest_state
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.notification_email_digest_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage notification email digest state" ON public.notification_email_digest_state;

CREATE POLICY "Service role can manage notification email digest state"
  ON public.notification_email_digest_state
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- exit_surveys
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.exit_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage exit surveys" ON public.exit_surveys;

CREATE POLICY "Service role can manage exit surveys"
  ON public.exit_surveys
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;

