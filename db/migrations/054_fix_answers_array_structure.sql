-- Migration: Fix get_dimension_value and resolve_user_preferences to handle array structure
-- Issue: answers JSONB is stored as array [{itemId: "M4_Q1", value: {...}}] not object {M4_Q1: {...}}
-- This causes all dimension values to default to 0.5 because questions aren't found

-- Fix get_dimension_value to handle array structure
CREATE OR REPLACE FUNCTION get_dimension_value(
  p_user_id UUID,
  p_question_key TEXT,
  p_resolved_prefs JSONB DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_value JSONB;
  v_section_record RECORD;
  v_array_index INTEGER;
BEGIN
  -- If resolved preferences provided, check there first (single source of truth)
  IF p_resolved_prefs IS NOT NULL AND p_resolved_prefs ? p_question_key THEN
    v_value := p_resolved_prefs->p_question_key;
    IF v_value IS NOT NULL THEN
      RETURN v_value;
    END IF;
  END IF;
  
  -- Otherwise, fall back to raw lookup from onboarding_sections
  -- The answers JSONB is an ARRAY: [{itemId: "M4_Q1", value: {...}}, ...]
  FOR v_section_record IN
    SELECT answers FROM onboarding_sections WHERE user_id = p_user_id
  LOOP
    -- Check if answers is an array (new format)
    IF jsonb_typeof(v_section_record.answers) = 'array' THEN
      -- Search through array elements to find matching itemId
      FOR v_array_index IN 0..jsonb_array_length(v_section_record.answers) - 1 LOOP
        IF (v_section_record.answers->v_array_index->>'itemId') = p_question_key THEN
          v_value := v_section_record.answers->v_array_index->'value';
          IF v_value IS NOT NULL THEN
            RETURN v_value;
          END IF;
        END IF;
      END LOOP;
    -- Fallback: if answers is an object (old format), check directly
    ELSIF jsonb_typeof(v_section_record.answers) = 'object' AND v_section_record.answers ? p_question_key THEN
      v_value := v_section_record.answers->p_question_key;
      IF v_value IS NOT NULL THEN
        RETURN v_value;
      END IF;
    END IF;
  END LOOP;
  
  -- Fallback to responses table
  SELECT r.value INTO v_value
  FROM responses r
  WHERE r.user_id = p_user_id
    AND r.question_key = p_question_key
  LIMIT 1;
  
  -- Return NULL if not found (caller will handle default with 0.5 neutral)
  RETURN v_value;
END;
$$;

-- Fix resolve_user_preferences to handle array structure
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
  
  IF v_m8_q8_value IS NOT NULL AND 
     (jsonb_typeof(v_m8_q8_value) = 'boolean' AND v_m8_q8_value::boolean = true) THEN
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
      
      -- Resolve: enforce strict "no pets" preference
      v_resolved := v_resolved || jsonb_build_object(
        'M8_Q15', false,
        'M8_Q16', false,
        'M8_Q17', false
      );
    END IF;
  END IF;
  
  -- Return resolved preferences (contradictions normalized, strict constraints enforced)
  RETURN v_resolved;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_dimension_value(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dimension_value(UUID, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION resolve_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_user_preferences(UUID) TO service_role;




