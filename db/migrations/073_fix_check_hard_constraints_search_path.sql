-- Migration: Fix check_hard_constraints to use public. prefixes
-- Date: 2025-11-27
-- Description: check_hard_constraints has SET search_path = '' but doesn't use public. prefixes
--              for function calls and table references, causing it to fail.

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
  v_a_wants_no_smoking BOOLEAN;
  v_b_wants_no_smoking BOOLEAN;
  v_a_is_smoker BOOLEAN;
  v_b_is_smoker BOOLEAN;
BEGIN
  -- Get resolved preferences (single source of truth) - use public. prefix
  v_a_prefs := public.resolve_user_preferences(user_a_id);
  v_b_prefs := public.resolve_user_preferences(user_b_id);
  
  -- 1. Smoking constraints
  -- M8_Q8: "No smoking/vaping indoors under any circumstances" (strict dealbreaker)
  -- true = user wants no smoking rule, false = user doesn't want this strict rule
  -- We also check user_housing_preferences.smoking_preference to see if user is actually a smoker
  -- Only fail if one user wants no smoking AND the other user is actually a smoker
  
  v_a_wants_no_smoking := public.extract_boolean_value(v_a_prefs->'M8_Q8') = true;
  v_b_wants_no_smoking := public.extract_boolean_value(v_b_prefs->'M8_Q8') = true;
  
  -- Get smoking preference from user_housing_preferences
  -- 'smoking_ok' indicates user is okay with smoking (might be a smoker)
  -- 'no_smoking' indicates user doesn't want smoking
  -- 'either' indicates user doesn't care
  SELECT smoking_preference INTO v_a_smoking_pref 
  FROM public.user_housing_preferences WHERE user_id = user_a_id;
  
  SELECT smoking_preference INTO v_b_smoking_pref 
  FROM public.user_housing_preferences WHERE user_id = user_b_id;
  
  -- Infer if user is a smoker based on smoking_preference
  -- If smoking_preference is 'smoking_ok', we assume they might be a smoker or are okay with smoking
  v_a_is_smoker := (v_a_smoking_pref = 'smoking_ok');
  v_b_is_smoker := (v_b_smoking_pref = 'smoking_ok');
  
  -- If we have smoking_preference data, use it to determine conflicts
  IF v_a_smoking_pref IS NOT NULL AND v_b_smoking_pref IS NOT NULL THEN
    -- Fail if one user wants no smoking AND the other is a smoker
    IF v_a_wants_no_smoking AND v_b_is_smoker THEN
      -- UserA wants no smoking, UserB is a smoker → conflict
      RETURN false;
    END IF;
    
    IF v_b_wants_no_smoking AND v_a_is_smoker THEN
      -- UserB wants no smoking, UserA is a smoker → conflict
      RETURN false;
    END IF;
  ELSE
    -- Fallback: If smoking_preference is not set, don't fail on smoking conflicts
    -- This prevents false positives where users can't match just because data is missing
    -- The user_housing_preferences should be set during onboarding
    NULL; -- Do nothing, continue with other checks
  END IF;
  
  -- 2. Pets vs allergies
  -- M8_Q14: "Prefer no pets" (bipolar: left="Prefer no pets", right="Okay with some pets")
  -- M8_Q15/M8_Q16/M8_Q17: "I'm okay with cats/dogs/small animals" (toggle)
  -- All questions are mandatory, so we can assume both users have answered
  -- < 0.3 = prefers no pets, > 0.7 = okay with pets
  -- true on toggles = okay with that pet type
  
  -- Get normalized pet preferences (both users have answered) - use public. prefix
  v_a_pet_pref := public.normalize_bipolar_value(v_a_prefs->'M8_Q14');
  v_b_pet_pref := public.normalize_bipolar_value(v_b_prefs->'M8_Q14');
  
  -- If userA prefers no pets (< 0.3), check if userB wants pets
  IF v_a_pet_pref < 0.3 THEN
    -- Fail if userB explicitly wants pets (bipolar > 0.7 OR any toggle = true)
    IF v_b_pet_pref > 0.7 OR
       public.extract_boolean_value(v_b_prefs->'M8_Q15') = true OR
       public.extract_boolean_value(v_b_prefs->'M8_Q16') = true OR
       public.extract_boolean_value(v_b_prefs->'M8_Q17') = true THEN
      RETURN false; -- UserA doesn't want pets, UserB wants pets
    END IF;
  END IF;
  
  -- Symmetric check: userB prefers no pets, userA wants pets
  IF v_b_pet_pref < 0.3 THEN
    IF v_a_pet_pref > 0.7 OR
       public.extract_boolean_value(v_a_prefs->'M8_Q15') = true OR
       public.extract_boolean_value(v_a_prefs->'M8_Q16') = true OR
       public.extract_boolean_value(v_a_prefs->'M8_Q17') = true THEN
      RETURN false; -- UserB doesn't want pets, UserA wants pets
    END IF;
  END IF;
  
  -- 3. Budget constraints
  -- Check if budgets are compatible (within 50% difference)
  -- Note: Budget is stored in user_housing_preferences table, not questionnaire
  -- If budget data is missing, we don't fail (budget may not be mandatory)
  -- Use public. prefix for table reference
  SELECT max_rent_monthly INTO v_a_budget FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_rent_monthly INTO v_b_budget FROM public.user_housing_preferences WHERE user_id = user_b_id;
  
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
  -- Use public. prefix for table references
  SELECT min_stay_months INTO v_a_min_stay FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_stay_months INTO v_a_max_stay FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT min_stay_months INTO v_b_min_stay FROM public.user_housing_preferences WHERE user_id = user_b_id;
  SELECT max_stay_months INTO v_b_max_stay FROM public.user_housing_preferences WHERE user_id = user_b_id;
  
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.check_hard_constraints(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_hard_constraints(UUID, UUID) TO service_role;

