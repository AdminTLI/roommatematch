-- Host verification: 24h deadline nudge + Persona stub + email sync helper

ALTER TABLE public.host_profiles
  ADD COLUMN IF NOT EXISTS verification_deadline_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS id_verified BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.host_profiles.verification_deadline_at IS
  'Set at onboarding (+24h). Urgency UX for email verification; actions require email_verified.';
COMMENT ON COLUMN public.host_profiles.id_verified IS
  'Persona/ID verified for hosts (future). Currently unused for action gates.';

-- Backfill deadline for existing onboarded hosts who are not email-verified
UPDATE public.host_profiles
SET verification_deadline_at = COALESCE(verification_deadline_at, created_at + interval '24 hours')
WHERE onboarding_completed = true
  AND email_verified = false
  AND verification_deadline_at IS NULL;
