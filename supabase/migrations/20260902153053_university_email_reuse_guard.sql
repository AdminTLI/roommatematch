-- Forward-only university email exclusivity.
-- Does NOT rewrite existing users.university_email / profiles.university_email rows.
-- Grandfathered duplicates stay as they are; new claims cannot reuse an occupied address.

CREATE TABLE IF NOT EXISTS public.university_email_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_normalized TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ NULL,
  released_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  release_reason TEXT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS university_email_claims_active_email_key
  ON public.university_email_claims (email_normalized)
  WHERE released_at IS NULL;

CREATE INDEX IF NOT EXISTS university_email_claims_user_id_idx
  ON public.university_email_claims (user_id);

COMMENT ON TABLE public.university_email_claims IS
  'Exclusive university-email claims created on future student verifications. Existing duplicate holders are not backfilled.';

CREATE TABLE IF NOT EXISTS public.university_email_reuse_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized TEXT NOT NULL,
  attempting_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  holder_user_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'dismissed', 'released')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ NULL,
  reviewed_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT NULL
);

CREATE INDEX IF NOT EXISTS university_email_reuse_flags_status_created_idx
  ON public.university_email_reuse_flags (status, created_at DESC);

CREATE INDEX IF NOT EXISTS university_email_reuse_flags_email_idx
  ON public.university_email_reuse_flags (email_normalized);

CREATE INDEX IF NOT EXISTS university_email_reuse_flags_attempting_user_idx
  ON public.university_email_reuse_flags (attempting_user_id);

COMMENT ON TABLE public.university_email_reuse_flags IS
  'Super-admin queue of blocked attempts to attach a university email already held by another account.';

-- Lookup aid only. Does not constrain or rewrite existing values.
CREATE INDEX IF NOT EXISTS users_university_email_normalized_idx
  ON public.users (lower(btrim(university_email)))
  WHERE university_email IS NOT NULL;

ALTER TABLE public.university_email_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_email_reuse_flags ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.university_email_claims FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.university_email_reuse_flags FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.university_email_claims TO postgres, service_role;
GRANT ALL ON TABLE public.university_email_reuse_flags TO postgres, service_role;
