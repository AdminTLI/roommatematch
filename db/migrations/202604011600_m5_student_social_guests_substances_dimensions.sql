-- Student M5 (social-hosting-language) copy replaced 2026-04: study/social, guests, and substances
-- dimensions must match new item semantics in data/item-bank.v1.json.
--
-- get_study_social_dimension: M5_Q1 (bipolar retreat↔hub), M5_Q2 (friends with housemates), M1_Q14 inverted.
-- get_guests_dimension: legacy M5_Q3/M5_Q4 daytime+overnight counts; else M5_Q6, M5_Q9, M5_Q11, M5_Q16, M5_Q20.
-- get_substances_dimension: new M5_Q11 party-frequency MCQ + M5_Q7 pre-drinks; else legacy alcohol on M5_Q18/M5_Q19.

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
  v_social_axis JSONB;
  v_friend_home JSONB;
  v_social_energy_norm NUMERIC;
  v_social_home_norm NUMERIC;
  v_friend_norm NUMERIC;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_post_day_quiet := public.get_dimension_value(p_user_id, 'M1_Q14', v_resolved);
  v_social_axis := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q1', v_resolved));
  v_friend_home := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q2', v_resolved));

  v_social_energy_norm := 1.0 - public.normalize_likert_value(v_post_day_quiet);
  v_social_home_norm := public.normalize_likert_value(v_social_axis);
  v_friend_norm := public.normalize_likert_value(v_friend_home);

  RETURN COALESCE((v_social_energy_norm + v_social_home_norm + v_friend_norm) / 3.0, 0.5);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_guests_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_q3 JSONB;
  v_q4 JSONB;
  v_s3 TEXT;
  v_s4 TEXT;
  v_party JSONB;
  v_party_t TEXT;
  v_party_norm NUMERIC;
  v_dropin NUMERIC;
  v_partner_guest NUMERIC;
  v_partner_stay NUMERIC;
  v_abroad NUMERIC;
  v_m5q16 JSONB;
  v_m5q16t TEXT;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_q3 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q3', v_resolved));
  v_q4 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q4', v_resolved));

  v_s3 := CASE WHEN jsonb_typeof(v_q3) = 'string' THEN lower(trim(both '"' FROM v_q3::text)) ELSE NULL END;
  v_s4 := CASE WHEN jsonb_typeof(v_q4) = 'string' THEN lower(trim(both '"' FROM v_q4::text)) ELSE NULL END;

  IF v_s3 IN ('0-2', '3-5', '6-10', '10+')
     AND v_s4 IN ('0', '1-2', '3-4', '5+') THEN
    RETURN COALESCE(
      (public.normalize_mcq_value(v_q3) + public.normalize_mcq_value(v_q4)) / 2.0,
      0.5
    );
  END IF;

  v_party_norm := 0.5;
  v_party := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q11', v_resolved));
  IF jsonb_typeof(v_party) = 'string' THEN
    v_party_t := trim(both '"' FROM v_party::text);
    IF v_party_t = 'party_never' THEN
      v_party_norm := 0.0;
    ELSIF v_party_t = 'party_rarely' THEN
      v_party_norm := 0.28;
    ELSIF v_party_t = 'party_monthly' THEN
      v_party_norm := 0.62;
    ELSIF v_party_t = 'party_weekly' THEN
      v_party_norm := 1.0;
    END IF;
  END IF;

  v_dropin := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q6', v_resolved))
  );

  v_partner_guest := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q9', v_resolved))
  );

  v_m5q16 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q16', v_resolved));
  v_partner_stay := 0.5;
  IF jsonb_typeof(v_m5q16) = 'string' THEN
    v_m5q16t := trim(both '"' FROM v_m5q16::text);
    IF v_m5q16t = 'partner_sleep_1_2' THEN
      v_partner_stay := 0.35;
    ELSIF v_m5q16t = 'partner_sleep_3_4' THEN
      v_partner_stay := 0.68;
    ELSIF v_m5q16t = 'partner_sleep_no_limit' THEN
      v_partner_stay := 1.0;
    END IF;
  END IF;

  v_abroad := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q20', v_resolved))
  );

  RETURN COALESCE(
    (
      v_party_norm +
      v_dropin +
      ((v_partner_guest + v_partner_stay) / 2.0) +
      v_abroad
    ) / 4.0,
    0.5
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_substances_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_m5q7 JSONB;
  v_m5q11 JSONB;
  v_m5q11t TEXT;
  v_party_norm NUMERIC;
  v_predrink NUMERIC;
  v_alcohol_open NUMERIC;
  v_alcohol_private_limit NUMERIC;
BEGIN
  v_resolved := public.resolve_user_preferences(p_user_id);

  v_predrink := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q7', v_resolved))
  );

  v_party_norm := 0.5;
  v_m5q11 := public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q11', v_resolved));
  IF jsonb_typeof(v_m5q11) = 'string' THEN
    v_m5q11t := trim(both '"' FROM v_m5q11::text);
    IF v_m5q11t IN ('party_never', 'party_rarely', 'party_monthly', 'party_weekly') THEN
      IF v_m5q11t = 'party_never' THEN
        v_party_norm := 0.0;
      ELSIF v_m5q11t = 'party_rarely' THEN
        v_party_norm := 0.28;
      ELSIF v_m5q11t = 'party_monthly' THEN
        v_party_norm := 0.62;
      ELSE
        v_party_norm := 1.0;
      END IF;
      RETURN COALESCE((v_predrink + v_party_norm) / 2.0, 0.5);
    END IF;
  END IF;

  v_alcohol_open := public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q18', v_resolved))
  );
  v_alcohol_private_limit := 1.0 - public.normalize_likert_value(
    public.extract_actual_value(public.get_dimension_value(p_user_id, 'M5_Q19', v_resolved))
  );

  RETURN COALESCE((v_alcohol_open + v_alcohol_private_limit) / 2.0, 0.5);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_study_social_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_study_social_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_guests_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_guests_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_substances_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_substances_dimension(UUID) TO service_role;
