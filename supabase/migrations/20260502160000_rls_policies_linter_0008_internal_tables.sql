-- Database linter 0008 (rls_enabled_no_policy): tables with RLS enabled must have at least
-- one policy so access rules are explicit (https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
--
-- private.matching_job_runs — cron/job logs; written only by DB functions run as elevated roles.
-- private.message_keys — FK anchor for messages; maintained by SECURITY DEFINER triggers only.
-- public.question_importance_counts — denormalized counts; maintained by triggers on question_importance_ticks.
--
-- Policy: deny PostgREST client roles (anon, authenticated). Jobs and triggers run as table/function
-- owners or postgres and bypass RLS; Supabase service_role API requests bypass RLS per platform rules.

ALTER TABLE IF EXISTS private.matching_job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS private.message_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.question_importance_counts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block anon and authenticated from matching_job_runs" ON private.matching_job_runs;
CREATE POLICY "Block anon and authenticated from matching_job_runs"
  ON private.matching_job_runs
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Block anon and authenticated from message_keys" ON private.message_keys;
CREATE POLICY "Block anon and authenticated from message_keys"
  ON private.message_keys
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Supersedes 202604041200 "Service role can manage..." (same client-visible behaviour; explicit deny).
DROP POLICY IF EXISTS "Service role can manage question importance counts" ON public.question_importance_counts;
DROP POLICY IF EXISTS "Block anon and authenticated from question_importance_counts" ON public.question_importance_counts;
CREATE POLICY "Block anon and authenticated from question_importance_counts"
  ON public.question_importance_counts
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
