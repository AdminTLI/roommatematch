-- Scrub PII from verification_webhooks payloads after the same UAVG window as verifications.
-- Keeps audit metadata; replaces payload with a scrubbed stub.

CREATE OR REPLACE FUNCTION public.purge_expired_verification_webhooks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  scrubbed_count INTEGER := 0;
BEGIN
  WITH expired AS (
    UPDATE public.verification_webhooks
    SET
      payload = jsonb_build_object(
        'scrubbed', true,
        'reason', 'retention_policy',
        'scrubbed_at', NOW()
      ),
      error = COALESCE(error, 'payload_scrubbed')
    WHERE created_at < NOW() - INTERVAL '28 days'
      AND (
        payload IS NULL
        OR NOT (payload ? 'scrubbed')
        OR (payload->>'scrubbed') IS DISTINCT FROM 'true'
      )
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO scrubbed_count FROM expired;

  RETURN scrubbed_count;
END;
$$;

COMMENT ON FUNCTION public.purge_expired_verification_webhooks() IS
  'Scrubs verification_webhooks.payload after 28 days (UAVG-aligned).';
