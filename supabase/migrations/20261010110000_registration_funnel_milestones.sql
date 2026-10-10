-- Structured registration-funnel tracking for cohort / bottleneck analysis.
-- First-reach milestones (event log) + wide progress row (one per user).

CREATE TABLE IF NOT EXISTS public.registration_funnel_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stage_key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('step', 'side')),
  step_number smallint,
  reached_at timestamptz NOT NULL DEFAULT now(),
  source text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT registration_funnel_milestones_stage_key_check CHECK (
    stage_key IN (
      'signup_submitted',
      'email_verified',
      'academic_filled',
      'context_logistics',
      'using_platform',
      'received_matches',
      'harmony_complete',
      'verification_decision',
      'accepted_match',
      'chatted',
      'settings_filled'
    )
  ),
  CONSTRAINT registration_funnel_milestones_step_number_check CHECK (
    step_number IS NULL OR (step_number >= 1 AND step_number <= 10)
  ),
  CONSTRAINT registration_funnel_milestones_user_stage_unique UNIQUE (user_id, stage_key)
);

CREATE INDEX IF NOT EXISTS registration_funnel_milestones_stage_reached_idx
  ON public.registration_funnel_milestones (stage_key, reached_at);

CREATE INDEX IF NOT EXISTS registration_funnel_milestones_reached_at_idx
  ON public.registration_funnel_milestones (reached_at);

COMMENT ON TABLE public.registration_funnel_milestones IS
  'First-reach registration funnel milestones (steps 1–10 + settings side metric) with timestamps for analysis.';

