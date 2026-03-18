-- Migration: Dual marketplace YP scoring branch for compute_compatibility_score
-- Date: 2026-03-18
-- Description:
--   - Update compute_compatibility_score to branch on profiles.user_type for user_a_id.
--   - student: keep existing 4-layer student logic unchanged.
--   - professional: implement YP logic:
--       * Dealbreakers: same hard-constraint gate (check_hard_constraints)
--       * Harmony: squared Euclidean distance similarity per harmony dimension + risk-aware aggregation
--         using the provided YP weight matrix and harmony_score = 0.7 * weighted_avg + 0.3 * ((worst + second_worst)/2.0)
--       * Context: Professional Context Score from onboarding answers:
--           - WFH Match (wfh_status): exact=1.0, hybrid-vs-(remote|office)=0.5, remote-vs-office=0.0
--           - Age Gap (age): diff<=3 =>1.0, diff>=8=>0.0, linear interpolation in between
--       * Global score: global_score = (harmony_score * 0.85) + (context_score * 0.15)
--       * Return safety:
--           - academic_bonus returns context_score
--           - academic_details includes wfh_status + age and derived context scores

CREATE OR REPLACE FUNCTION public.compute_compatibility_score(
  user_a_id UUID,
  user_b_id UUID
) RETURNS TABLE (
  compatibility_score NUMERIC,
  personality_score NUMERIC,
  schedule_score NUMERIC,
  lifestyle_score NUMERIC,
  social_score NUMERIC,
  academic_bonus NUMERIC,
  penalty NUMERIC,
  top_alignment TEXT,
  watch_out TEXT,
  house_rules_suggestion TEXT,
  academic_details JSONB,
  harmony_score NUMERIC,
  context_score NUMERIC,
  dimension_scores_json JSONB,
  is_valid_match BOOLEAN,
  algorithm_version TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  COMPATIBILITY_ALGORITHM_VERSION CONSTANT TEXT := 'v1.0';

  v_user_a_type TEXT;

  -- Student branch profile context
  user_a_profile RECORD;
  user_b_profile RECORD;

  -- Harmony dimension extraction values (existing student harmony primitives)
  v_cleanliness_a NUMERIC;
  v_cleanliness_b NUMERIC;
  v_noise_a NUMERIC;
  v_noise_b NUMERIC;
  v_guests_a NUMERIC;
  v_guests_b NUMERIC;
  v_sleep_a NUMERIC;
  v_sleep_b NUMERIC;
  v_shared_spaces_a NUMERIC;
  v_shared_spaces_b NUMERIC;
  v_substances_a NUMERIC;
  v_substances_b NUMERIC;
  v_study_social_a NUMERIC;
  v_study_social_b NUMERIC;
  v_home_vibe_a NUMERIC;
  v_home_vibe_b NUMERIC;

  -- Similarities for student branch
  v_cleanliness_sim NUMERIC;
  v_noise_sim NUMERIC;
  v_guests_sim NUMERIC;
  v_sleep_sim NUMERIC;
  v_shared_spaces_sim NUMERIC;
  v_substances_sim NUMERIC;
  v_study_social_sim NUMERIC;
  v_home_vibe_sim NUMERIC;

  -- Scores (student branch)
  v_harmony_score NUMERIC;
  v_context_score NUMERIC;
  v_raw_global_score NUMERIC;

  v_dimension_scores JSONB;

  v_watch_out_messages TEXT[];
  v_top_alignment_msg TEXT;

  -- Location soft-weighting (student branch only)
  v_location_score NUMERIC;
  v_location_overlap_count INTEGER;
  v_location_weight CONSTANT NUMERIC := 0.30;

  -- Professional context inputs
  v_a_prefs JSONB;
  v_b_prefs JSONB;
  v_wfh_a TEXT;
  v_wfh_b TEXT;
  v_age_a INTEGER;
  v_age_b INTEGER;

  v_wfh_match_score NUMERIC;
  v_age_gap_score NUMERIC;

  -- Professional harmony section similarities (mapped from existing harmony primitives)
  v_rel_logistics_sim NUMERIC;
  v_sleep_circadian_sim NUMERIC;
  v_home_operations_sim NUMERIC;
  v_privacy_territoriality_sim NUMERIC;
  v_noise_sensory_sim NUMERIC;
  v_communication_conflict_sim NUMERIC;
  v_personality_values_sim NUMERIC;
  v_social_hosting_sim NUMERIC;

  -- Professional harmony aggregation (YP weight matrix)
  v_weighted_avg NUMERIC;
  v_worst NUMERIC;
  v_second_worst NUMERIC;
  v_yp_harmony_score NUMERIC;
  v_yp_global_score NUMERIC;
BEGIN
  -- Dealbreaker / hard-constraints check first (same for both branches)
  IF NOT public.check_hard_constraints(user_a_id, user_b_id) THEN
    RETURN QUERY SELECT
      0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC,
      0.0::NUMERIC, 0.0::NUMERIC, 'Dealbreaker conflict'::TEXT, 'Hard constraints not met'::TEXT,
      ''::TEXT, '{}'::JSONB, 0.0::NUMERIC, 0.0::NUMERIC, '{}'::JSONB,
      false::BOOLEAN, COMPATIBILITY_ALGORITHM_VERSION::TEXT;
    RETURN;
  END IF;

  -- Decide branch based on user_a cohort
  SELECT p.user_type INTO v_user_a_type
  FROM public.profiles p
  WHERE p.user_id = user_a_id;

  -- -----------------------
  -- Professional (YP) branch
  -- -----------------------
  IF v_user_a_type = 'professional' THEN
    -- Extract harmony primitives (we'll map them to YP section keys)
    v_cleanliness_a := public.get_cleanliness_dimension(user_a_id);
    v_cleanliness_b := public.get_cleanliness_dimension(user_b_id);
    v_noise_a := public.get_noise_dimension(user_a_id);
    v_noise_b := public.get_noise_dimension(user_b_id);
    v_guests_a := public.get_guests_dimension(user_a_id);
    v_guests_b := public.get_guests_dimension(user_b_id);
    v_sleep_a := public.get_sleep_dimension(user_a_id);
    v_sleep_b := public.get_sleep_dimension(user_b_id);
    v_shared_spaces_a := public.get_shared_spaces_dimension(user_a_id);
    v_shared_spaces_b := public.get_shared_spaces_dimension(user_b_id);
    v_substances_a := public.get_substances_dimension(user_a_id);
    v_substances_b := public.get_substances_dimension(user_b_id);
    v_study_social_a := public.get_study_social_dimension(user_a_id);
    v_study_social_b := public.get_study_social_dimension(user_b_id);
    v_home_vibe_a := public.get_home_vibe_dimension(user_a_id);
    v_home_vibe_b := public.get_home_vibe_dimension(user_b_id);

    -- Squared Euclidean similarity per harmony primitive:
    -- similarity = 1 - (a-b)^2, clamped to [0,1]
    v_rel_logistics_sim := GREATEST(0.0, 1.0 - POWER(v_substances_a - v_substances_b, 2));
    v_sleep_circadian_sim := GREATEST(0.0, 1.0 - POWER(v_sleep_a - v_sleep_b, 2));
    v_home_operations_sim := GREATEST(0.0, 1.0 - POWER(v_cleanliness_a - v_cleanliness_b, 2));
    v_privacy_territoriality_sim := GREATEST(0.0, 1.0 - POWER(v_shared_spaces_a - v_shared_spaces_b, 2));
    v_noise_sensory_sim := GREATEST(0.0, 1.0 - POWER(v_noise_a - v_noise_b, 2));
    v_communication_conflict_sim := GREATEST(0.0, 1.0 - POWER(v_study_social_a - v_study_social_b, 2));
    v_personality_values_sim := GREATEST(0.0, 1.0 - POWER(v_home_vibe_a - v_home_vibe_b, 2));
    v_social_hosting_sim := GREATEST(0.0, 1.0 - POWER(v_guests_a - v_guests_b, 2));

    -- Risk-aware harmony aggregation with YP weights
    v_weighted_avg :=
      0.22 * v_rel_logistics_sim +
      0.18 * v_sleep_circadian_sim +
      0.16 * v_home_operations_sim +
      0.14 * v_privacy_territoriality_sim +
      0.12 * v_noise_sensory_sim +
      0.10 * v_communication_conflict_sim +
      0.05 * v_personality_values_sim +
      0.03 * v_social_hosting_sim;

    v_worst := LEAST(
      v_rel_logistics_sim,
      v_sleep_circadian_sim,
      v_home_operations_sim,
      v_privacy_territoriality_sim,
      v_noise_sensory_sim,
      v_communication_conflict_sim,
      v_personality_values_sim,
      v_social_hosting_sim
    );

    -- Second worst by selecting the smallest similarity > worst (if any)
    v_second_worst := v_worst;
    IF v_rel_logistics_sim > v_worst AND (v_second_worst = v_worst OR v_rel_logistics_sim < v_second_worst) THEN
      v_second_worst := v_rel_logistics_sim;
    END IF;
    IF v_sleep_circadian_sim > v_worst AND (v_second_worst = v_worst OR v_sleep_circadian_sim < v_second_worst) THEN
      v_second_worst := v_sleep_circadian_sim;
    END IF;
    IF v_home_operations_sim > v_worst AND (v_second_worst = v_worst OR v_home_operations_sim < v_second_worst) THEN
      v_second_worst := v_home_operations_sim;
    END IF;
    IF v_privacy_territoriality_sim > v_worst AND (v_second_worst = v_worst OR v_privacy_territoriality_sim < v_second_worst) THEN
      v_second_worst := v_privacy_territoriality_sim;
    END IF;
    IF v_noise_sensory_sim > v_worst AND (v_second_worst = v_worst OR v_noise_sensory_sim < v_second_worst) THEN
      v_second_worst := v_noise_sensory_sim;
    END IF;
    IF v_communication_conflict_sim > v_worst AND (v_second_worst = v_worst OR v_communication_conflict_sim < v_second_worst) THEN
      v_second_worst := v_communication_conflict_sim;
    END IF;
    IF v_personality_values_sim > v_worst AND (v_second_worst = v_worst OR v_personality_values_sim < v_second_worst) THEN
      v_second_worst := v_personality_values_sim;
    END IF;
    IF v_social_hosting_sim > v_worst AND (v_second_worst = v_worst OR v_social_hosting_sim < v_second_worst) THEN
      v_second_worst := v_social_hosting_sim;
    END IF;

    IF v_second_worst = v_worst THEN
      v_second_worst := v_worst;
    END IF;

    v_yp_harmony_score := 0.7 * v_weighted_avg + 0.3 * ((v_worst + v_second_worst) / 2.0);
    v_yp_harmony_score := GREATEST(0.0, LEAST(1.0, v_yp_harmony_score));

    v_dimension_scores := jsonb_build_object(
      'reliability_logistics', v_rel_logistics_sim,
      'sleep_circadian', v_sleep_circadian_sim,
      'home_operations', v_home_operations_sim,
      'privacy_territoriality', v_privacy_territoriality_sim,
      'noise_sensory', v_noise_sensory_sim,
      'communication_conflict', v_communication_conflict_sim,
      'personality_values', v_personality_values_sim,
      'social_hosting', v_social_hosting_sim
    );

    -- Professional Context: read wfh_status + age from onboarding answers
    v_a_prefs := public.resolve_user_preferences(user_a_id);
    v_b_prefs := public.resolve_user_preferences(user_b_id);

    v_wfh_a := v_a_prefs->>'wfh_status';
    v_wfh_b := v_b_prefs->>'wfh_status';
    v_age_a := NULLIF(v_a_prefs->>'age', '')::INTEGER;
    v_age_b := NULLIF(v_b_prefs->>'age', '')::INTEGER;

    -- WFH match score
    IF v_wfh_a IS NULL OR v_wfh_b IS NULL THEN
      v_wfh_match_score := 0.5;
    ELSIF v_wfh_a = v_wfh_b THEN
      v_wfh_match_score := 1.0;
    ELSIF (
      (v_wfh_a = 'hybrid' AND v_wfh_b IN ('fully_remote', 'fully_office')) OR
      (v_wfh_b = 'hybrid' AND v_wfh_a IN ('fully_remote', 'fully_office'))
    ) THEN
      v_wfh_match_score := 0.5;
    ELSIF (
      (v_wfh_a = 'fully_remote' AND v_wfh_b = 'fully_office') OR
      (v_wfh_b = 'fully_remote' AND v_wfh_a = 'fully_office')
    ) THEN
      v_wfh_match_score := 0.0;
    ELSE
      v_wfh_match_score := 0.5;
    END IF;

    -- Age gap score
    IF v_age_a IS NULL OR v_age_b IS NULL THEN
      v_age_gap_score := 0.5;
    ELSE
      v_context_score := ABS(v_age_a - v_age_b); -- reuse variable for diff
      IF v_context_score <= 3 THEN
        v_age_gap_score := 1.0;
      ELSIF v_context_score >= 8 THEN
        v_age_gap_score := 0.0;
      ELSE
        v_age_gap_score := 1.0 - (v_context_score - 3) / 5.0;
      END IF;
    END IF;

    v_context_score := 0.60 * v_wfh_match_score + 0.40 * v_age_gap_score;
    v_context_score := GREATEST(0.0, LEAST(1.0, v_context_score));

    -- Global score: 85% harmony, 15% context
    v_yp_global_score := (v_yp_harmony_score * 0.85) + (v_context_score * 0.15);
    v_yp_global_score := GREATEST(0.0, LEAST(1.0, v_yp_global_score));

    -- Explanations (simple YP templates)
    v_watch_out_messages := ARRAY[]::TEXT[];
    v_top_alignment_msg :=
      CASE
        WHEN v_yp_harmony_score >= 0.8 AND v_context_score >= 0.8 THEN 'Strong day-to-day harmony and matching context'
        WHEN v_yp_harmony_score >= 0.8 THEN 'Excellent behavioral harmony'
        WHEN v_context_score >= 0.8 THEN 'Strong work arrangement and age fit'
        ELSE 'Balanced compatibility across living style and context'
      END;

    RETURN QUERY SELECT
      v_yp_global_score,                     -- compatibility_score
      v_yp_harmony_score,                   -- personality_score (legacy UI mapping)
      v_sleep_circadian_sim,               -- schedule_score (legacy UI mapping)
      (v_home_operations_sim + v_privacy_territoriality_sim) / 2.0, -- lifestyle_score
      (v_social_hosting_sim + v_noise_sensory_sim) / 2.0,          -- social_score
      v_context_score,                      -- academic_bonus (mapped context_score)
      0.0::NUMERIC,                         -- penalty (dealbreakers already enforced)
      v_top_alignment_msg,                 -- top_alignment
      ''::TEXT,                             -- watch_out
      'Coordinate work-from-home routines and privacy expectations for a smooth living setup.'::TEXT,
      jsonb_build_object(
        'wfh_status', v_wfh_a,
        'age', v_age_a,
        'wfh_status_a', v_wfh_a,
        'wfh_status_b', v_wfh_b,
        'age_a', v_age_a,
        'age_b', v_age_b,
        'wfh_match_score', v_wfh_match_score,
        'age_gap_score', v_age_gap_score
      ),
      v_yp_harmony_score,                  -- harmony_score (new)
      v_context_score,                    -- context_score (new)
      v_dimension_scores,                -- dimension_scores_json
      true::BOOLEAN,                       -- is_valid_match
      COMPATIBILITY_ALGORITHM_VERSION::TEXT;

    RETURN;
  END IF;

  -- -----------------------
  -- Student branch (existing logic unchanged)
  -- -----------------------
  -- Academic + profile context (including preferred_cities from profiles)
  SELECT
    ua.university_id,
    ua.program_id,
    p.faculty,
    usy.study_year,
    (COALESCE(ua.undecided_program, false) OR ua.program_id IS NULL) AS undecided_program,
    pr.preferred_cities
  INTO user_a_profile
  FROM public.user_academic ua
  LEFT JOIN public.programs p ON ua.program_id = p.id
  LEFT JOIN public.user_study_year_v usy ON ua.user_id = usy.user_id
  LEFT JOIN public.profiles pr ON pr.user_id = ua.user_id
  WHERE ua.user_id = user_a_id;

  SELECT
    ua.university_id,
    ua.program_id,
    p.faculty,
    usy.study_year,
    (COALESCE(ua.undecided_program, false) OR ua.program_id IS NULL) AS undecided_program,
    pr.preferred_cities
  INTO user_b_profile
  FROM public.user_academic ua
  LEFT JOIN public.programs p ON ua.program_id = p.id
  LEFT JOIN public.user_study_year_v usy ON ua.user_id = usy.user_id
  LEFT JOIN public.profiles pr ON pr.user_id = ua.user_id
  WHERE ua.user_id = user_b_id;

  -- Harmony dimension values
  v_cleanliness_a := public.get_cleanliness_dimension(user_a_id);
  v_cleanliness_b := public.get_cleanliness_dimension(user_b_id);
  v_noise_a := public.get_noise_dimension(user_a_id);
  v_noise_b := public.get_noise_dimension(user_b_id);
  v_guests_a := public.get_guests_dimension(user_a_id);
  v_guests_b := public.get_guests_dimension(user_b_id);
  v_sleep_a := public.get_sleep_dimension(user_a_id);
  v_sleep_b := public.get_sleep_dimension(user_b_id);
  v_shared_spaces_a := public.get_shared_spaces_dimension(user_a_id);
  v_shared_spaces_b := public.get_shared_spaces_dimension(user_b_id);
  v_substances_a := public.get_substances_dimension(user_a_id);
  v_substances_b := public.get_substances_dimension(user_b_id);
  v_study_social_a := public.get_study_social_dimension(user_a_id);
  v_study_social_b := public.get_study_social_dimension(user_b_id);
  v_home_vibe_a := public.get_home_vibe_dimension(user_a_id);
  v_home_vibe_b := public.get_home_vibe_dimension(user_b_id);

  -- Dimension similarities
  v_cleanliness_sim := public.calculate_dimension_similarity('cleanliness', v_cleanliness_a, v_cleanliness_b);
  v_noise_sim := public.calculate_dimension_similarity('noise', v_noise_a, v_noise_b);
  v_guests_sim := public.calculate_dimension_similarity('guests', v_guests_a, v_guests_b);
  v_sleep_sim := public.calculate_dimension_similarity('sleep', v_sleep_a, v_sleep_b);
  v_shared_spaces_sim := public.calculate_dimension_similarity('shared_spaces', v_shared_spaces_a, v_shared_spaces_b);
  v_substances_sim := public.calculate_dimension_similarity('substances', v_substances_a, v_substances_b);
  v_study_social_sim := public.calculate_dimension_similarity('study_social', v_study_social_a, v_study_social_b);
  v_home_vibe_sim := public.calculate_dimension_similarity('home_vibe', v_home_vibe_a, v_home_vibe_b);

  v_dimension_scores := jsonb_build_object(
    'cleanliness', v_cleanliness_sim,
    'noise', v_noise_sim,
    'guests', v_guests_sim,
    'sleep', v_sleep_sim,
    'shared_spaces', v_shared_spaces_sim,
    'substances', v_substances_sim,
    'study_social', v_study_social_sim,
    'home_vibe', v_home_vibe_sim
  );

  v_harmony_score := public.calculate_harmony_score(
    v_cleanliness_sim,
    v_noise_sim,
    v_guests_sim,
    v_sleep_sim,
    v_shared_spaces_sim,
    v_substances_sim,
    v_study_social_sim,
    v_home_vibe_sim
  );

  -- Base academic context score (university / programme / study year)
  v_raw_global_score := NULL;
  v_context_score := NULL;

  -- Study year for context score
  -- (calculate_context_score expects NULL handling for undecided_program)
  v_context_score := public.calculate_context_score(
    user_a_profile.university_id,
    user_b_profile.university_id,
    user_a_profile.program_id,
    user_b_profile.program_id,
    user_a_profile.faculty,
    user_b_profile.faculty,
    COALESCE(user_a_profile.study_year, 1),
    COALESCE(user_b_profile.study_year, 1),
    user_a_profile.undecided_program,
    user_b_profile.undecided_program
  );

  -- Location soft-weighting (soft only; does not hard-filter)
  v_location_score := NULL;
  v_location_overlap_count := 0;

  IF user_a_profile.preferred_cities IS NOT NULL
     AND array_length(user_a_profile.preferred_cities, 1) > 0
     AND user_b_profile.preferred_cities IS NOT NULL
     AND array_length(user_b_profile.preferred_cities, 1) > 0 THEN

    SELECT COUNT(*) INTO v_location_overlap_count
    FROM (
      SELECT DISTINCT lower(trim(a_city)) AS city
      FROM unnest(user_a_profile.preferred_cities) AS a_city
      INNER JOIN unnest(user_b_profile.preferred_cities) AS b_city
        ON lower(trim(a_city)) = lower(trim(b_city))
    ) AS overlap;

    IF v_location_overlap_count >= 1 THEN
      v_location_score := 1.0;
    ELSE
      v_location_score := 0.0;
    END IF;
  END IF;

  IF v_location_score IS NOT NULL THEN
    v_context_score := (1.0 - v_location_weight) * v_context_score + v_location_weight * v_location_score;
  END IF;

  -- Global compatibility score (existing student blend)
  v_raw_global_score := 0.75 * v_harmony_score + 0.25 * v_context_score;
  v_raw_global_score := GREATEST(0.0, LEAST(1.0, v_raw_global_score));

  v_watch_out_messages := public.generate_watch_out_messages(v_dimension_scores);
  v_top_alignment_msg := public.generate_top_alignment(v_harmony_score, v_context_score, v_dimension_scores);

  RETURN QUERY SELECT
    v_raw_global_score,
    v_harmony_score,
    v_sleep_sim,
    (v_cleanliness_sim + v_shared_spaces_sim) / 2.0,
    (v_guests_sim + v_noise_sim) / 2.0,
    v_context_score,
    0.0::NUMERIC,
    v_top_alignment_msg,
    array_to_string(v_watch_out_messages, ' '),
    'Discuss shared spaces, quiet hours, and guest policies'::TEXT,
    jsonb_build_object(
      'university_affinity', user_a_profile.university_id = user_b_profile.university_id,
      'program_affinity', user_a_profile.program_id = user_b_profile.program_id AND user_a_profile.program_id IS NOT NULL,
      'faculty_affinity', user_a_profile.faculty = user_b_profile.faculty AND user_a_profile.faculty IS NOT NULL,
      'year_gap', ABS(COALESCE(user_a_profile.study_year, 1) - COALESCE(user_b_profile.study_year, 1)),
      'location_overlap_count', v_location_overlap_count
    ),
    v_harmony_score,
    v_context_score,
    v_dimension_scores,
    true::BOOLEAN,
    COMPATIBILITY_ALGORITHM_VERSION::TEXT;

EXCEPTION
  WHEN others THEN
    RAISE WARNING '[Compatibility] ERROR in compute_compatibility_score (dual marketplace): % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN QUERY SELECT
      0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC,
      0.0::NUMERIC, 0.0::NUMERIC, 'Error computing score'::TEXT, SQLERRM::TEXT, ''::TEXT,
      '{}'::JSONB, 0.0::NUMERIC, 0.0::NUMERIC, '{}'::JSONB,
      false::BOOLEAN, COMPATIBILITY_ALGORITHM_VERSION::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_compatibility_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_compatibility_score(UUID, UUID) TO service_role;

COMMENT ON FUNCTION public.compute_compatibility_score(UUID, UUID) IS
  'Dual marketplace support: branches on profiles.user_type (student vs professional). Student keeps harmony+context student logic; professional uses YP harmony/context from wfh_status + age.';

