-- pg_cron maintenance: also pass secret as query param when Authorization header is stripped.

CREATE OR REPLACE FUNCTION private.invoke_maintenance_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault, cron
AS $$
DECLARE
  v_run_id TEXT := format('maintenance_%s', to_char(now(), 'YYYYMMDD_HH24MISS'));
  v_cron_secret TEXT;
  v_app_base_url TEXT;
  v_url TEXT;
  v_request_id BIGINT;
BEGIN
  SELECT decrypted_secret INTO v_cron_secret
  FROM vault.decrypted_secrets
  WHERE name = 'maintenance_cron_secret'
  LIMIT 1;

  SELECT decrypted_secret INTO v_app_base_url
  FROM vault.decrypted_secrets
  WHERE name = 'app_base_url'
  LIMIT 1;

  IF v_cron_secret IS NULL OR v_app_base_url IS NULL THEN
    INSERT INTO private.maintenance_job_runs (run_id, status, finished_at, error_message)
    VALUES (
      v_run_id,
      'skipped',
      NOW(),
      'Vault secrets maintenance_cron_secret and/or app_base_url are not configured'
    );
    RAISE WARNING 'Maintenance cron skipped: configure vault secrets maintenance_cron_secret and app_base_url';
    RETURN;
  END IF;

  v_app_base_url := trim(v_app_base_url);

  IF v_app_base_url = 'app_base_url'
     OR v_app_base_url !~* '^https?://'
  THEN
    INSERT INTO private.maintenance_job_runs (run_id, status, finished_at, error_message)
    VALUES (
      v_run_id,
      'skipped',
      NOW(),
      'Vault secret app_base_url must be a full URL (e.g. https://domumatch.com), not a placeholder'
    );
    RAISE WARNING
      'Maintenance cron skipped: app_base_url vault secret is invalid (value=%). Set it in Dashboard → Vault.',
      v_app_base_url;
    RETURN;
  END IF;

  v_url := rtrim(v_app_base_url, '/') || '/api/cron/maintenance?secret=' || v_cron_secret;

  INSERT INTO private.maintenance_job_runs (run_id, status)
  VALUES (v_run_id, 'running');

  SELECT net.http_get(
    url := v_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_cron_secret,
      'Content-Type', 'application/json'
    ),
    timeout_milliseconds := 300000
  ) INTO v_request_id;

  IF v_request_id IS NULL THEN
    UPDATE private.maintenance_job_runs
    SET
      status = 'failed',
      finished_at = NOW(),
      error_message = 'pg_net failed to queue maintenance HTTP request'
    WHERE run_id = v_run_id;
    RAISE WARNING 'Maintenance cron: pg_net returned NULL request_id for url=%', v_url;
    RETURN;
  END IF;

  UPDATE private.maintenance_job_runs
  SET
    status = 'success',
    finished_at = NOW(),
    response_body = 'pg_net_request_id=' || v_request_id::text
  WHERE run_id = v_run_id;

EXCEPTION
  WHEN OTHERS THEN
    UPDATE private.maintenance_job_runs
    SET
      status = 'failed',
      finished_at = NOW(),
      error_message = left(SQLERRM, 4000)
    WHERE run_id = v_run_id;
    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION private.invoke_maintenance_cron() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.invoke_maintenance_cron() TO postgres;
