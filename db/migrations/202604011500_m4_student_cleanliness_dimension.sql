-- Student M4 (home operations) copy changed: get_cleanliness_dimension must not assume
-- M4_Q1–M4_Q3 are low/medium/high MCQs. New signals:
--   • Shared-space strictness: invert M4_Q1 + M4_Q4 (1–5: higher = more relaxed / clutter-tolerant)
--   • Kitchen / food norms: M4_Q2 timing MCQ + M4_Q13 + M4_Q23 (likert)
--   • Surfaces / entryway: M4_Q3 (bathroom diligence) + M4_Q5 (shoes MCQ)
-- Legacy: if M4_Q1–M4_Q3 are still low/medium/high strings, keep the old three-way average.

CREATE OR REPLACE FUNCTION public.get_cleanliness_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_q1 JSONB;
  v_q2 JSONB;
  v_q3 JSONB;
  v_s1 TEXT;
  v_s2 TEXT;
  v_s3 TEXT;
  v_living NUMERIC;
  v_kitchen NUMERIC;
  v_bath NUMERIC;
  v_m4q2 JSONB;
  v_m4q2t TEXT;
  v_kitchen_timing NUMERIC;
  v_m4q5 JSONB;
  v_m4q5t TEXT;
  v_shoes_norm NUMERIC;
  v_n1 NUMERIC;
  v_n4 NUMERIC;
  v_n3 NUMERIC;
  v_n13 NUMERIC;
  v_n23 NUMERIC;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_q1 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q1', v_resolved));
  v_q2 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q2', v_resolved));
  v_q3 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q3', v_resolved));

  v_s1 := CASE WHEN jsonb_typeof(v_q1) = 'string' THEN lower(trim(both '"' FROM v_q1::text)) ELSE NULL END;
  v_s2 := CASE WHEN jsonb_typeof(v_q2) = 'string' THEN lower(trim(both '"' FROM v_q2::text)) ELSE NULL END;
  v_s3 := CASE WHEN jsonb_typeof(v_q3) = 'string' THEN lower(trim(both '"' FROM v_q3::text)) ELSE NULL END;

  IF v_s1 IN ('low', 'medium', 'high')
     AND v_s2 IN ('low', 'medium', 'high')
     AND v_s3 IN ('low', 'medium', 'high') THEN
    RETURN COALESCE(
      (
        public.normalize_mcq_value(v_q1) +
        public.normalize_mcq_value(v_q2) +
        public.normalize_mcq_value(v_q3)
      ) / 3.0,
      0.5
    );
  END IF;

  v_n1 := public.normalize_likert_value(v_q1);
  v_n4 := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q4', v_resolved))
  );
  v_living := ((1.0 - v_n1) + (1.0 - v_n4)) / 2.0;

  v_m4q2 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q2', v_resolved));
  v_kitchen_timing := 0.5;
  IF jsonb_typeof(v_m4q2) = 'string' THEN
    v_m4q2t := trim(both '"' FROM v_m4q2::text);
    IF v_m4q2t = 'after_eating_immediately' THEN
      v_kitchen_timing := 1.0;
    ELSIF v_m4q2t = 'before_bed_same_night' THEN
      v_kitchen_timing := 0.55;
    ELSIF v_m4q2t = 'within_24_48_hours' THEN
      v_kitchen_timing := 0.15;
    ELSIF lower(v_m4q2t) IN ('low', 'medium', 'high') THEN
      v_kitchen_timing := public.normalize_mcq_value(v_m4q2);
    END IF;
  ELSIF jsonb_typeof(v_m4q2) = 'number' THEN
    v_kitchen_timing := public.normalize_mcq_value(v_m4q2);
  END IF;

  v_n13 := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q13', v_resolved))
  );
  v_n23 := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q23', v_resolved))
  );
  v_kitchen := (v_kitchen_timing + v_n13 + v_n23) / 3.0;

  v_n3 := public.normalize_likert_value(v_q3);

  v_m4q5 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M4_Q5', v_resolved));
  v_shoes_norm := 0.5;
  IF jsonb_typeof(v_m4q5) = 'string' THEN
    v_m4q5t := trim(both '"' FROM v_m4q5::text);
    IF v_m4q5t = 'shoes_off_strict' THEN
      v_shoes_norm := 1.0;
    ELSIF v_m4q5t = 'shoes_off_preferred' THEN
      v_shoes_norm := 0.65;
    ELSIF v_m4q5t = 'shoes_on_ok' THEN
      v_shoes_norm := 0.25;
    END IF;
  END IF;

  v_bath := (v_n3 + v_shoes_norm) / 2.0;

  RETURN COALESCE((v_living + v_kitchen + v_bath) / 3.0, 0.5);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cleanliness_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cleanliness_dimension(UUID) TO service_role;
