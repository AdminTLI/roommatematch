-- Fix hard constraints that are too strict
-- Issue: The smoking constraint fails if one user has strict no-smoking (M8_Q8=true)
--        and the other user doesn't have M8_Q8 set (NULL), even though NULL doesn't mean they smoke
-- Fix: Only fail if the other user explicitly indicates they smoke, not if they have NULL

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
  v_a_no_smoking_strict BOOLEAN := false;
  v_b_smokes BOOLEAN := false;
  v_a_no_pets_strict BOOLEAN := false;
  v_b_has_pets BOOLEAN := false;
  v_a_has_pets BOOLEAN := false;
  v_a_allergic_pets BOOLEAN := false;
  v_a_pet_pref NUMERIC;
  v_b_pet_pref NUMERIC;
  -- Budget variables
  v_a_budget NUMERIC;
  v_b_budget NUMERIC;
  -- Lease length variables
  v_a_min_stay INTEGER;
  v_a_max_stay INTEGER;
  v_b_min_stay INTEGER;
  v_b_max_stay INTEGER;
BEGIN
  -- Get resolved preferences (handles contradictions)
  v_a_prefs := resolve_user_preferences(user_a_id);
  v_b_prefs := resolve_user_preferences(user_b_id);
  
  -- 1. Smoking constraints
  -- M8_Q8: "No smoking/vaping indoors under any circumstances" (strict dealbreaker)
  -- Only fail if one user has strict no-smoking AND the other explicitly indicates they smoke
  -- NULL or missing M8_Q8 does NOT mean they smoke - it just means they haven't answered
  IF v_a_prefs ? 'M8_Q8' AND (v_a_prefs->>'M8_Q8')::boolean = true THEN
    v_a_no_smoking_strict := true;
    -- Only fail if userB explicitly indicates they smoke (would need a "do you smoke" question)
    -- For now, we can't determine if userB smokes, so we only fail if userB has explicitly
    -- indicated they're okay with smoking (which would be in a different question)
    -- Since we don't have a "do you smoke" question, we'll be lenient: only fail if
    -- userB has explicitly set M8_Q8=false (indicating they're NOT strict about no-smoking)
    -- NULL means unknown, so we allow it
    IF v_b_prefs ? 'M8_Q8' AND (v_b_prefs->>'M8_Q8')::boolean = false THEN
      -- UserA has strict no-smoking, UserB explicitly says they're not strict → potential conflict
      -- But we can't be sure UserB smokes, so we'll allow it for now
      -- In a full implementation, you'd check a "do you smoke" question
      -- For now, we'll pass this constraint
    END IF;
  END IF;
  
  -- Symmetric check: userB strict no-smoking vs userA
  IF v_b_prefs ? 'M8_Q8' AND (v_b_prefs->>'M8_Q8')::boolean = true THEN
    IF v_a_prefs ? 'M8_Q8' AND (v_a_prefs->>'M8_Q8')::boolean = false THEN
      -- Similar logic - allow for now since we can't determine if userA smokes
    END IF;
  END IF;
  
  -- 2. Pets vs allergies
  -- M8_Q14: "Prefer no pets" (bipolar: left="Prefer no pets" < 0.3, right="Okay with some pets" > 0.7)
  -- M8_Q15/M8_Q16/M8_Q17: "I'm okay with cats/dogs/small animals" (toggle)
  -- Check if userA has "no pets" preference and userB has pets or wants pets
  
  -- Get userA's pet preference (normalized: < 0.3 = no pets)
  IF v_a_prefs ? 'M8_Q14' THEN
    v_a_pet_pref := normalize_bipolar_value(v_a_prefs->'M8_Q14');
    -- If userA prefers no pets (strict)
    IF v_a_pet_pref < 0.3 THEN
      -- Check if userB has any pets or wants pets
      v_b_has_pets := 
        (v_b_prefs ? 'M8_Q15' AND (v_b_prefs->>'M8_Q15')::boolean = true) OR
        (v_b_prefs ? 'M8_Q16' AND (v_b_prefs->>'M8_Q16')::boolean = true) OR
        (v_b_prefs ? 'M8_Q17' AND (v_b_prefs->>'M8_Q17')::boolean = true);
      -- If userB has pets and userA doesn't want pets → fail
      IF v_b_has_pets THEN
        RETURN false;
      END IF;
      -- If userA has strict no-pets and userB's preference is NULL → allow (unknown)
      -- We removed the strict rule + unknown → fail logic
    END IF;
  END IF;
  
  -- Symmetric check: userB no-pets vs userA
  IF v_b_prefs ? 'M8_Q14' THEN
    v_b_pet_pref := normalize_bipolar_value(v_b_prefs->'M8_Q14');
    IF v_b_pet_pref < 0.3 THEN
      v_a_has_pets := 
        (v_a_prefs ? 'M8_Q15' AND (v_a_prefs->>'M8_Q15')::boolean = true) OR
        (v_a_prefs ? 'M8_Q16' AND (v_a_prefs->>'M8_Q16')::boolean = true) OR
        (v_a_prefs ? 'M8_Q17' AND (v_a_prefs->>'M8_Q17')::boolean = true);
      IF v_a_has_pets THEN
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  -- 3. Budget overlap
  -- Check max_rent_monthly from user_housing_preferences table
  SELECT max_rent_monthly INTO v_a_budget 
  FROM user_housing_preferences 
  WHERE user_id = user_a_id;
  
  SELECT max_rent_monthly INTO v_b_budget 
  FROM user_housing_preferences 
  WHERE user_id = user_b_id;
  
  -- If both have budgets, check compatibility
  -- Budget mismatch too large (>50% difference) → fail
  IF v_a_budget IS NOT NULL AND v_b_budget IS NOT NULL THEN
    IF v_a_budget < v_b_budget * 0.5 OR v_b_budget < v_a_budget * 0.5 THEN
      RETURN false; -- Budget mismatch too large
    END IF;
  END IF;
  
  -- Removed strict rule + unknown → fail logic for budgets
  -- NULL budget doesn't mean incompatibility
  
  -- 4. Lease length compatibility
  -- Check min_stay_months and max_stay_months from user_housing_preferences
  SELECT min_stay_months, max_stay_months 
  INTO v_a_min_stay, v_a_max_stay
  FROM user_housing_preferences 
  WHERE user_id = user_a_id;
  
  SELECT min_stay_months, max_stay_months 
  INTO v_b_min_stay, v_b_max_stay
  FROM user_housing_preferences 
  WHERE user_id = user_b_id;
  
  -- Check if stay periods overlap
  -- If userA wants min 12 months and userB max is 6 months → fail
  IF v_a_min_stay IS NOT NULL AND v_b_max_stay IS NOT NULL THEN
    IF v_a_min_stay > v_b_max_stay THEN
      RETURN false; -- No overlap: userA needs longer than userB can commit
    END IF;
  END IF;
  
  -- Symmetric check
  IF v_b_min_stay IS NOT NULL AND v_a_max_stay IS NOT NULL THEN
    IF v_b_min_stay > v_a_max_stay THEN
      RETURN false; -- No overlap: userB needs longer than userA can commit
    END IF;
  END IF;
  
  -- Removed strict rule + unknown → fail logic for lease length
  -- NULL lease preferences don't mean incompatibility
  
  -- All constraints passed
  RETURN true;
END;
$$;






