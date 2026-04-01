-- Student sleep-circadian M2 redesign: M2_Q1 = Sun–Thu sleep window (timeRange),
-- M2_Q2 = Fri–Sat sleep window (timeRange). Legacy student data may still have
-- M2_Q1 as bipolar (night owl ↔ morning lark) and M2_Q2 as a single weeknight window;
-- YP flows may keep bipolar + non–time-range M2_Q2. This function averages up to two
-- parsed “late-night” norms when both ranges exist, and falls back to bipolar on M2_Q1.

CREATE OR REPLACE FUNCTION public.get_sleep_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_m2q1 JSONB;
  v_m2q2 JSONB;
  v_str TEXT;
  v_hour INT;
  v_norm NUMERIC;
  v_sum NUMERIC := 0;
  v_n INT := 0;
  v_actual JSONB;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_m2q1 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M2_Q1', v_resolved));
  v_m2q2 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M2_Q2', v_resolved));

  -- M2_Q1: prefer timeRange with start (new student copy)
  IF v_m2q1 IS NOT NULL AND jsonb_typeof(v_m2q1) = 'object' AND (v_m2q1 ? 'start') THEN
    v_str := v_m2q1->>'start';
    IF v_str IS NOT NULL AND position(':' IN v_str) > 0 THEN
      BEGIN
        v_hour := split_part(v_str, ':', 1)::INT;
        IF v_hour >= 20 THEN
          v_norm := (v_hour - 20.0) / 6.0;
        ELSIF v_hour <= 2 THEN
          v_norm := 0.67 + (v_hour / 6.0);
        ELSE
          v_norm := 0.5;
        END IF;
        v_norm := LEAST(1.0, GREATEST(0.0, v_norm));
        v_sum := v_sum + v_norm;
        v_n := v_n + 1;
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;
    END IF;
  ELSIF v_m2q1 IS NOT NULL THEN
    v_actual := public.extract_actual_value(v_m2q1);
    IF jsonb_typeof(v_actual) = 'number' AND (v_actual::numeric) BETWEEN 1 AND 5 THEN
      v_norm := LEAST(1.0, GREATEST(0.0, ((v_actual::numeric) - 1.0) / 4.0));
      v_sum := v_sum + v_norm;
      v_n := v_n + 1;
    END IF;
  END IF;

  -- M2_Q2: second sleep window (new student Fri–Sat) or legacy weeknight-only range
  IF v_m2q2 IS NOT NULL AND jsonb_typeof(v_m2q2) = 'object' AND (v_m2q2 ? 'start') THEN
    v_str := v_m2q2->>'start';
    IF v_str IS NOT NULL AND position(':' IN v_str) > 0 THEN
      BEGIN
        v_hour := split_part(v_str, ':', 1)::INT;
        IF v_hour >= 20 THEN
          v_norm := (v_hour - 20.0) / 6.0;
        ELSIF v_hour <= 2 THEN
          v_norm := 0.67 + (v_hour / 6.0);
        ELSE
          v_norm := 0.5;
        END IF;
        v_norm := LEAST(1.0, GREATEST(0.0, v_norm));
        v_sum := v_sum + v_norm;
        v_n := v_n + 1;
      EXCEPTION
        WHEN OTHERS THEN NULL;
      END;
    END IF;
  END IF;

  IF v_n > 0 THEN
    RETURN v_sum / v_n;
  END IF;

  RETURN 0.5;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sleep_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sleep_dimension(UUID) TO service_role;
