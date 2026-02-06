-- Migration: Add debug logging to compute_compatibility_score
-- This will help identify why the same scores are returned for different users

-- Create a temporary logging function (we'll remove it later)
CREATE OR REPLACE FUNCTION log_compatibility_debug(
  p_user_a_id UUID,
  p_user_b_id UUID,
  p_dimension_name TEXT,
  p_value_a NUMERIC,
  p_value_b NUMERIC,
  p_similarity NUMERIC
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log to PostgreSQL log (check server logs)
  RAISE NOTICE '[Compatibility Debug] user_a: %, user_b: %, dimension: %, value_a: %, value_b: %, similarity: %',
    p_user_a_id, p_user_b_id, p_dimension_name, p_value_a, p_value_b, p_similarity;
END;
$$;

-- Now update compute_compatibility_score to add logging
CREATE OR REPLACE FUNCTION compute_compatibility_score(
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
  
  v_is_valid := check_hard_constraints(user_a_id, user_b_id);
  
  IF NOT v_is_valid THEN
    RETURN QUERY SELECT
      0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC, 0.0::NUMERIC,
      0.0::NUMERIC, 0.0::NUMERIC, 'Dealbreaker conflict'::TEXT, 'Hard constraints not met'::TEXT,
      ''::TEXT, '{}'::JSONB, 0.0::NUMERIC, 0.0::NUMERIC, '{}'::JSONB,
      false::BOOLEAN, COMPATIBILITY_ALGORITHM_VERSION::TEXT;
    RETURN;
  END IF;
  
  -- Get user academic profiles (include undecided_program for context score)
  SELECT ua.university_id, ua.program_id, p.faculty, usy.study_year,
    (COALESCE(ua.undecided_program, false) OR ua.program_id IS NULL) AS undecided_program
  INTO user_a_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  LEFT JOIN user_study_year_v usy ON ua.user_id = usy.user_id
  WHERE ua.user_id = user_a_id;
  
  SELECT ua.university_id, ua.program_id, p.faculty, usy.study_year,
    (COALESCE(ua.undecided_program, false) OR ua.program_id IS NULL) AS undecided_program
  INTO user_b_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  LEFT JOIN user_study_year_v usy ON ua.user_id = usy.user_id
  WHERE ua.user_id = user_b_id;
  
  RAISE NOTICE '[Compatibility] User profiles - A: university=%, program=%, B: university=%, program=%',
    user_a_profile.university_id, user_a_profile.program_id,
    user_b_profile.university_id, user_b_profile.program_id;
  
  -- Extract harmony dimensions
  v_cleanliness_a := get_cleanliness_dimension(user_a_id);
  v_cleanliness_b := get_cleanliness_dimension(user_b_id);
  v_noise_a := get_noise_dimension(user_a_id);
  v_noise_b := get_noise_dimension(user_b_id);
  v_guests_a := get_guests_dimension(user_a_id);
  v_guests_b := get_guests_dimension(user_b_id);
  v_sleep_a := get_sleep_dimension(user_a_id);
  v_sleep_b := get_sleep_dimension(user_b_id);
  v_shared_spaces_a := get_shared_spaces_dimension(user_a_id);
  v_shared_spaces_b := get_shared_spaces_dimension(user_b_id);
  v_substances_a := get_substances_dimension(user_a_id);
  v_substances_b := get_substances_dimension(user_b_id);
  v_study_social_a := get_study_social_dimension(user_a_id);
  v_study_social_b := get_study_social_dimension(user_b_id);
  v_home_vibe_a := get_home_vibe_dimension(user_a_id);
  v_home_vibe_b := get_home_vibe_dimension(user_b_id);
  
  -- Log dimension values
  RAISE NOTICE '[Compatibility] Dimension values - A: cleanliness=%, noise=%, guests=%, sleep=%',
    v_cleanliness_a, v_noise_a, v_guests_a, v_sleep_a;
  RAISE NOTICE '[Compatibility] Dimension values - B: cleanliness=%, noise=%, guests=%, sleep=%',
    v_cleanliness_b, v_noise_b, v_guests_b, v_sleep_b;
  
  -- Calculate similarities
  v_cleanliness_sim := calculate_dimension_similarity('cleanliness', v_cleanliness_a, v_cleanliness_b);
  v_noise_sim := calculate_dimension_similarity('noise', v_noise_a, v_noise_b);
  v_guests_sim := calculate_dimension_similarity('guests', v_guests_a, v_guests_b);
  v_sleep_sim := calculate_dimension_similarity('sleep', v_sleep_a, v_sleep_b);
  v_shared_spaces_sim := calculate_dimension_similarity('shared_spaces', v_shared_spaces_a, v_shared_spaces_b);
  v_substances_sim := calculate_dimension_similarity('substances', v_substances_a, v_substances_b);
  v_study_social_sim := calculate_dimension_similarity('study_social', v_study_social_a, v_study_social_b);
  v_home_vibe_sim := calculate_dimension_similarity('home_vibe', v_home_vibe_a, v_home_vibe_b);
  
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
  
  v_harmony_score := calculate_harmony_score(
    v_cleanliness_sim, v_noise_sim, v_guests_sim, v_sleep_sim,
    v_shared_spaces_sim, v_substances_sim, v_study_social_sim, v_home_vibe_sim
  );
  
  RAISE NOTICE '[Compatibility] Harmony score: %', v_harmony_score;
  
  -- Calculate context score
  v_study_year_a := COALESCE(user_a_profile.study_year, 1);
  v_study_year_b := COALESCE(user_b_profile.study_year, 1);
  
  v_context_score := calculate_context_score(
    user_a_profile.university_id, user_b_profile.university_id,
    user_a_profile.program_id, user_b_profile.program_id,
    user_a_profile.faculty, user_b_profile.faculty,
    v_study_year_a, v_study_year_b,
    user_a_profile.undecided_program, user_b_profile.undecided_program
  );
  
  RAISE NOTICE '[Compatibility] Context score: %', v_context_score;
  
  -- Calculate global score
  v_raw_global_score := 0.75 * v_harmony_score + 0.25 * v_context_score;
  
  RAISE NOTICE '[Compatibility] Global score: %', v_raw_global_score;
  
  -- Generate explanations
  v_watch_out_messages := generate_watch_out_messages(v_dimension_scores);
  v_top_alignment_msg := generate_top_alignment(v_harmony_score, v_context_score, v_dimension_scores);
  
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
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION compute_compatibility_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_compatibility_score(UUID, UUID) TO service_role;