CREATE TABLE IF NOT EXISTS public.registration_funnel_progress (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  signup_submitted_at timestamptz,
  email_verified_at timestamptz,
  academic_filled_at timestamptz,
  context_logistics_at timestamptz,
  using_platform_at timestamptz,
  received_matches_at timestamptz,
  harmony_complete_at timestamptz,
  verification_decision_at timestamptz,
  accepted_match_at timestamptz,
  chatted_at timestamptz,
  settings_filled_at timestamptz,
  furthest_step smallint NOT NULL DEFAULT 0
    CHECK (furthest_step >= 0 AND furthest_step <= 10),
  verification_method text
    CHECK (
      verification_method IS NULL
      OR verification_method IN ('uni_email', 'persona', 'skipped', 'auto_academic')
    ),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS registration_funnel_progress_furthest_step_idx
  ON public.registration_funnel_progress (furthest_step);

CREATE INDEX IF NOT EXISTS registration_funnel_progress_signup_idx
  ON public.registration_funnel_progress (signup_submitted_at);

COMMENT ON TABLE public.registration_funnel_progress IS
  'Denormalized per-user funnel timestamps (wide format) for cohort analysis and admin joins.';

-- Idempotent first-reach recorder. Returns true when a new milestone was inserted.
CREATE OR REPLACE FUNCTION public.record_registration_funnel_milestone(
  p_user_id uuid,
  p_stage_key text,
  p_source text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_reached_at timestamptz DEFAULT now()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_kind text;
  v_step smallint;
  v_new_id uuid;
  v_reached_at timestamptz := COALESCE(p_reached_at, now());
  v_meta jsonb := COALESCE(p_metadata, '{}'::jsonb);
  v_method text;
BEGIN
  IF p_user_id IS NULL OR p_stage_key IS NULL THEN
    RETURN false;
  END IF;

  CASE p_stage_key
    WHEN 'signup_submitted' THEN v_kind := 'step'; v_step := 1;
    WHEN 'email_verified' THEN v_kind := 'step'; v_step := 2;
    WHEN 'academic_filled' THEN v_kind := 'step'; v_step := 3;
    WHEN 'context_logistics' THEN v_kind := 'step'; v_step := 4;
    WHEN 'using_platform' THEN v_kind := 'step'; v_step := 5;
    WHEN 'received_matches' THEN v_kind := 'step'; v_step := 6;
    WHEN 'harmony_complete' THEN v_kind := 'step'; v_step := 7;
    WHEN 'verification_decision' THEN v_kind := 'step'; v_step := 8;
    WHEN 'accepted_match' THEN v_kind := 'step'; v_step := 9;
    WHEN 'chatted' THEN v_kind := 'step'; v_step := 10;
    WHEN 'settings_filled' THEN v_kind := 'side'; v_step := NULL;
    ELSE
      RAISE EXCEPTION 'Unknown registration funnel stage_key: %', p_stage_key;
  END CASE;

  INSERT INTO public.registration_funnel_milestones (
    user_id, stage_key, kind, step_number, reached_at, source, metadata
  )
  VALUES (
    p_user_id, p_stage_key, v_kind, v_step, v_reached_at, p_source, v_meta
  )
  ON CONFLICT (user_id, stage_key) DO NOTHING
  RETURNING id INTO v_new_id;

  v_method := NULLIF(v_meta ->> 'method', '');

  INSERT INTO public.registration_funnel_progress (user_id, created_at, updated_at)
  VALUES (p_user_id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.registration_funnel_progress p
  SET
    signup_submitted_at = CASE
      WHEN p_stage_key = 'signup_submitted'
        THEN COALESCE(p.signup_submitted_at, v_reached_at)
      ELSE p.signup_submitted_at
    END,
    email_verified_at = CASE
      WHEN p_stage_key = 'email_verified'
        THEN COALESCE(p.email_verified_at, v_reached_at)
      ELSE p.email_verified_at
    END,
    academic_filled_at = CASE
      WHEN p_stage_key = 'academic_filled'
        THEN COALESCE(p.academic_filled_at, v_reached_at)
      ELSE p.academic_filled_at
    END,
    context_logistics_at = CASE
      WHEN p_stage_key = 'context_logistics'
        THEN COALESCE(p.context_logistics_at, v_reached_at)
      ELSE p.context_logistics_at
    END,
    using_platform_at = CASE
      WHEN p_stage_key = 'using_platform'
        THEN COALESCE(p.using_platform_at, v_reached_at)
      ELSE p.using_platform_at
    END,
    received_matches_at = CASE
      WHEN p_stage_key = 'received_matches'
        THEN COALESCE(p.received_matches_at, v_reached_at)
      ELSE p.received_matches_at
    END,
    harmony_complete_at = CASE
      WHEN p_stage_key = 'harmony_complete'
        THEN COALESCE(p.harmony_complete_at, v_reached_at)
      ELSE p.harmony_complete_at
    END,
    verification_decision_at = CASE
      WHEN p_stage_key = 'verification_decision'
        THEN COALESCE(p.verification_decision_at, v_reached_at)
      ELSE p.verification_decision_at
    END,
    accepted_match_at = CASE
      WHEN p_stage_key = 'accepted_match'
        THEN COALESCE(p.accepted_match_at, v_reached_at)
      ELSE p.accepted_match_at
    END,
    chatted_at = CASE
      WHEN p_stage_key = 'chatted'
        THEN COALESCE(p.chatted_at, v_reached_at)
      ELSE p.chatted_at
    END,
    settings_filled_at = CASE
      WHEN p_stage_key = 'settings_filled'
        THEN COALESCE(p.settings_filled_at, v_reached_at)
      ELSE p.settings_filled_at
    END,
    verification_method = CASE
      WHEN p_stage_key = 'verification_decision'
        THEN COALESCE(p.verification_method, v_method)
      ELSE p.verification_method
    END,
    furthest_step = GREATEST(p.furthest_step, COALESCE(v_step, 0)),
    updated_at = now()
  WHERE p.user_id = p_user_id;

  RETURN v_new_id IS NOT NULL;
END;
$$;

COMMENT ON FUNCTION public.record_registration_funnel_milestone(uuid, text, text, jsonb, timestamptz) IS
  'Idempotent first-reach funnel milestone + progress upsert. Safe to call from product write paths.';

REVOKE ALL ON FUNCTION public.record_registration_funnel_milestone(uuid, text, text, jsonb, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_registration_funnel_milestone(uuid, text, text, jsonb, timestamptz)
  TO postgres, service_role;

ALTER TABLE public.registration_funnel_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_funnel_progress ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.registration_funnel_milestones FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.registration_funnel_progress FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.registration_funnel_milestones TO postgres, service_role;
GRANT ALL ON TABLE public.registration_funnel_progress TO postgres, service_role;

-- Backfill from existing product tables (best-effort timestamps).
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id AS user_id, created_at AS reached_at
    FROM public.users
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'signup_submitted', 'backfill/users', '{}'::jsonb, r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT user_id, COALESCE(updated_at, created_at, now()) AS reached_at
    FROM public.user_academic
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'academic_filled', 'backfill/user_academic', '{}'::jsonb, r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT user_id, COALESCE(updated_at, now()) AS reached_at
    FROM public.onboarding_sections
    WHERE section IN ('intro', 'academic')
      AND answers IS NOT NULL
      AND jsonb_typeof(answers) = 'array'
      AND jsonb_array_length(answers) > 0
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'academic_filled', 'backfill/onboarding_sections', '{}'::jsonb, r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT user_id, COALESCE(updated_at, now()) AS reached_at
    FROM public.onboarding_sections
    WHERE section = 'logistics-context'
      AND answers IS NOT NULL
      AND jsonb_typeof(answers) = 'array'
      AND jsonb_array_length(answers) > 0
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'context_logistics', 'backfill/onboarding_sections', '{}'::jsonb, r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT user_id, COALESCE(submitted_at, now()) AS reached_at, completion_stage
    FROM public.onboarding_submissions
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'using_platform', 'backfill/onboarding_submissions', '{}'::jsonb, r.reached_at
    );
    IF r.completion_stage IS NULL OR r.completion_stage = 'full' THEN
      PERFORM public.record_registration_funnel_milestone(
        r.user_id, 'harmony_complete', 'backfill/onboarding_submissions', '{}'::jsonb, r.reached_at
      );
    END IF;
  END LOOP;

  FOR r IN
    SELECT DISTINCT unnest(member_ids) AS user_id, MIN(created_at) AS reached_at
    FROM public.match_suggestions
    GROUP BY 1
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'received_matches', 'backfill/match_suggestions', '{}'::jsonb, r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT DISTINCT unnest(accepted_by) AS user_id, MIN(created_at) AS reached_at
    FROM public.match_suggestions
    WHERE accepted_by IS NOT NULL AND cardinality(accepted_by) > 0
    GROUP BY 1
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'accepted_match', 'backfill/match_suggestions', '{}'::jsonb, r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT user_id, MIN(created_at) AS reached_at
    FROM public.messages
    GROUP BY user_id
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'chatted', 'backfill/messages', '{}'::jsonb, r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT u.id AS user_id, COALESCE(u.identity_verified_at, now()) AS reached_at, 'persona'::text AS method
    FROM public.users u
    WHERE u.identity_verified_at IS NOT NULL
    UNION
    SELECT u.id, now(), 'uni_email'
    FROM public.users u
    WHERE u.is_verified_student IS TRUE
    UNION
    SELECT n.user_id, COALESCE(n.updated_at, n.created_at, now()),
      CASE n.last_action
        WHEN 'skipped' THEN 'skipped'
        WHEN 'verified_uni' THEN 'uni_email'
        WHEN 'verified_persona' THEN 'persona'
        ELSE 'skipped'
      END
    FROM public.verification_nudge_state n
    WHERE n.last_action IN ('skipped', 'verified_uni', 'verified_persona')
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id,
      'verification_decision',
      'backfill/verification',
      jsonb_build_object('method', r.method),
      r.reached_at
    );
  END LOOP;

  FOR r IN
    SELECT
      p.user_id,
      COALESCE(p.updated_at, now()) AS reached_at
    FROM public.profiles p
    WHERE COALESCE(NULLIF(btrim(p.bio), ''), NULL) IS NOT NULL
      AND (
        COALESCE(NULLIF(btrim(p.phone), ''), NULL) IS NOT NULL
        OR (p.languages IS NOT NULL AND cardinality(p.languages) > 0)
      )
  LOOP
    PERFORM public.record_registration_funnel_milestone(
      r.user_id, 'settings_filled', 'backfill/profiles', '{}'::jsonb, r.reached_at
    );
  END LOOP;
END $$;
