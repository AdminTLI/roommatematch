-- Student M3 (noise-sensory) copy changed: M3_Q1/Q2/Q4 still drive get_noise_dimension,
-- but semantics differ (predictable calm home, background noise annoyance, windows open↔closed).
-- Higher component values = stronger preference for a quieter / more controlled sensory home.
-- Uses normalize_likert_value on extracted 1–5 answers (works for likert + bipolar numeric).

CREATE OR REPLACE FUNCTION public.get_noise_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_m3q1 JSONB;
  v_m3q2 JSONB;
  v_m3q4 JSONB;
  v_sensitivity_norm NUMERIC;
  v_background_norm NUMERIC;
  v_vent_norm NUMERIC;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_m3q1 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M3_Q1', v_resolved));
  v_m3q2 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M3_Q2', v_resolved));
  v_m3q4 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M3_Q4', v_resolved));

  v_sensitivity_norm := public.normalize_likert_value(v_m3q1);
  v_background_norm := public.normalize_likert_value(v_m3q2);
  v_vent_norm := public.normalize_likert_value(v_m3q4);

  RETURN COALESCE((v_sensitivity_norm + v_background_norm + v_vent_norm) / 3.0, 0.5);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_noise_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_noise_dimension(UUID) TO service_role;
