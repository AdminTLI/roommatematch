-- 1) Login email counts as university-email occupancy (signup exclusivity)
-- 2) Soft-nudge cadence state for optional verification on match accept

CREATE OR REPLACE FUNCTION public.find_university_email_holder_ids(p_email text)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id
  FROM public.users
  WHERE university_email IS NOT NULL
    AND lower(btrim(university_email)) = lower(btrim(p_email))
  UNION
  SELECT id
  FROM public.users
  WHERE email IS NOT NULL
    AND lower(btrim(email)) = lower(btrim(p_email))
  UNION
  SELECT user_id
  FROM public.university_email_claims
  WHERE released_at IS NULL
    AND email_normalized = lower(btrim(p_email));
$$;

COMMENT ON FUNCTION public.find_university_email_holder_ids(text) IS
  'Returns user ids holding a university email via users.university_email, login users.email, or an active claim.';

CREATE TABLE IF NOT EXISTS public.verification_nudge_state (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_shown_at timestamptz,
  last_shown_at timestamptz,
  last_action text CHECK (
    last_action IS NULL
    OR last_action IN ('shown', 'skipped', 'verified_uni', 'verified_persona')
  ),
  show_count integer NOT NULL DEFAULT 0,
  next_eligible_at timestamptz,
  cadence_stage text NOT NULL DEFAULT 'initial'
    CHECK (cadence_stage IN ('initial', 'day1', 'weekly')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verification_nudge_state_next_eligible_idx
  ON public.verification_nudge_state (next_eligible_at);

COMMENT ON TABLE public.verification_nudge_state IS
  'Tracks soft verification nudge impressions and cadence (first show, +24h, then +7d).';

ALTER TABLE public.verification_nudge_state ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.verification_nudge_state FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.verification_nudge_state TO postgres, service_role;
