-- Linter 0028/0029: SECURITY DEFINER RPCs must not be executable by anon/authenticated.
-- Linter 0008: platform_settings has RLS enabled but no policies.
--
-- Ops monitoring RPCs are invoked from server routes via service_role after requireAdmin()
-- or from maintenance cron (purge_old_system_ops_events).

-- ---------------------------------------------------------------------------
-- get_maintenance_job_runs: service_role bypass (admin verified in API route)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_maintenance_job_runs(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  run_id TEXT,
  status TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  http_status INTEGER,
  response_body TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Forbidden: admin access required';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.run_id,
    m.status,
    m.started_at,
    m.finished_at,
    m.http_status,
    m.response_body,
    m.error_message
  FROM private.maintenance_job_runs m
  ORDER BY m.started_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 200))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
END;
$$;

REVOKE ALL ON FUNCTION public.get_maintenance_job_runs(INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_maintenance_job_runs(INTEGER, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_maintenance_job_runs(INTEGER, INTEGER) TO service_role;

REVOKE EXECUTE ON FUNCTION public.purge_old_system_ops_events(INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_system_ops_events(INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- platform_settings: service-role-only (see lib/platform-settings-db.ts)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Block anon and authenticated from platform_settings" ON public.platform_settings;
CREATE POLICY "Block anon and authenticated from platform_settings"
  ON public.platform_settings
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
