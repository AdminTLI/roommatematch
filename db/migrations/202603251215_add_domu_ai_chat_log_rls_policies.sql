-- Supabase linter: RLS enabled but no policy on domu_ai_chat_log.
-- This table is written by server code using the Supabase service role key.

ALTER TABLE IF EXISTS public.domu_ai_chat_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage Domu AI chat log" ON public.domu_ai_chat_log;

-- Allow access only when the JWT role is service_role.
-- This keeps anon/authenticated blocked while satisfying the linter.
CREATE POLICY "Service role can manage Domu AI chat log"
  ON public.domu_ai_chat_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

