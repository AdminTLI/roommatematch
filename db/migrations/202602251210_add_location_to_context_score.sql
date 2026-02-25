-- Migration: Incorporate preferred_cities into context_score as a soft-weighted boost
-- Date: 2026-02-25
-- Description:
--   - Extends compute_compatibility_score to:
--       * Read preferred_cities from profiles for both users
--       * Compute a location overlap metric based on intersecting preferred_cities
--       * Blend location overlap into context_score with a soft weight (no hard filter)
--   - Location remains a SOFT preference: pairs with 0 overlapping cities can still match
--     if their harmony_score is high.

-- NOTE: This migration assumes the 10-parameter calculate_context_score() introduced in
--       162_undecided_program_neutral_context.sql is already present.

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

  user_a_profile RECORD;
  user_b_profile RECORD;

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

  v_cleanliness_sim NUMERIC;
  v_noise_sim NUMERIC;
  v_guests_sim NUMERIC;
  v_sleep_sim NUMERIC;
  v_shared_spaces_sim NUMERIC;
  v_substances_sim NUMERIC;
  v_study_social_sim NUMERIC;
  v_home_vibe_sim NUMERIC;

  v_harmony_score NUMERIC;
  v_context_score NUMERIC;
  v_raw_global_score NUMERIC;

  v_is_valid BOOLEAN;
  v_study_year_a INTEGER;
  v_study_year_b INTEGER;
  v_dimension_scores JSONB;
  v_watch_out_messages TEXT[];
  v_top_alignment_msg TEXT;

  -- Location soft-weighting
  v_location_score NUMERIC;
  v_location_overlap_count INTEGER;
  v_location_weight CONSTANT NUMERIC := 0.30; -- 30% of context_score allocated to location when available
BEGIN
  -- Dealbreaker / hard-constraints check first
  v_is_valid := public.check_hard_constraints(user_a_id, user_b_id);

  IF NOT v_is_valid THEN
    RETURN QUERY SELECT
      0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC,
      0.0::NUMERIC, 0.0::NUMERIC,
      'Dealbreaker conflict'::TEXT,
      'Hard constraints not met'::TEXT,
      ''::TEXT,
      '{}'::JSONB,
      0.0::NUMERIC,
      0.0::NUMERIC,
      '{}'::JSONB,
      false::BOOLEAN,
      COMPATIBILITY_ALGORITHM_VERSION::TEXT;
    RETURN;
  END IF;

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
  v_study_year_a := COALESCE(user_a_profile.study_year, 1);
  v_study_year_b := COALESCE(user_b_profile.study_year, 1);

  v_context_score := public.calculate_context_score(
    user_a_profile.university_id,
    user_b_profile.university_id,
    user_a_profile.program_id,
    user_b_profile.program_id,
    user_a_profile.faculty,
    user_b_profile.faculty,
    v_study_year_a,
    v_study_year_b,
    user_a_profile.undecided_program,
    user_b_profile.undecided_program
  );

  -- Location-based soft preference: preferred_cities intersection
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
      v_location_score := 1.0; -- full credit for location metric
    ELSE
      v_location_score := 0.0; -- zero for location metric when both have cities but no overlap
    END IF;
  END IF;

  -- Blend location metric into context_score with soft weight
  -- If we have no reliable location data for either user, leave context_score as academic-only.
  IF v_location_score IS NOT NULL THEN
    v_context_score := (1.0 - v_location_weight) * v_context_score + v_location_weight * v_location_score;
  END IF;

  -- Global compatibility score (still 75% harmony, 25% context)
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
      'year_gap', ABS(v_study_year_a - v_study_year_b),
      'location_overlap_count', v_location_overlap_count
    ),
    v_harmony_score,
    v_context_score,
    v_dimension_scores,
    true::BOOLEAN,
    COMPATIBILITY_ALGORITHM_VERSION::TEXT;

EXCEPTION
  WHEN others THEN
    RAISE WARNING '[Compatibility] ERROR in compute_compatibility_score (with location): % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN QUERY SELECT
      0.0::NUMERIC,
      0.0::NUMERIC,
      0.0::NUMERIC,
      0.0::NUMERIC,
      0.0::NUMERIC,
      0.0::NUMERIC,
      0.0::NUMERIC,
      'Error computing score'::TEXT,
      SQLERRM::TEXT,
      ''::TEXT,
      '{}'::JSONB,
      0.0::NUMERIC,
      0.0::NUMERIC,
      '{}'::JSONB,
      false::BOOLEAN,
      COMPATIBILITY_ALGORITHM_VERSION::TEXT;
END;
$$;

COMMENT ON FUNCTION public.compute_compatibility_score(UUID, UUID) IS
  'Computes roommate compatibility with harmony_score and context_score, where context_score includes a soft-weighted preferred_cities overlap from profiles (no hard location filter).';

