-- Durable Persona/KYC confirmation that survives document retention purge.
-- Dutch UAVG requires deleting verification documents after ~28 days, but the
-- fact that a user completed identity verification must remain for login gating.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_verification_provider TEXT;

COMMENT ON COLUMN public.users.identity_verified_at IS
  'Set when Persona/KYC completes successfully. Survives verifications document purge.';
COMMENT ON COLUMN public.users.identity_verification_provider IS
  'Provider used for identity verification (e.g. persona). No document PII.';

CREATE INDEX IF NOT EXISTS idx_users_identity_verified_at
  ON public.users (identity_verified_at)
  WHERE identity_verified_at IS NOT NULL;

-- Keep confirmation in sync whenever a verification becomes approved/rejected.
CREATE OR REPLACE FUNCTION public.sync_identity_verification_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.users
       SET identity_verified_at = COALESCE(identity_verified_at, NOW()),
           identity_verification_provider = COALESCE(NEW.provider::text, identity_verification_provider),
           updated_at = NOW()
     WHERE id = NEW.user_id;

    UPDATE public.profiles
       SET verification_status = 'verified',
           updated_at = NOW()
     WHERE user_id = NEW.user_id
       AND verification_status IS DISTINCT FROM 'verified';

  ELSIF NEW.status = 'rejected' THEN
    -- Do not clear identity_verified_at if a prior approval exists.
    UPDATE public.profiles
       SET verification_status = 'failed',
           updated_at = NOW()
     WHERE user_id = NEW.user_id
       AND verification_status IS DISTINCT FROM 'verified';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_identity_verification_confirmation ON public.verifications;
CREATE TRIGGER trigger_sync_identity_verification_confirmation
  AFTER INSERT OR UPDATE OF status ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_identity_verification_confirmation();

-- Replace aggressive full-row purge with PII scrub that keeps approval confirmation.
CREATE OR REPLACE FUNCTION public.purge_expired_verifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  scrubbed_count INTEGER;
BEGIN
  -- Ensure durable confirmation exists before scrubbing any approved rows.
  UPDATE public.users u
     SET identity_verified_at = COALESCE(u.identity_verified_at, v.updated_at, v.created_at, NOW()),
         identity_verification_provider = COALESCE(u.identity_verification_provider, v.provider::text),
         updated_at = NOW()
    FROM public.verifications v
   WHERE v.user_id = u.id
     AND v.status = 'approved'
     AND v.retention_expires_at IS NOT NULL
     AND v.retention_expires_at < NOW()
     AND u.identity_verified_at IS NULL;

  UPDATE public.profiles p
     SET verification_status = 'verified',
         updated_at = NOW()
    FROM public.verifications v
   WHERE v.user_id = p.user_id
     AND v.status = 'approved'
     AND v.retention_expires_at IS NOT NULL
     AND v.retention_expires_at < NOW()
     AND p.verification_status IS DISTINCT FROM 'verified';

  -- Scrub document/PII payload; keep status=approved as an audit stub.
  UPDATE public.verifications
     SET provider_data = jsonb_build_object(
           'scrubbed', true,
           'scrubbed_at', NOW(),
           'reason', 'retention_policy'
         ),
         provider_session_id = CASE
           WHEN provider_session_id LIKE 'scrubbed-%' THEN provider_session_id
           ELSE 'scrubbed-' || id::text
         END,
         review_reason = NULL,
         retention_expires_at = NULL,
         updated_at = NOW()
   WHERE retention_expires_at IS NOT NULL
     AND retention_expires_at < NOW();

  GET DIAGNOSTICS scrubbed_count = ROW_COUNT;
  RETURN scrubbed_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_verifications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_verifications() TO service_role;

REVOKE ALL ON FUNCTION public.sync_identity_verification_confirmation() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_identity_verification_confirmation() TO service_role;

-- Backfill durable confirmation from existing sources of truth.
-- Also ensure public.users rows exist (signup trigger can lag/fail).
INSERT INTO public.users (id, email, is_active, created_at, updated_at)
SELECT au.id, au.email, true, au.created_at, now()
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, is_active, created_at, updated_at, identity_verified_at, identity_verification_provider)
SELECT au.id, au.email, true, au.created_at, now(), COALESCE(v.updated_at, v.created_at, now()), COALESCE(v.provider::text, 'persona')
FROM auth.users au
JOIN public.verifications v ON v.user_id = au.id AND v.status = 'approved'
ON CONFLICT (id) DO UPDATE
SET identity_verified_at = COALESCE(public.users.identity_verified_at, EXCLUDED.identity_verified_at),
    identity_verification_provider = COALESCE(public.users.identity_verification_provider, EXCLUDED.identity_verification_provider),
    updated_at = now();

INSERT INTO public.users (id, email, is_active, created_at, updated_at, identity_verified_at, identity_verification_provider)
SELECT au.id, au.email, true, au.created_at, now(), COALESCE(p.updated_at, p.created_at, now()), 'persona'
FROM auth.users au
JOIN public.profiles p ON p.user_id = au.id AND p.verification_status = 'verified'
ON CONFLICT (id) DO UPDATE
SET identity_verified_at = COALESCE(public.users.identity_verified_at, EXCLUDED.identity_verified_at),
    identity_verification_provider = COALESCE(public.users.identity_verification_provider, EXCLUDED.identity_verification_provider),
    updated_at = now();

UPDATE public.users u
   SET identity_verified_at = COALESCE(u.identity_verified_at, v.updated_at, v.created_at, NOW()),
       identity_verification_provider = COALESCE(u.identity_verification_provider, v.provider::text, 'persona'),
       updated_at = NOW()
  FROM public.verifications v
 WHERE v.user_id = u.id
   AND v.status = 'approved'
   AND u.identity_verified_at IS NULL;

UPDATE public.users u
   SET identity_verified_at = COALESCE(u.identity_verified_at, p.updated_at, p.created_at, NOW()),
       identity_verification_provider = COALESCE(u.identity_verification_provider, 'persona'),
       updated_at = NOW()
  FROM public.profiles p
 WHERE p.user_id = u.id
   AND p.verification_status = 'verified'
   AND u.identity_verified_at IS NULL;

-- Sync any approved verification that never wrote profiles.verification_status.
UPDATE public.profiles p
   SET verification_status = 'verified',
       updated_at = NOW()
  FROM public.verifications v
 WHERE v.user_id = p.user_id
   AND v.status = 'approved'
   AND p.verification_status IS DISTINCT FROM 'verified';
