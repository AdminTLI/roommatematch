-- Migration: Debug function to check which hard constraint is failing
-- Date: 2025-11-27
-- Description: This is a diagnostic function to help identify which hard constraint
--              is causing check_hard_constraints to return false.

CREATE OR REPLACE FUNCTION public.debug_hard_constraints(
  user_a_id UUID,
  user_b_id UUID
) RETURNS TABLE (
  constraint_name TEXT,
  passed BOOLEAN,
  details JSONB
)
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
  v_smoking_conflict BOOLEAN := false;
  v_pets_conflict BOOLEAN := false;
  v_budget_conflict BOOLEAN := false;
  v_lease_conflict BOOLEAN := false;
BEGIN
  -- Get resolved preferences
  v_a_prefs := public.resolve_user_preferences(user_a_id);
  v_b_prefs := public.resolve_user_preferences(user_b_id);
  
  -- Check 1: Smoking constraints
  IF public.extract_boolean_value(v_a_prefs->'M8_Q8') = true AND 
     public.extract_boolean_value(v_b_prefs->'M8_Q8') = false THEN
    v_smoking_conflict := true;
    RETURN QUERY SELECT 'smoking'::TEXT, false::BOOLEAN, 
      jsonb_build_object(
        'reason', 'User A wants no smoking, User B allows smoking',
        'user_a_m8_q8', v_a_prefs->'M8_Q8',
        'user_b_m8_q8', v_b_prefs->'M8_Q8'
      );
  END IF;
  
  IF public.extract_boolean_value(v_b_prefs->'M8_Q8') = true AND 
     public.extract_boolean_value(v_a_prefs->'M8_Q8') = false THEN
    v_smoking_conflict := true;
    RETURN QUERY SELECT 'smoking'::TEXT, false::BOOLEAN,
      jsonb_build_object(
        'reason', 'User B wants no smoking, User A allows smoking',
        'user_a_m8_q8', v_a_prefs->'M8_Q8',
        'user_b_m8_q8', v_b_prefs->'M8_Q8'
      );
  END IF;
  
  IF NOT v_smoking_conflict THEN
    RETURN QUERY SELECT 'smoking'::TEXT, true::BOOLEAN, 
      jsonb_build_object(
        'user_a_m8_q8', v_a_prefs->'M8_Q8',
        'user_b_m8_q8', v_b_prefs->'M8_Q8'
      );
  END IF;
  
  -- Check 2: Pets constraints
  v_a_pet_pref := public.normalize_bipolar_value(v_a_prefs->'M8_Q14');
  v_b_pet_pref := public.normalize_bipolar_value(v_b_prefs->'M8_Q14');
  
  IF v_a_pet_pref < 0.3 THEN
    IF v_b_pet_pref > 0.7 OR
       public.extract_boolean_value(v_b_prefs->'M8_Q15') = true OR
       public.extract_boolean_value(v_b_prefs->'M8_Q16') = true OR
       public.extract_boolean_value(v_b_prefs->'M8_Q17') = true THEN
      v_pets_conflict := true;
      RETURN QUERY SELECT 'pets'::TEXT, false::BOOLEAN,
        jsonb_build_object(
          'reason', 'User A prefers no pets, User B wants pets',
          'user_a_m8_q14', v_a_prefs->'M8_Q14',
          'user_a_pet_pref', v_a_pet_pref,
          'user_b_m8_q14', v_b_prefs->'M8_Q14',
          'user_b_pet_pref', v_b_pet_pref,
          'user_b_wants_cats', public.extract_boolean_value(v_b_prefs->'M8_Q15'),
          'user_b_wants_dogs', public.extract_boolean_value(v_b_prefs->'M8_Q16'),
          'user_b_wants_small', public.extract_boolean_value(v_b_prefs->'M8_Q17')
        );
    END IF;
  END IF;
  
  IF v_b_pet_pref < 0.3 THEN
    IF v_a_pet_pref > 0.7 OR
       public.extract_boolean_value(v_a_prefs->'M8_Q15') = true OR
       public.extract_boolean_value(v_a_prefs->'M8_Q16') = true OR
       public.extract_boolean_value(v_a_prefs->'M8_Q17') = true THEN
      v_pets_conflict := true;
      RETURN QUERY SELECT 'pets'::TEXT, false::BOOLEAN,
        jsonb_build_object(
          'reason', 'User B prefers no pets, User A wants pets',
          'user_a_m8_q14', v_a_prefs->'M8_Q14',
          'user_a_pet_pref', v_a_pet_pref,
          'user_b_m8_q14', v_b_prefs->'M8_Q14',
          'user_b_pet_pref', v_b_pet_pref,
          'user_a_wants_cats', public.extract_boolean_value(v_a_prefs->'M8_Q15'),
          'user_a_wants_dogs', public.extract_boolean_value(v_a_prefs->'M8_Q16'),
          'user_a_wants_small', public.extract_boolean_value(v_a_prefs->'M8_Q17')
        );
    END IF;
  END IF;
  
  IF NOT v_pets_conflict THEN
    RETURN QUERY SELECT 'pets'::TEXT, true::BOOLEAN,
      jsonb_build_object(
        'user_a_m8_q14', v_a_prefs->'M8_Q14',
        'user_a_pet_pref', v_a_pet_pref,
        'user_b_m8_q14', v_b_prefs->'M8_Q14',
        'user_b_pet_pref', v_b_pet_pref
      );
  END IF;
  
  -- Check 3: Budget constraints
  SELECT max_rent_monthly INTO v_a_budget FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_rent_monthly INTO v_b_budget FROM public.user_housing_preferences WHERE user_id = user_b_id;
  
  IF v_a_budget IS NOT NULL AND v_b_budget IS NOT NULL THEN
    IF ABS(v_a_budget - v_b_budget) / GREATEST(v_a_budget, v_b_budget) > 0.5 THEN
      v_budget_conflict := true;
      RETURN QUERY SELECT 'budget'::TEXT, false::BOOLEAN,
        jsonb_build_object(
          'reason', 'Budgets differ by more than 50%',
          'user_a_budget', v_a_budget,
          'user_b_budget', v_b_budget,
          'difference_percent', (ABS(v_a_budget - v_b_budget) / GREATEST(v_a_budget, v_b_budget) * 100)::numeric(10,2)
        );
    END IF;
  END IF;
  
  IF NOT v_budget_conflict THEN
    RETURN QUERY SELECT 'budget'::TEXT, true::BOOLEAN,
      jsonb_build_object(
        'user_a_budget', v_a_budget,
        'user_b_budget', v_b_budget
      );
  END IF;
  
  -- Check 4: Lease length constraints
  SELECT min_stay_months INTO v_a_min_stay FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT max_stay_months INTO v_a_max_stay FROM public.user_housing_preferences WHERE user_id = user_a_id;
  SELECT min_stay_months INTO v_b_min_stay FROM public.user_housing_preferences WHERE user_id = user_b_id;
  SELECT max_stay_months INTO v_b_max_stay FROM public.user_housing_preferences WHERE user_id = user_b_id;
  
  IF v_a_min_stay IS NOT NULL AND v_b_max_stay IS NOT NULL AND v_a_min_stay > v_b_max_stay THEN
    v_lease_conflict := true;
    RETURN QUERY SELECT 'lease_length'::TEXT, false::BOOLEAN,
      jsonb_build_object(
        'reason', 'User A min_stay > User B max_stay',
        'user_a_min_stay', v_a_min_stay,
        'user_b_max_stay', v_b_max_stay
      );
  END IF;
  
  IF v_b_min_stay IS NOT NULL AND v_a_max_stay IS NOT NULL AND v_b_min_stay > v_a_max_stay THEN
    v_lease_conflict := true;
    RETURN QUERY SELECT 'lease_length'::TEXT, false::BOOLEAN,
      jsonb_build_object(
        'reason', 'User B min_stay > User A max_stay',
        'user_b_min_stay', v_b_min_stay,
        'user_a_max_stay', v_a_max_stay
      );
  END IF;
  
  IF NOT v_lease_conflict THEN
    RETURN QUERY SELECT 'lease_length'::TEXT, true::BOOLEAN,
      jsonb_build_object(
        'user_a_min_stay', v_a_min_stay,
        'user_a_max_stay', v_a_max_stay,
        'user_b_min_stay', v_b_min_stay,
        'user_b_max_stay', v_b_max_stay
      );
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.debug_hard_constraints(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_hard_constraints(UUID, UUID) TO service_role;










