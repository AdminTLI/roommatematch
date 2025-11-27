-- Migration: Restore compute_compatibility_score function body
-- Date: 2025-11-27
-- Description: The function body was accidentally replaced with placeholder comments.
--              This restores the full function body with proper schema prefixes
--              and adds exception handling.

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
BEGIN
  -- Log function call
  RAISE NOTICE '[Compatibility] === START === user_a_id: %, user_b_id: %', user_a_id, user_b_id;
  
  v_is_valid := public.check_hard_constraints(user_a_id, user_b_id);
  
  IF NOT v_is_valid THEN
    RETURN QUERY SELECT
      0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC,
      0.0::NUMERIC, 0.0::NUMERIC, 'Dealbreaker conflict'::TEXT, 'Hard constraints not met'::TEXT,
      ''::TEXT, '{}'::JSONB, 0.0::NUMERIC, 0.0::NUMERIC, '{}'::JSONB,
      false::BOOLEAN, COMPATIBILITY_ALGORITHM_VERSION::TEXT;
    RETURN;
  END IF;
  
  -- Get user academic profiles
  SELECT ua.university_id, ua.program_id, p.faculty, usy.study_year
  INTO user_a_profile
  FROM public.user_academic ua
  LEFT JOIN public.programs p ON ua.program_id = p.id
  LEFT JOIN public.user_study_year_v usy ON ua.user_id = usy.user_id
  WHERE ua.user_id = user_a_id;
  
  SELECT ua.university_id, ua.program_id, p.faculty, usy.study_year
  INTO user_b_profile
  FROM public.user_academic ua
  LEFT JOIN public.programs p ON ua.program_id = p.id
  LEFT JOIN public.user_study_year_v usy ON ua.user_id = usy.user_id
  WHERE ua.user_id = user_b_id;
  
  RAISE NOTICE '[Compatibility] User profiles - A: university=%, program=%, B: university=%, program=%',
    user_a_profile.university_id, user_a_profile.program_id,
    user_b_profile.university_id, user_b_profile.program_id;
  
  -- Extract harmony dimensions
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
  
  -- Log dimension values
  RAISE NOTICE '[Compatibility] Dimension values - A: cleanliness=%, noise=%, guests=%, sleep=%',
    v_cleanliness_a, v_noise_a, v_guests_a, v_sleep_a;
  RAISE NOTICE '[Compatibility] Dimension values - B: cleanliness=%, noise=%, guests=%, sleep=%',
    v_cleanliness_b, v_noise_b, v_guests_b, v_sleep_b;
  
  -- Calculate similarities
  v_cleanliness_sim := public.calculate_dimension_similarity('cleanliness', v_cleanliness_a, v_cleanliness_b);
  v_noise_sim := public.calculate_dimension_similarity('noise', v_noise_a, v_noise_b);
  v_guests_sim := public.calculate_dimension_similarity('guests', v_guests_a, v_guests_b);
  v_sleep_sim := public.calculate_dimension_similarity('sleep', v_sleep_a, v_sleep_b);
  v_shared_spaces_sim := public.calculate_dimension_similarity('shared_spaces', v_shared_spaces_a, v_shared_spaces_b);
  v_substances_sim := public.calculate_dimension_similarity('substances', v_substances_a, v_substances_b);
  v_study_social_sim := public.calculate_dimension_similarity('study_social', v_study_social_a, v_study_social_b);
  v_home_vibe_sim := public.calculate_dimension_similarity('home_vibe', v_home_vibe_a, v_home_vibe_b);
  
  RAISE NOTICE '[Compatibility] Similarities: cleanliness=%, noise=%, guests=%, sleep=%',
    v_cleanliness_sim, v_noise_sim, v_guests_sim, v_sleep_sim;
  
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
    v_cleanliness_sim, v_noise_sim, v_guests_sim, v_sleep_sim,
    v_shared_spaces_sim, v_substances_sim, v_study_social_sim, v_home_vibe_sim
  );
  
  RAISE NOTICE '[Compatibility] Harmony score: %', v_harmony_score;
  
  -- Calculate context score
  v_study_year_a := COALESCE(user_a_profile.study_year, 1);
  v_study_year_b := COALESCE(user_b_profile.study_year, 1);
  
  v_context_score := public.calculate_context_score(
    user_a_profile.university_id, user_b_profile.university_id,
    user_a_profile.program_id, user_b_profile.program_id,
    user_a_profile.faculty, user_b_profile.faculty,
    v_study_year_a, v_study_year_b
  );
  
  RAISE NOTICE '[Compatibility] Context score: %', v_context_score;
  
  -- Calculate global score
  v_raw_global_score := 0.75 * v_harmony_score + 0.25 * v_context_score;
  
  RAISE NOTICE '[Compatibility] Global score: %', v_raw_global_score;
  
  -- Generate explanations
  v_watch_out_messages := public.generate_watch_out_messages(v_dimension_scores);
  v_top_alignment_msg := public.generate_top_alignment(v_harmony_score, v_context_score, v_dimension_scores);
  
  RAISE NOTICE '[Compatibility] === END === user_a_id: %, user_b_id: %, compatibility_score: %',
    user_a_id, user_b_id, v_raw_global_score;
  
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
      'year_gap', ABS(v_study_year_a - v_study_year_b)
    ),
    v_harmony_score,
    v_context_score,
    v_dimension_scores,
    true::BOOLEAN,
    COMPATIBILITY_ALGORITHM_VERSION::TEXT;

EXCEPTION
  WHEN others THEN
    -- Fail-safe: log and return neutral values instead of raising
    -- Include error message in watch_out field for debugging
    RAISE NOTICE '[Compatibility] ERROR in compute_compatibility_score: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RAISE WARNING '[Compatibility] ERROR DETAILS: %', SQLERRM;

    RETURN QUERY SELECT
      0.0::NUMERIC,  -- compatibility_score
      0.0::NUMERIC,  -- personality_score
      0.0::NUMERIC,  -- schedule_score
      0.0::NUMERIC,  -- lifestyle_score
      0.0::NUMERIC,  -- social_score
      0.0::NUMERIC,  -- academic_bonus
      0.0::NUMERIC,  -- penalty
      'Unavailable'::TEXT,
      ('Compatibility data could not be computed. Error: ' || SQLERRM)::TEXT,  -- Include error message
      ''::TEXT,
      jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE)::JSONB,  -- Include error in academic_details
      0.0::NUMERIC,  -- harmony_score
      0.0::NUMERIC,  -- context_score
      '{}'::JSONB,   -- dimension_scores_json
      FALSE::BOOLEAN,
      COMPATIBILITY_ALGORITHM_VERSION::TEXT;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.compute_compatibility_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_compatibility_score(UUID, UUID) TO service_role;

