-- Align verification purge with storage cleanup metadata (rows purged in app layer)

CREATE OR REPLACE FUNCTION public.purge_expired_verifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.verifications
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_verifications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_verifications() TO service_role;
