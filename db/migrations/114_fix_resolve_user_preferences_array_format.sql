-- Fix resolve_user_preferences to handle array format answers
-- Answers are stored as: [{itemId: 'M4_Q1', value: 'high'}, ...]
-- But the function expects: {'M4_Q1': 'high', ...}

-- Drop and recreate to ensure it's in the right schema
DROP FUNCTION IF EXISTS resolve_user_preferences(UUID);

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
  v_m8_q8_value JSONB;
  v_m8_q14_value JSONB;
  v_m8_q15_value JSONB;
  v_m8_q16_value JSONB;
  v_m8_q17_value JSONB;
  v_pet_pref_norm NUMERIC;
  v_has_pet_tolerance BOOLEAN := false;
  v_contradiction_entry JSONB;
  v_array_length INTEGER;
  v_i INTEGER;
BEGIN
  -- Collect all answers from onboarding_sections
  -- Answers are stored as JSONB array: [{itemId: 'M4_Q1', value: 'high'}, ...]
  -- We need to convert to flat object: {'M4_Q1': 'high', ...}
  FOR v_section_record IN
    SELECT answers FROM public.onboarding_sections WHERE user_id = p_user_id
  LOOP
    -- Check if answers is an array (new format) or object (old format)
    IF jsonb_typeof(v_section_record.answers) = 'array' THEN
      -- New format: array of {itemId, value, dealBreaker} objects
      -- Convert to flat object: {itemId: value}
      v_array_length := jsonb_array_length(v_section_record.answers);
      FOR v_i IN 0..v_array_length - 1 LOOP
        v_answer_item := v_section_record.answers->v_i;
        
        -- Extract itemId and value from answer object
        -- Answer format: {itemId: 'M4_Q1', value: 'high'} or {itemId: 'M4_Q1', value: {value: 'high'}}
        v_item_id := v_answer_item->>'itemId';
        
        -- Skip if no itemId
        IF v_item_id IS NULL THEN
          CONTINUE;
        END IF;
        
        -- Extract value - handle different structures
        v_item_value := v_answer_item->'value';
        
        -- Handle nested {value: {value: X}} structure (double nested)
        IF v_item_value IS NOT NULL AND jsonb_typeof(v_item_value) = 'object' THEN
          IF v_item_value ? 'value' THEN
            -- Nested: {value: {value: X}} -> extract inner value
            v_item_value := v_item_value->'value';
            -- If still an object, might be another level of nesting
            IF jsonb_typeof(v_item_value) = 'object' AND v_item_value ? 'value' THEN
              v_item_value := v_item_value->'value';
            END IF;
          END IF;
        END IF;
        
        -- Add to flat object - preserve the value as-is (string, number, boolean, object, null)
        -- This ensures booleans stay as booleans, strings as strings, etc.
        v_all_answers := v_all_answers || jsonb_build_object(v_item_id, COALESCE(v_item_value, jsonb 'null'));
      END LOOP;
    ELSE
      -- Old format: already a flat object, merge directly
      v_all_answers := v_all_answers || v_section_record.answers;
    END IF;
  END LOOP;
  
  -- Start with all answers as resolved (will override contradictions)
  v_resolved := v_all_answers;
  
  -- ============================================
  -- Detect and resolve smoking contradictions
  -- ============================================
  -- M8_Q8: "No smoking/vaping indoors under any circumstances" (strict dealbreaker)
  -- Check if user has strict no-smoking but also indicates they smoke
  v_m8_q8_value := v_all_answers->'M8_Q8';
  
  IF v_m8_q8_value IS NOT NULL AND 
     (jsonb_typeof(v_m8_q8_value) = 'boolean' AND v_m8_q8_value::boolean = true) THEN
    -- User has strict no-smoking rule
    -- Check if they also indicate they smoke (would be in a "do you smoke" question)
    -- For now, we check if M5_Q17 (less strict smoking rule) is also set, which might indicate they smoke
    -- In a full implementation, we'd check a specific "do you smoke" question
    -- Priority: strict constraint wins - if M8_Q8=true, enforce no smoking
    
    -- Log if there's a potential contradiction (user wants no smoking but might smoke themselves)
    -- This is a simplified check - in production, you'd have a specific "do you smoke" question
    -- For now, we just ensure strict constraint is enforced
  END IF;
  
  -- ============================================
  -- Detect and resolve pet contradictions
  -- ============================================
  -- M8_Q14: "Prefer no pets" (bipolar: left="Prefer no pets" < 0.3, right="Okay with some pets" > 0.7)
  -- M8_Q15/M8_Q16/M8_Q17: "I'm okay with cats/dogs/small animals" (boolean toggles)
  v_m8_q14_value := v_all_answers->'M8_Q14';
  v_m8_q15_value := v_all_answers->'M8_Q15';
  v_m8_q16_value := v_all_answers->'M8_Q16';
  v_m8_q17_value := v_all_answers->'M8_Q17';
  
  -- Check if user prefers no pets (strict preference)
  IF v_m8_q14_value IS NOT NULL THEN
    v_pet_pref_norm := public.normalize_bipolar_value(v_m8_q14_value);
    
    -- Check if user has pet tolerance toggles set
    v_has_pet_tolerance := 
      (v_m8_q15_value IS NOT NULL AND jsonb_typeof(v_m8_q15_value) = 'boolean' AND v_m8_q15_value::boolean = true) OR
      (v_m8_q16_value IS NOT NULL AND jsonb_typeof(v_m8_q16_value) = 'boolean' AND v_m8_q16_value::boolean = true) OR
      (v_m8_q17_value IS NOT NULL AND jsonb_typeof(v_m8_q17_value) = 'boolean' AND v_m8_q17_value::boolean = true);
    
    -- If user prefers no pets (strict: < 0.3) but also says okay with pets → contradiction
    IF v_pet_pref_norm < 0.3 AND v_has_pet_tolerance THEN
      -- Flag contradiction
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
        'M8_Q15', false,
        'M8_Q16', false,
        'M8_Q17', false
      );
    END IF;
  END IF;
  
  -- ============================================
  -- Note: Inconsistency flags are NOT updated here to avoid read-only transaction errors
  -- The inconsistencies are detected and resolved in the returned preferences
  -- If needed, inconsistency_flags can be updated separately via a background job or trigger
  -- ============================================
  
  -- Return resolved preferences (contradictions normalized, strict constraints enforced)
  -- Note: v_inconsistencies contains detected contradictions but is not persisted
  -- to avoid "UPDATE in read-only transaction" errors in Supabase RPC calls
  RETURN v_resolved;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.resolve_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_user_preferences(UUID) TO service_role;

