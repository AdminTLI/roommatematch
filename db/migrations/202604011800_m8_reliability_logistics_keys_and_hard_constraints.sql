-- Student M8 (reliability-logistics) 2026-04: new item bank + canonical responses keys m8_q01–m8_q25.
-- Updates hard constraints: smoking from M8_Q6 (MCQ) with legacy M8_Q8 boolean;
-- pets from M8_Q8 (MCQ) with legacy M8_Q14 + M8_Q15–M8_Q17 when M8_Q8 is not a string.

INSERT INTO public.question_items (key, section, type, options, weight, is_hard)
VALUES
  ('m8_q01', 'logistics', 'text', null, 0, false),
  ('m8_q02', 'logistics', 'single', null, 0, false),
  ('m8_q03', 'logistics', 'text', null, 0, false),
  ('m8_q04', 'logistics', 'single', null, 0, false),
  ('m8_q05', 'logistics', 'text', null, 0, false),
  ('m8_q06', 'logistics', 'single', null, 0, false),
  ('m8_q07', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q08', 'logistics', 'single', null, 0, false),
  ('m8_q09', 'logistics', 'single', null, 0, false),
  ('m8_q10', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q11', 'logistics', 'single', null, 0, false),
  ('m8_q12', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q13', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q14', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q15', 'logistics', 'single', null, 0, false),
  ('m8_q16', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q17', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q18', 'logistics', 'single', null, 0, false),
  ('m8_q19', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q20', 'logistics', 'single', null, 0, false),
  ('m8_q21', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false),
  ('m8_q22', 'logistics', 'single', null, 0, false),
  ('m8_q23', 'logistics', 'single', null, 0, false),
  ('m8_q24', 'logistics', 'single', null, 0, false),
  ('m8_q25', 'logistics', 'slider', '{"min": 1, "max": 5, "step": 1}', 0, false)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- resolve_user_preferences: keep legacy M8_Q14 + M8_Q15–M8_Q17 resolution when M8_Q8 is not the new pets MCQ string
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.resolve_user_preferences(UUID);

CREATE OR REPLACE FUNCTION public.resolve_user_preferences(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB := '{}'::jsonb;
  v_inconsistencies JSONB := '[]'::jsonb;
  v_all_answers JSONB := '{}'::jsonb;
  v_section_record RECORD;
  v_answer_item JSONB;
  v_item_id TEXT;
  v_item_value JSONB;
  v_m8_q14_value JSONB;
  v_m8_q15_value JSONB;
  v_m8_q16_value JSONB;
  v_m8_q17_value JSONB;
  v_m8_q8_raw JSONB;
  v_pet_pref_norm NUMERIC;
  v_has_pet_tolerance BOOLEAN := false;
  v_contradiction_entry JSONB;
  v_array_length INTEGER;
  v_i INTEGER;
BEGIN
  FOR v_section_record IN
    SELECT answers FROM public.onboarding_sections WHERE user_id = p_user_id
  LOOP
    IF jsonb_typeof(v_section_record.answers) = 'array' THEN
      v_array_length := jsonb_array_length(v_section_record.answers);
      FOR v_i IN 0..v_array_length - 1 LOOP
        v_answer_item := v_section_record.answers->v_i;
        v_item_id := v_answer_item->>'itemId';
        IF v_item_id IS NULL THEN
          CONTINUE;
        END IF;
        v_item_value := v_answer_item->'value';
        IF v_item_value IS NOT NULL AND jsonb_typeof(v_item_value) = 'object' THEN
          IF v_item_value ? 'value' THEN
            v_item_value := v_item_value->'value';
            IF jsonb_typeof(v_item_value) = 'object' AND v_item_value ? 'value' THEN
              v_item_value := v_item_value->'value';
            END IF;
          END IF;
        END IF;
        v_all_answers := v_all_answers || jsonb_build_object(v_item_id, COALESCE(v_item_value, jsonb 'null'));
      END LOOP;
    ELSE
      v_all_answers := v_all_answers || v_section_record.answers;
    END IF;
  END LOOP;

  v_resolved := v_all_answers;
  v_m8_q8_raw := v_all_answers->'M8_Q8';

  v_m8_q14_value := v_all_answers->'M8_Q14';
  v_m8_q15_value := v_all_answers->'M8_Q15';
  v_m8_q16_value := v_all_answers->'M8_Q16';
  v_m8_q17_value := v_all_answers->'M8_Q17';

  IF v_m8_q14_value IS NOT NULL AND jsonb_typeof(v_m8_q8_raw) IS DISTINCT FROM 'string' THEN
    v_pet_pref_norm := public.normalize_bipolar_value(v_m8_q14_value);
    v_has_pet_tolerance :=
      (v_m8_q15_value IS NOT NULL AND jsonb_typeof(v_m8_q15_value) = 'boolean' AND v_m8_q15_value::boolean = true) OR
      (v_m8_q16_value IS NOT NULL AND jsonb_typeof(v_m8_q16_value) = 'boolean' AND v_m8_q16_value::boolean = true) OR
      (v_m8_q17_value IS NOT NULL AND jsonb_typeof(v_m8_q17_value) = 'boolean' AND v_m8_q17_value::boolean = true);
    IF v_pet_pref_norm < 0.3 AND v_has_pet_tolerance THEN
      v_contradiction_entry := jsonb_build_object(
        'type', 'pets_conflict',
        'question_keys', jsonb_build_array('M8_Q14', 'M8_Q15', 'M8_Q16', 'M8_Q17'),
        'resolved_value', 'no_pets_preferred',
        'conflicting_values', jsonb_build_object(
          'M8_Q14', v_m8_q14_value,
          'M8_Q15', v_m8_q15_value,
          'M8_Q16', v_m8_q16_value,
          'M8_Q17', v_m8_q17_value
        ),
        'resolution', 'Strict "no pets" preference overrides pet tolerance toggles'
      );
      v_inconsistencies := v_inconsistencies || jsonb_build_array(v_contradiction_entry);
      v_resolved := v_resolved || jsonb_build_object(
        'M8_Q15', false,
        'M8_Q16', false,
        'M8_Q17', false
      );
    END IF;
  END IF;

  RETURN v_resolved;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_user_preferences(UUID) TO service_role;

-- ---------------------------------------------------------------------------
-- check_hard_constraints: M8_Q6 smoking, M8_Q8 pets (+ legacy); budget & lease from housing prefs
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.check_hard_constraints(UUID, UUID);

CREATE OR REPLACE FUNCTION public.check_hard_constraints(
  user_a_id UUID,
  user_b_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_a_prefs JSONB;
  v_b_prefs JSONB;
  v_a_pet_pref NUMERIC;
  v_b_pet_pref NUMERIC;
  v_a_budget NUMERIC;
  v_b_budget NUMERIC;
  v_a_min_stay INTEGER;
  v_b_min_stay INTEGER;
  v_a_max_stay INTEGER;
  v_b_max_stay INTEGER;
  v_a_smoking_pref TEXT;
  v_b_smoking_pref TEXT;
  v_a_no_indoor_from_others BOOLEAN := false;
  v_b_no_indoor_from_others BOOLEAN := false;
  v_a_indoor_smoker BOOLEAN := false;
  v_b_indoor_smoker BOOLEAN := false;
  v_m8q8_a JSONB;
  v_m8q8_b JSONB;
  v_a_cannot_pets BOOLEAN := false;
  v_b_cannot_pets BOOLEAN := false;
  v_a_brings_pets BOOLEAN := false;
  v_b_brings_pets BOOLEAN := false;
BEGIN
  v_a_prefs := public.resolve_user_preferences(user_a_id);
  v_b_prefs := public.resolve_user_preferences(user_b_id);

  v_a_no_indoor_from_others := (v_a_prefs->>'M8_Q6' IN (
    'strict_nonsmoking_household',
    'nonsmoker_ok_others_outside'
  ));
  IF v_a_prefs->>'M8_Q6' IS NULL
     AND jsonb_typeof(v_a_prefs->'M8_Q8') = 'boolean'
     AND public.extract_boolean_value(v_a_prefs->'M8_Q8') = true THEN
    v_a_no_indoor_from_others := true;
  END IF;

  v_b_no_indoor_from_others := (v_b_prefs->>'M8_Q6' IN (
    'strict_nonsmoking_household',
    'nonsmoker_ok_others_outside'
  ));
  IF v_b_prefs->>'M8_Q6' IS NULL
     AND jsonb_typeof(v_b_prefs->'M8_Q8') = 'boolean'
     AND public.extract_boolean_value(v_b_prefs->'M8_Q8') = true THEN
    v_b_no_indoor_from_others := true;
  END IF;

  v_a_indoor_smoker := (v_a_prefs->>'M8_Q6' = 'smoke_indoors');
  v_b_indoor_smoker := (v_b_prefs->>'M8_Q6' = 'smoke_indoors');

  SELECT smoking_preference INTO v_a_smoking_pref
  FROM public.user_housing_preferences WHERE user_id = user_a_id;

  SELECT smoking_preference INTO v_b_smoking_pref
  FROM public.user_housing_preferences WHERE user_id = user_b_id;

  IF v_a_no_indoor_from_others AND v_b_indoor_smoker THEN
    RETURN false;
  END IF;
  IF v_b_no_indoor_from_others AND v_a_indoor_smoker THEN
    RETURN false;
  END IF;

  IF v_a_smoking_pref IS NOT NULL AND v_b_smoking_pref IS NOT NULL THEN
    IF v_a_no_indoor_from_others AND v_b_smoking_pref = 'smoking_ok' AND v_b_prefs->>'M8_Q6' IS NULL THEN
      RETURN false;
    END IF;
    IF v_b_no_indoor_from_others AND v_a_smoking_pref = 'smoking_ok' AND v_a_prefs->>'M8_Q6' IS NULL THEN
      RETURN false;
    END IF;
  END IF;

  v_m8q8_a := v_a_prefs->'M8_Q8';
  v_m8q8_b := v_b_prefs->'M8_Q8';

  IF jsonb_typeof(v_m8q8_a) = 'string' THEN
    v_a_cannot_pets := (v_a_prefs->>'M8_Q8' = 'pet_cannot');
    v_a_brings_pets := (v_a_prefs->>'M8_Q8' = 'pet_bringing');
  END IF;
  IF jsonb_typeof(v_m8q8_b) = 'string' THEN
    v_b_cannot_pets := (v_b_prefs->>'M8_Q8' = 'pet_cannot');
    v_b_brings_pets := (v_b_prefs->>'M8_Q8' = 'pet_bringing');
  END IF;

  IF jsonb_typeof(v_m8q8_a) IS DISTINCT FROM 'string' THEN
    v_a_pet_pref := public.normalize_bipolar_value(v_a_prefs->'M8_Q14');
    v_a_cannot_pets := v_a_cannot_pets OR (v_a_pet_pref < 0.3);
    v_a_brings_pets := v_a_brings_pets OR (v_a_pet_pref > 0.7)
      OR public.extract_boolean_value(v_a_prefs->'M8_Q15') = true
      OR public.extract_boolean_value(v_a_prefs->'M8_Q16') = true
      OR public.extract_boolean_value(v_a_prefs->'M8_Q17') = true;
  END IF;

  IF jsonb_typeof(v_m8q8_b) IS DISTINCT FROM 'string' THEN
    v_b_pet_pref := public.normalize_bipolar_value(v_b_prefs->'M8_Q14');
    v_b_cannot_pets := v_b_cannot_pets OR (v_b_pet_pref < 0.3);
    v_b_brings_pets := v_b_brings_pets OR (v_b_pet_pref > 0.7)
      OR public.extract_boolean_value(v_b_prefs->'M8_Q15') = true
      OR public.extract_boolean_value(v_b_prefs->'M8_Q16') = true
      OR public.extract_boolean_value(v_b_prefs->'M8_Q17') = true;
  END IF;

  IF v_a_cannot_pets AND v_b_brings_pets THEN
    RETURN false;
  END IF;
  IF v_b_cannot_pets AND v_a_brings_pets THEN
    RETURN false;
  END IF;

  SELECT max_rent_monthly INTO v_a_budget FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_rent_monthly INTO v_b_budget FROM public.user_housing_preferences WHERE user_id = user_b_id;

  IF v_a_budget IS NOT NULL AND v_b_budget IS NOT NULL THEN
    IF ABS(v_a_budget - v_b_budget) / GREATEST(v_a_budget, v_b_budget) > 0.5 THEN
      RETURN false;
    END IF;
  END IF;

  SELECT min_stay_months INTO v_a_min_stay FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_stay_months INTO v_a_max_stay FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT min_stay_months INTO v_b_min_stay FROM public.user_housing_preferences WHERE user_id = user_b_id;
  SELECT max_stay_months INTO v_b_max_stay FROM public.user_housing_preferences WHERE user_id = user_b_id;

  IF v_a_min_stay IS NOT NULL AND v_b_max_stay IS NOT NULL AND v_a_min_stay > v_b_max_stay THEN
    RETURN false;
  END IF;
  IF v_b_min_stay IS NOT NULL AND v_a_max_stay IS NOT NULL AND v_b_min_stay > v_a_max_stay THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_hard_constraints(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_hard_constraints(UUID, UUID) TO service_role;
