-- Student M1 (personality-values) copy changed mid-2026. M1_Q14 replaced
-- "tidy surroundings" with "quiet empty apartment after long classes" — inverted
-- vs. the old M1_Q13 "energized by social activity" signal for the same dimension.
-- Legacy rows may still hold old semantics until users re-submit the section.

CREATE OR REPLACE FUNCTION public.get_study_social_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_post_day_quiet JSONB;
  v_social_home JSONB;
  v_quiet_home JSONB;
  v_social_energy_norm NUMERIC;
  v_social_norm NUMERIC;
  v_quiet_norm NUMERIC;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_post_day_quiet := public.get_dimension_value(p_user_id, 'M1_Q14', v_resolved);
  v_social_home := public.get_dimension_value(p_user_id, 'M5_Q1', v_resolved);
  v_quiet_home := public.get_dimension_value(p_user_id, 'M5_Q2', v_resolved);

  -- M1_Q14: agree strongly with needing a quiet/empty home after class → lower "social-at-home" score
  v_social_energy_norm := 1.0 - public.normalize_likert_value(v_post_day_quiet);
  v_social_norm := public.normalize_likert_value(v_social_home);
  v_quiet_norm := 1.0 - public.normalize_likert_value(v_quiet_home);

  RETURN COALESCE((v_social_energy_norm + v_social_norm + v_quiet_norm) / 3.0, 0.5);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_study_social_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_study_social_dimension(UUID) TO service_role;
