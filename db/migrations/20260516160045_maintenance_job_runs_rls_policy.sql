-- Database linter 0008 (rls_enabled_no_policy): private.maintenance_job_runs has RLS enabled
-- but no policies. Same pattern as private.matching_job_runs (20260502160000).
--
-- Cron/job logs; written only by private.invoke_maintenance_cron() (SECURITY DEFINER).
-- Deny PostgREST client roles; elevated roles and service_role bypass RLS per platform rules.

ALTER TABLE IF EXISTS private.maintenance_job_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block anon and authenticated from maintenance_job_runs" ON private.maintenance_job_runs;
CREATE POLICY "Block anon and authenticated from maintenance_job_runs"
  ON private.maintenance_job_runs
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
