-- Migration: Fix boolean extraction from toggle JSONB structure
-- Issue: Toggle values are stored as {"kind": "toggle", "value": true} but code tries to cast entire object to boolean
-- Solution: Extract the 'value' field from structured JSONB objects before casting to boolean

-- Helper function to extract boolean value from JSONB (handles both plain booleans and toggle objects)
CREATE OR REPLACE FUNCTION extract_boolean_value(
  p_jsonb JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_value JSONB;
BEGIN
  IF p_jsonb IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If it's already a boolean, return it
  IF jsonb_typeof(p_jsonb) = 'boolean' THEN
    RETURN p_jsonb::boolean;
  END IF;
  
  -- If it's an object with a 'value' field (toggle structure), extract that
  IF jsonb_typeof(p_jsonb) = 'object' AND p_jsonb ? 'value' THEN
    v_value := p_jsonb->'value';
    IF jsonb_typeof(v_value) = 'boolean' THEN
      RETURN v_value::boolean;
    END IF;
    -- If value is a string "true"/"false", convert it
    IF jsonb_typeof(v_value) = 'string' THEN
      RETURN LOWER(v_value::text) = 'true';
    END IF;
  END IF;
  
  -- If it's a string "true"/"false", convert it
  IF jsonb_typeof(p_jsonb) = 'string' THEN
    RETURN LOWER(p_jsonb::text) = 'true';
  END IF;
  
  -- If we can't determine the value, return NULL (not false)
  -- This allows callers to distinguish between "not set" and "explicitly false"
  RETURN NULL;
END;
$$;

-- Fix check_hard_constraints to use extract_boolean_value helper
CREATE OR REPLACE FUNCTION check_hard_constraints(
  user_a_id UUID,
  user_b_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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
BEGIN
  -- Get resolved preferences (single source of truth)
  v_a_prefs := resolve_user_preferences(user_a_id);
  v_b_prefs := resolve_user_preferences(user_b_id);
  
  -- 1. Smoking constraints
  -- M8_Q8: "No smoking/vaping indoors under any circumstances" (strict dealbreaker)
  -- Question is mandatory, so we can assume both users have answered
  -- true = user wants no smoking, false = user allows smoking
  -- Fail if one user wants no smoking and the other allows smoking
  
  IF extract_boolean_value(v_a_prefs->'M8_Q8') = true AND 
     extract_boolean_value(v_b_prefs->'M8_Q8') = false THEN
    -- UserA wants no smoking, UserB allows smoking → conflict
    RETURN false;
  END IF;
  
  -- Symmetric check: userB wants no smoking, userA allows smoking
  IF extract_boolean_value(v_b_prefs->'M8_Q8') = true AND 
     extract_boolean_value(v_a_prefs->'M8_Q8') = false THEN
    RETURN false;
  END IF;
  
  -- 2. Pets vs allergies
  -- M8_Q14: "Prefer no pets" (bipolar: left="Prefer no pets", right="Okay with some pets")
  -- M8_Q15/M8_Q16/M8_Q17: "I'm okay with cats/dogs/small animals" (toggle)
  -- All questions are mandatory, so we can assume both users have answered
  -- < 0.3 = prefers no pets, > 0.7 = okay with pets
  -- true on toggles = okay with that pet type
  
  -- Get normalized pet preferences (both users have answered)
  v_a_pet_pref := normalize_bipolar_value(v_a_prefs->'M8_Q14');
  v_b_pet_pref := normalize_bipolar_value(v_b_prefs->'M8_Q14');
  
  -- If userA prefers no pets (< 0.3), check if userB wants pets
  IF v_a_pet_pref < 0.3 THEN
    -- Fail if userB explicitly wants pets (bipolar > 0.7 OR any toggle = true)
    IF v_b_pet_pref > 0.7 OR
       extract_boolean_value(v_b_prefs->'M8_Q15') = true OR
       extract_boolean_value(v_b_prefs->'M8_Q16') = true OR
       extract_boolean_value(v_b_prefs->'M8_Q17') = true THEN
      RETURN false; -- UserA doesn't want pets, UserB wants pets
    END IF;
  END IF;
  
  -- Symmetric check: userB prefers no pets, userA wants pets
  IF v_b_pet_pref < 0.3 THEN
    IF v_a_pet_pref > 0.7 OR
       extract_boolean_value(v_a_prefs->'M8_Q15') = true OR
       extract_boolean_value(v_a_prefs->'M8_Q16') = true OR
       extract_boolean_value(v_a_prefs->'M8_Q17') = true THEN
      RETURN false; -- UserB doesn't want pets, UserA wants pets
    END IF;
  END IF;
  
  -- 3. Budget constraints
  -- Check if budgets are compatible (within 50% difference)
  -- Note: Budget is stored in user_housing_preferences table, not questionnaire
  -- If budget data is missing, we don't fail (budget may not be mandatory)
  SELECT max_rent_monthly INTO v_a_budget FROM user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_rent_monthly INTO v_b_budget FROM user_housing_preferences WHERE user_id = user_b_id;
  
  -- Only check if both budgets are set
  IF v_a_budget IS NOT NULL AND v_b_budget IS NOT NULL THEN
    -- If budgets differ by more than 50%, fail
    IF ABS(v_a_budget - v_b_budget) / GREATEST(v_a_budget, v_b_budget) > 0.5 THEN
      RETURN false;
    END IF;
  END IF;
  
  -- 4. Lease length constraints
  -- Note: Lease length is stored in user_housing_preferences table, not questionnaire
  -- Only fail if there's an explicit conflict (one user's min > other's max)
  SELECT min_stay_months INTO v_a_min_stay FROM user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_stay_months INTO v_a_max_stay FROM user_housing_preferences WHERE user_id = user_a_id;
  SELECT min_stay_months INTO v_b_min_stay FROM user_housing_preferences WHERE user_id = user_b_id;
  SELECT max_stay_months INTO v_b_max_stay FROM user_housing_preferences WHERE user_id = user_b_id;
  
  -- If one user's min_stay > other user's max_stay, fail (explicit conflict)
  IF v_a_min_stay IS NOT NULL AND v_b_max_stay IS NOT NULL AND v_a_min_stay > v_b_max_stay THEN
    RETURN false;
  END IF;
  IF v_b_min_stay IS NOT NULL AND v_a_max_stay IS NOT NULL AND v_b_min_stay > v_a_max_stay THEN
    RETURN false;
  END IF;
  
  -- All checks passed
  RETURN true;
END;
$$;

-- Also fix resolve_user_preferences to handle toggle structure when checking boolean values
CREATE OR REPLACE FUNCTION resolve_user_preferences(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB := '{}'::jsonb;
  v_inconsistencies JSONB := '[]'::jsonb;
  v_all_answers JSONB := '{}'::jsonb;
  v_section_record RECORD;
  v_array_index INTEGER;
  v_item_id TEXT;
  v_item_value JSONB;
  v_m8_q8_value JSONB;
  v_m8_q14_value JSONB;
  v_m8_q15_value JSONB;
  v_m8_q16_value JSONB;
  v_m8_q17_value JSONB;
  v_pet_pref_norm NUMERIC;
  v_has_pet_tolerance BOOLEAN := false;
  v_contradiction_entry JSONB;
BEGIN
  -- Collect all answers from onboarding_sections
  -- Answers are stored as arrays: [{itemId: "M4_Q1", value: {...}}, ...]
  -- We need to convert them to an object format: {M4_Q1: {...}, M3_Q1: {...}}
  FOR v_section_record IN
    SELECT answers FROM onboarding_sections WHERE user_id = p_user_id
  LOOP
    -- If answers is an array (new format), convert to object format
    IF jsonb_typeof(v_section_record.answers) = 'array' THEN
      -- Loop through array and build object with itemId as key
      FOR v_array_index IN 0..jsonb_array_length(v_section_record.answers) - 1 LOOP
        v_item_id := v_section_record.answers->v_array_index->>'itemId';
        v_item_value := v_section_record.answers->v_array_index->'value';
        IF v_item_id IS NOT NULL THEN
          v_all_answers := v_all_answers || jsonb_build_object(v_item_id, v_item_value);
        END IF;
      END LOOP;
    -- If answers is already an object (old format), use directly
    ELSIF jsonb_typeof(v_section_record.answers) = 'object' THEN
      v_all_answers := v_all_answers || v_section_record.answers;
    END IF;
  END LOOP;
  
  -- Start with all answers as resolved (will override contradictions)
  v_resolved := v_all_answers;
  
  -- ============================================
  -- Detect and resolve smoking contradictions
  -- ============================================
  v_m8_q8_value := v_all_answers->'M8_Q8';
  
  IF v_m8_q8_value IS NOT NULL AND extract_boolean_value(v_m8_q8_value) = true THEN
    -- User has strict no-smoking rule
    -- (Simplified check - in production, check actual smoking status)
  END IF;
  
  -- ============================================
  -- Detect and resolve pet contradictions
  -- ============================================
  v_m8_q14_value := v_all_answers->'M8_Q14';
  v_m8_q15_value := v_all_answers->'M8_Q15';
  v_m8_q16_value := v_all_answers->'M8_Q16';
  v_m8_q17_value := v_all_answers->'M8_Q17';
  
  IF v_m8_q14_value IS NOT NULL THEN
    v_pet_pref_norm := normalize_bipolar_value(v_m8_q14_value);
    
    v_has_pet_tolerance := 
      (v_m8_q15_value IS NOT NULL AND extract_boolean_value(v_m8_q15_value) = true) OR
      (v_m8_q16_value IS NOT NULL AND extract_boolean_value(v_m8_q16_value) = true) OR
      (v_m8_q17_value IS NOT NULL AND extract_boolean_value(v_m8_q17_value) = true);
    
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
      
      -- Resolve: enforce strict "no pets" preference (clear tolerance toggles in resolved)
      v_resolved := v_resolved || jsonb_build_object(
        'M8_Q15', jsonb_build_object('kind', 'toggle', 'value', false),
        'M8_Q16', jsonb_build_object('kind', 'toggle', 'value', false),
        'M8_Q17', jsonb_build_object('kind', 'toggle', 'value', false)
      );
    END IF;
  END IF;
  
  -- Return resolved preferences (contradictions normalized, strict constraints enforced)
  RETURN v_resolved;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION extract_boolean_value(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION extract_boolean_value(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION check_hard_constraints(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_hard_constraints(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION resolve_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_user_preferences(UUID) TO service_role;

