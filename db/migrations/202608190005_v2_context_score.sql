-- calculate_context_score_v2(user_a, user_b)
-- Returns 0–1.  Formula: 0.5 × academic_city_score + 0.5 × M1_logistics_score
--
-- academic_city_score (same formula as v1):
--   0.40 × university_match + 0.35 × programme/faculty_match + 0.25 × study_year_proximity
--
-- M1_logistics_score: weighted similarity across 8 soft M1 items
--   (cost split, rule strictness, escalation stance, stay length, move-in flexibility,
--    docs language, roommate agreement, insurance)

CREATE OR REPLACE FUNCTION public.calculate_context_score_v2(
  p_a UUID,
  p_b UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- academic/city
  v_univ_a    TEXT; v_univ_b    TEXT;
  v_prog_a    TEXT; v_prog_b    TEXT;
  v_year_a    INT;  v_year_b    INT;
  v_city_a    TEXT; v_city_b    TEXT;

  v_univ_sim  NUMERIC;
  v_prog_sim  NUMERIC;
  v_year_sim  NUMERIC;
  v_city_sim  NUMERIC;
  v_acad_score NUMERIC;

  -- M1 logistics
  s_lc TEXT := 'logistics-context';
  a_M1Q10 JSONB; b_M1Q10 JSONB;
  a_M1Q20 JSONB; b_M1Q20 JSONB;
  a_M6Q7  JSONB; b_M6Q7  JSONB;
  a_M8Q23 JSONB; b_M8Q23 JSONB;
  a_M8Q20 JSONB; b_M8Q20 JSONB;
  a_M8Q25 JSONB; b_M8Q25 JSONB;
  a_M8Q24 JSONB; b_M8Q24 JSONB;
  a_M8Q12 JSONB; b_M8Q12 JSONB;
  v_logistics_score NUMERIC;
BEGIN
  -- ── Academic / city component (profiles.user_id + user_academic) ────────────
  -- NOTE: full corrected implementation lives in
  -- 202608200001_fix_v2_onboarding_save_and_matching.sql / supabase migration
  -- 20260820111150_fix_v2_onboarding_save_and_matching.sql
  SELECT ua.university_id::text, ua.program_id::text, usy.study_year,
         COALESCE(pr.preferred_cities[1], NULL)
    INTO v_univ_a, v_prog_a, v_year_a, v_city_a
    FROM public.profiles pr
    LEFT JOIN public.user_academic ua ON ua.user_id = pr.user_id
    LEFT JOIN public.user_study_year_v usy ON usy.user_id = pr.user_id
   WHERE pr.user_id = p_a;

  SELECT ua.university_id::text, ua.program_id::text, usy.study_year,
         COALESCE(pr.preferred_cities[1], NULL)
    INTO v_univ_b, v_prog_b, v_year_b, v_city_b
    FROM public.profiles pr
    LEFT JOIN public.user_academic ua ON ua.user_id = pr.user_id
    LEFT JOIN public.user_study_year_v usy ON usy.user_id = pr.user_id
   WHERE pr.user_id = p_b;

  v_univ_sim := CASE WHEN v_univ_a IS NOT NULL AND v_univ_b IS NOT NULL
                     THEN CASE WHEN v_univ_a = v_univ_b THEN 1.0 ELSE 0.0 END
                     ELSE 0.5 END;

  v_prog_sim := CASE WHEN v_prog_a IS NOT NULL AND v_prog_b IS NOT NULL
                     THEN CASE WHEN v_prog_a = v_prog_b THEN 1.0
                               ELSE 0.25 END
                     ELSE 0.5 END;

  v_year_sim := CASE WHEN v_year_a IS NOT NULL AND v_year_b IS NOT NULL
                     THEN 1.0 - LEAST(ABS(v_year_a - v_year_b)::NUMERIC / 4.0, 1.0)
                     ELSE 0.5 END;

  v_city_sim := CASE WHEN v_city_a IS NOT NULL AND v_city_b IS NOT NULL
                     THEN CASE WHEN lower(v_city_a) = lower(v_city_b) THEN 1.0 ELSE 0.0 END
                     ELSE 0.5 END;

  v_acad_score := 0.40 * COALESCE((v_univ_sim * 0.7 + v_city_sim * 0.3), v_univ_sim)
               +  0.35 * v_prog_sim
               +  0.25 * v_year_sim;

  -- ── M1 logistics component ────────────────────────────────────────────────
  a_M1Q10 := get_v2_answer(p_a,'M1_Q10', s_lc); b_M1Q10 := get_v2_answer(p_b,'M1_Q10', s_lc);
  a_M1Q20 := get_v2_answer(p_a,'M1_Q20', s_lc); b_M1Q20 := get_v2_answer(p_b,'M1_Q20', s_lc);
  a_M6Q7  := get_v2_answer(p_a,'M6_Q7',  s_lc); b_M6Q7  := get_v2_answer(p_b,'M6_Q7',  s_lc);
  a_M8Q23 := get_v2_answer(p_a,'M8_Q23', s_lc); b_M8Q23 := get_v2_answer(p_b,'M8_Q23', s_lc);
  a_M8Q20 := get_v2_answer(p_a,'M8_Q20', s_lc); b_M8Q20 := get_v2_answer(p_b,'M8_Q20', s_lc);
  a_M8Q25 := get_v2_answer(p_a,'M8_Q25', s_lc); b_M8Q25 := get_v2_answer(p_b,'M8_Q25', s_lc);
  a_M8Q24 := get_v2_answer(p_a,'M8_Q24', s_lc); b_M8Q24 := get_v2_answer(p_b,'M8_Q24', s_lc);
  a_M8Q12 := get_v2_answer(p_a,'M8_Q12', s_lc); b_M8Q12 := get_v2_answer(p_b,'M8_Q12', s_lc);

  v_logistics_score := weighted_module_score(ARRAY[
    ARRAY[0.18, sim_likert(a_M1Q10, b_M1Q10)],
    ARRAY[0.16, sim_likert(a_M1Q20, b_M1Q20)],
    ARRAY[0.14, sim_likert(a_M6Q7,  b_M6Q7)],
    ARRAY[0.14, sim_mcq_exact(a_M8Q23, b_M8Q23)],
    ARRAY[0.12, sim_mcq_exact(a_M8Q20, b_M8Q20)],
    ARRAY[0.10, sim_mcq_exact(a_M8Q25, b_M8Q25)],
    ARRAY[0.08, sim_toggle(a_M8Q24, b_M8Q24)],
    ARRAY[0.08, sim_toggle(a_M8Q12, b_M8Q12)]
  ]::NUMERIC[][]);

  RETURN 0.5 * v_acad_score + 0.5 * v_logistics_score;
END;
$$;
