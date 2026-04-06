-- Student M7 (privacy-territoriality) copy replaced 2026-04: get_shared_spaces_dimension
-- must align with data/item-bank.v1.json.
-- New M7_Q1: closed-door entry MCQ. New M7_Q3/M7_Q4: bedroom privacy / sanctuary  -  inverted
-- into “shared-space openness” (higher = more communal / less strict territorial norms).
-- Legacy: M7_Q1 bipolar numeric 1–5 + old M7_Q3/M7_Q4 likerts (no invert on Q3/Q4).

CREATE OR REPLACE FUNCTION public.get_shared_spaces_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_m7q1 JSONB;
  v_m7q3 JSONB;
  v_m7q4 JSONB;
  v_t TEXT;
  v_door_norm NUMERIC;
  v_privacy_norm NUMERIC;
  v_bedroom_norm NUMERIC;
  v_legacy_door BOOLEAN;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_m7q1 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M7_Q1', v_resolved));

  v_door_norm := 0.5;
  v_legacy_door := false;

  IF jsonb_typeof(v_m7q1) = 'string' THEN
    v_t := trim(both '"' FROM v_m7q1::text);
    IF v_t = 'door_knock_wait_invite' THEN
      v_door_norm := 0.15;
    ELSIF v_t = 'door_knock_then_open' THEN
      v_door_norm := 0.45;
    ELSIF v_t = 'door_walk_in_urgent_ok' THEN
      v_door_norm := 0.85;
    END IF;
  ELSIF jsonb_typeof(v_m7q1) = 'number' THEN
    v_legacy_door := true;
    v_door_norm := public.normalize_likert_value(v_m7q1);
  END IF;

  v_m7q3 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M7_Q3', v_resolved));
  v_m7q4 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M7_Q4', v_resolved));

  IF v_legacy_door THEN
    v_privacy_norm := public.normalize_likert_value(v_m7q3);
    v_bedroom_norm := public.normalize_likert_value(v_m7q4);
  ELSE
    v_privacy_norm := 1.0 - public.normalize_likert_value(v_m7q3);
    v_bedroom_norm := 1.0 - public.normalize_likert_value(v_m7q4);
  END IF;

  RETURN COALESCE((v_door_norm + v_privacy_norm + v_bedroom_norm) / 3.0, 0.5);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_spaces_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_spaces_dimension(UUID) TO service_role;
