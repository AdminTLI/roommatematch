-- Retention cleanup for email_unsubscribe_events (90 days, matching application_logs policy).
-- The table stores truncated IPs and user-agents; still personal data under GDPR Art. 4(1).

CREATE OR REPLACE FUNCTION public.purge_expired_email_unsubscribe_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.email_unsubscribe_events
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_email_unsubscribe_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_email_unsubscribe_events() TO service_role;
