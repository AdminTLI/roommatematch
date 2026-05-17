-- daily_maintenance previously ran at 02:00 UTC, colliding with hourly
-- daily_matching_students (0 * * * *). Both jobs competed for DB memory and
-- pg_net.http_get failed with "Out of memory" while inserting into net.http_request_queue.
--
-- Run maintenance at 02:15 UTC, after student (02:00) and professional (02:10) matching.

CREATE OR REPLACE FUNCTION private.purge_old_pg_net_responses(
  p_retention_days INTEGER DEFAULT 7
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = net, pg_temp
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM net._http_response
  WHERE created < NOW() - (GREATEST(1, COALESCE(p_retention_days, 7)) || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION private.purge_old_pg_net_responses(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.purge_old_pg_net_responses(INTEGER) TO postgres;

DO $outer$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily_maintenance') THEN
      PERFORM cron.unschedule('daily_maintenance');
    END IF;

    PERFORM cron.schedule(
      'daily_maintenance',
      '15 2 * * *',
      $$SELECT private.invoke_maintenance_cron();$$
    );

    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge_pg_net_responses') THEN
      PERFORM cron.schedule(
        'purge_pg_net_responses',
        '30 3 * * 0',
        $$SELECT private.purge_old_pg_net_responses(7);$$
      );
    END IF;
  END IF;
END;
$outer$;
