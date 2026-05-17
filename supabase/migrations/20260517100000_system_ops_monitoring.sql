-- System operations monitoring: health state, ops event log, maintenance RPC

-- ---------------------------------------------------------------------------
-- system_health_state: hysteresis counters per service
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_health_state (
  service TEXT PRIMARY KEY CHECK (service IN (
    'database',
    'authentication',
    'matching_engine',
    'file_storage'
  )),
  last_status TEXT NOT NULL DEFAULT 'online' CHECK (last_status IN ('online', 'degraded', 'offline')),
  consecutive_slow_count INTEGER NOT NULL DEFAULT 0,
  consecutive_healthy_count INTEGER NOT NULL DEFAULT 0,
  last_response_time_ms INTEGER,
  last_error TEXT,
  status_reason TEXT,
  first_non_green_at TIMESTAMPTZ,
  last_alert_sent_at TIMESTAMPTZ,
  last_ops_log_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.system_health_state (service)
VALUES
  ('database'),
  ('authentication'),
  ('matching_engine'),
  ('file_storage')
ON CONFLICT (service) DO NOTHING;

-- ---------------------------------------------------------------------------
-- system_ops_events: append-only operations log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_ops_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN (
    'health_check',
    'maintenance',
    'security',
    'admin_api',
    'cron'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  service TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_ops_events_created_at
  ON public.system_ops_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_ops_events_source_created
  ON public.system_ops_events (source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_ops_events_severity_created
  ON public.system_ops_events (severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_ops_events_service_created
  ON public.system_ops_events (service, created_at DESC)
  WHERE service IS NOT NULL;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.system_health_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_ops_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read system health state" ON public.system_health_state;
CREATE POLICY "Admins can read system health state"
  ON public.system_health_state
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role manages system health state" ON public.system_health_state;
CREATE POLICY "Service role manages system health state"
  ON public.system_health_state
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Admins can read system ops events" ON public.system_ops_events;
CREATE POLICY "Admins can read system ops events"
  ON public.system_ops_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role can insert system ops events" ON public.system_ops_events;
CREATE POLICY "Service role can insert system ops events"
  ON public.system_ops_events
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

GRANT SELECT ON public.system_health_state TO authenticated;
GRANT SELECT ON public.system_ops_events TO authenticated;

-- ---------------------------------------------------------------------------
-- RPC: expose maintenance job runs to admins (private schema)
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
  IF NOT EXISTS (
    SELECT 1 FROM public.admins WHERE admins.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Forbidden: admin access required';
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
GRANT EXECUTE ON FUNCTION public.get_maintenance_job_runs(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_maintenance_job_runs(INTEGER, INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- Retention: purge ops events older than 90 days
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_old_system_ops_events(
  p_retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.system_ops_events
  WHERE created_at < NOW() - (GREATEST(1, COALESCE(p_retention_days, 90)) || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_system_ops_events(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_old_system_ops_events(INTEGER) TO service_role;