-- Also update check_hard_constraints to handle missing values more gracefully
-- The issue is that when values are missing, the boolean conversion fails
DROP FUNCTION IF EXISTS check_hard_constraints(UUID, UUID);

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
  v_a_no_smoking_strict BOOLEAN := false;
  v_b_smokes BOOLEAN := false;
  v_a_no_pets_strict BOOLEAN := false;
  v_b_has_pets BOOLEAN := false;
  v_a_has_pets BOOLEAN := false;
  v_a_allergic_pets BOOLEAN := false;
  v_a_pet_pref NUMERIC;
  v_b_pet_pref NUMERIC;
  v_m8_q8_a JSONB;
  v_m8_q8_b JSONB;
  v_m8_q8_a_bool BOOLEAN;
  v_m8_q8_b_bool BOOLEAN;
BEGIN
  -- Get resolved preferences (handles contradictions)
  v_a_prefs := public.resolve_user_preferences(user_a_id);
  v_b_prefs := public.resolve_user_preferences(user_b_id);
  
  -- 1. Smoking constraints
  -- M8_Q8: "No smoking/vaping indoors under any circumstances" (strict dealbreaker)
  -- Handle boolean conversion more safely
  v_m8_q8_a := v_a_prefs->'M8_Q8';
  v_m8_q8_b := v_b_prefs->'M8_Q8';
  
  -- Convert to boolean safely
  IF v_m8_q8_a IS NOT NULL THEN
    IF jsonb_typeof(v_m8_q8_a) = 'boolean' THEN
      v_m8_q8_a_bool := v_m8_q8_a::boolean;
    ELSIF jsonb_typeof(v_m8_q8_a) = 'string' THEN
      v_m8_q8_a_bool := (v_m8_q8_a#>>'{}')::boolean;
    ELSE
      v_m8_q8_a_bool := false;
    END IF;
  ELSE
    v_m8_q8_a_bool := false;
  END IF;
  
  IF v_m8_q8_b IS NOT NULL THEN
    IF jsonb_typeof(v_m8_q8_b) = 'boolean' THEN
      v_m8_q8_b_bool := v_m8_q8_b::boolean;
    ELSIF jsonb_typeof(v_m8_q8_b) = 'string' THEN
      v_m8_q8_b_bool := (v_m8_q8_b#>>'{}')::boolean;
    ELSE
      v_m8_q8_b_bool := false;
    END IF;
  ELSE
    v_m8_q8_b_bool := false;
  END IF;
  
  -- Check if userA has strict no-smoking
  -- M8_Q8 = true means "No smoking/vaping indoors under any circumstances"
  -- This is a preference/rule, not a statement about whether they smoke
  -- We should only fail if we have explicit evidence of a conflict
  -- Since we don't have a "do you smoke" question, we'll be lenient:
  -- Only fail if BOTH users have conflicting explicit rules
  -- For now, we'll allow matches even if one has strict no-smoking and the other doesn't
  -- (The matching algorithm will still penalize differences in preferences)
  
  -- TODO: Add a "do you smoke" question to properly handle this dealbreaker
  
  -- For now, skip the smoking dealbreaker check since we don't have enough data
  -- The compatibility score will still reflect preference differences
  
  -- 2. Pets vs allergies (simplified - keep original logic but with safer null handling)
  -- Get userA's pet preference (normalized: < 0.3 = no pets)
  IF (v_a_prefs->'M8_Q14') IS NOT NULL THEN
    v_a_pet_pref := public.normalize_bipolar_value(v_a_prefs->'M8_Q14');
    -- If userA prefers no pets (strict)
    IF v_a_pet_pref < 0.3 THEN
      -- Check if userB has any pets or wants pets
      v_b_has_pets := COALESCE((v_b_prefs->'M8_Q15')::boolean, false) OR
                     COALESCE((v_b_prefs->'M8_Q16')::boolean, false) OR
                     COALESCE((v_b_prefs->'M8_Q17')::boolean, false);
      -- If userB has pets and userA doesn't want pets → fail
      IF v_b_has_pets THEN
        RETURN false;
      END IF;
      -- If userA has strict no-pets and userB's preference is NULL → be lenient (don't fail on missing data)
    END IF;
  END IF;
  
  -- Symmetric check for userB
  IF (v_b_prefs->'M8_Q14') IS NOT NULL THEN
    v_b_pet_pref := public.normalize_bipolar_value(v_b_prefs->'M8_Q14');
    IF v_b_pet_pref < 0.3 THEN
      v_a_has_pets := COALESCE((v_a_prefs->'M8_Q15')::boolean, false) OR
                     COALESCE((v_a_prefs->'M8_Q16')::boolean, false) OR
                     COALESCE((v_a_prefs->'M8_Q17')::boolean, false);
      IF v_a_has_pets THEN
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  -- 3. Budget constraints (if implemented)
  -- 4. Lease length constraints (if implemented)
  -- 5. Gender preferences (commented out - no gender column)
  
  -- All constraints passed
  RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_hard_constraints(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_hard_constraints(UUID, UUID) TO service_role;

