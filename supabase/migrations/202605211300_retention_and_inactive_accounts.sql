-- Retention policy alignment (1-year inactive per privacy policy) + inactivity tracking

-- Inactivity lifecycle on users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS inactivity_status TEXT NOT NULL DEFAULT 'active'
    CHECK (inactivity_status IN ('active', 'warning_30d', 'warning_7d', 'processed')),
  ADD COLUMN IF NOT EXISTS inactivity_warning_30d_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inactivity_warning_7d_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inactivity_processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

COMMENT ON COLUMN public.users.inactivity_status IS 'GDPR inactive-account lifecycle: active → warning_30d → warning_7d → processed';
COMMENT ON COLUMN public.users.last_activity_at IS 'Denormalized last activity (heartbeat, profile updates) for retention cron';

CREATE INDEX IF NOT EXISTS idx_users_inactivity_pending
  ON public.users (last_activity_at)
  WHERE inactivity_processed_at IS NULL AND is_active = TRUE;

-- DSAR: Article 22 automated decision review requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'dsar_request_type'
      AND e.enumlabel = 'automated_decision_review'
  ) THEN
    ALTER TYPE public.dsar_request_type ADD VALUE 'automated_decision_review';
  END IF;
END $$;

-- Backfill last_activity_at from profiles.last_seen_at / users.updated_at
UPDATE public.users u
SET last_activity_at = COALESCE(
  (SELECT p.last_seen_at FROM public.profiles p WHERE p.user_id = u.id),
  u.updated_at,
  u.created_at
)
WHERE last_activity_at IS NULL;

-- Deprecated: prefer process_inactive_accounts via app cron (lib/privacy/inactive-accounts.ts)
CREATE OR REPLACE FUNCTION public.anonymize_inactive_accounts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE NOTICE 'anonymize_inactive_accounts is deprecated; use maintenance cron process_inactive_accounts';
  RETURN 0;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_inactive_accounts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_inactive_accounts() TO service_role;
