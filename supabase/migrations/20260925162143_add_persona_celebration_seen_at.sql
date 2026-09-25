-- One-time Persona celebration dialog: set when the user taps "Let's go"
-- on the post-verification congrats popup so we never show it again.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS persona_celebration_seen_at TIMESTAMPTZ;

COMMENT ON COLUMN public.users.persona_celebration_seen_at IS
  'Set when the user dismisses the post-Persona congrats dialog via its CTA. Null means show once after successful ID verification.';

-- Existing verified users should not suddenly see the new popup.
UPDATE public.users
SET persona_celebration_seen_at = COALESCE(identity_verified_at, NOW())
WHERE identity_verified_at IS NOT NULL
  AND persona_celebration_seen_at IS NULL;
