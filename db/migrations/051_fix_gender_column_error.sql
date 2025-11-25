-- Migration: Fix gender column error in check_hard_constraints
-- Issue: Code tries to access profiles.gender which doesn't exist in the schema
-- Solution: Comment out gender constraint enforcement since gender data is not stored
-- Gender preferences exist in user_housing_preferences, but without actual gender data,
-- we cannot enforce "same" or "opposite" preferences.

-- Update check_hard_constraints function to remove gender column access
CREATE OR REPLACE FUNCTION check_hard_constraints(
  user_a_id UUID,
  user_b_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  -- Smoking variables
  v_a_smoking_strict BOOLEAN;
  v_b_smoking_strict BOOLEAN;
  v_a_smokes BOOLEAN;
  v_b_smokes BOOLEAN;
  -- Pet variables
  v_a_pet_pref NUMERIC;
  v_b_pet_pref NUMERIC;
  v_a_has_pets BOOLEAN;
  v_b_has_pets BOOLEAN;
  -- Budget variables
  v_a_max_rent NUMERIC;
  v_b_max_rent NUMERIC;
  -- Lease length variables
  v_a_min_stay INTEGER;
  v_a_max_stay INTEGER;
  v_b_min_stay INTEGER;
  v_b_max_stay INTEGER;
  -- Gender preference variables (kept for future use if gender column is added)
  -- v_a_gender_pref TEXT;
  -- v_b_gender_pref TEXT;
  -- v_a_gender TEXT;
  -- v_b_gender TEXT;
BEGIN
  -- Ensure symmetric check (always check both directions)
  IF user_a_id = user_b_id THEN
    RETURN true; -- Same user is always compatible with themselves
  END IF;
  
  -- ============================================
  -- 1. Smoking constraints
  -- ============================================
  -- Get strict no-smoking preferences (M8_Q8: "No smoking/vaping indoors under any circumstances")
  SELECT 
    COALESCE((resolve_user_preferences(user_a_id)->>'M8_Q8')::boolean, false) INTO v_a_smoking_strict;
  SELECT 
    COALESCE((resolve_user_preferences(user_b_id)->>'M8_Q8')::boolean, false) INTO v_b_smoking_strict;
  
  -- Check if either user smokes (would be in a "do you smoke" question - simplified check)
  -- For now, we check if they have a less strict smoking preference which might indicate they smoke
  -- In production, you'd check a specific "do you smoke" question
  v_a_smokes := false; -- Placeholder - would check actual smoking status
  v_b_smokes := false; -- Placeholder - would check actual smoking status
  
  -- If userA has strict no-smoking and userB smokes → dealbreaker
  IF v_a_smoking_strict AND v_b_smokes THEN
    RETURN false;
  END IF;
  
  -- If userB has strict no-smoking and userA smokes → dealbreaker
  IF v_b_smoking_strict AND v_a_smokes THEN
    RETURN false;
  END IF;
  
  -- ============================================
  -- 2. Pet constraints
  -- ============================================
  -- Get pet preferences (M8_Q14: bipolar scale, < 0.3 = "Prefer no pets")
  v_a_pet_pref := normalize_bipolar_value(resolve_user_preferences(user_a_id)->'M8_Q14');
  v_b_pet_pref := normalize_bipolar_value(resolve_user_preferences(user_b_id)->'M8_Q14');
  
  -- Check if users have pets (would be in pet ownership questions)
  -- For now, simplified check - in production, check actual pet ownership
  v_a_has_pets := false; -- Placeholder
  v_b_has_pets := false; -- Placeholder
  
  -- If userA prefers no pets (strict: < 0.3) and userB has pets → dealbreaker
  IF v_a_pet_pref < 0.3 AND v_b_has_pets THEN
    RETURN false;
  END IF;
  
  -- If userB prefers no pets (strict: < 0.3) and userA has pets → dealbreaker
  IF v_b_pet_pref < 0.3 AND v_a_has_pets THEN
    RETURN false;
  END IF;
  
  -- ============================================
  -- 3. Budget constraints
  -- ============================================
  -- Get max rent from user_housing_preferences
  SELECT max_rent_monthly INTO v_a_max_rent
  FROM user_housing_preferences
  WHERE user_id = user_a_id;
  
  SELECT max_rent_monthly INTO v_b_max_rent
  FROM user_housing_preferences
  WHERE user_id = user_b_id;
  
  -- Budget mismatch: if budgets differ by >50%, it's a dealbreaker
  -- OR if one user has a strict budget (>=1000) and the other has NULL budget
  IF v_a_max_rent IS NOT NULL AND v_b_max_rent IS NOT NULL THEN
    -- Both budgets set: check if they differ by >50%
    IF ABS(v_a_max_rent - v_b_max_rent) / GREATEST(v_a_max_rent, v_b_max_rent) > 0.5 THEN
      RETURN false;
    END IF;
  ELSIF v_a_max_rent IS NOT NULL AND v_a_max_rent >= 1000 AND v_b_max_rent IS NULL THEN
    -- UserA has strict budget, UserB has no budget set → dealbreaker
    RETURN false;
  ELSIF v_b_max_rent IS NOT NULL AND v_b_max_rent >= 1000 AND v_a_max_rent IS NULL THEN
    -- UserB has strict budget, UserA has no budget set → dealbreaker
    RETURN false;
  END IF;
  
  -- ============================================
  -- 4. Lease length constraints
  -- ============================================
  -- Get lease preferences from user_housing_preferences
  SELECT min_stay_months, max_stay_months INTO v_a_min_stay, v_a_max_stay
  FROM user_housing_preferences
  WHERE user_id = user_a_id;
  
  SELECT min_stay_months, max_stay_months INTO v_b_min_stay, v_b_max_stay
  FROM user_housing_preferences
  WHERE user_id = user_b_id;
  
  -- Lease mismatch: if one user's min_stay > other's max_stay → dealbreaker
  -- OR if one user has strict long-term preference (>=6 months) and the other has NULL lease preferences
  IF v_a_min_stay IS NOT NULL AND v_b_max_stay IS NOT NULL THEN
    IF v_a_min_stay > v_b_max_stay THEN
      RETURN false;
    END IF;
  END IF;
  
  IF v_b_min_stay IS NOT NULL AND v_a_max_stay IS NOT NULL THEN
    IF v_b_min_stay > v_a_max_stay THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Strict long-term preference check
  IF v_a_min_stay IS NOT NULL AND v_a_min_stay >= 6 AND v_b_min_stay IS NULL AND v_b_max_stay IS NULL THEN
    RETURN false; -- UserA wants long-term, UserB has no lease preferences
  END IF;
  
  IF v_b_min_stay IS NOT NULL AND v_b_min_stay >= 6 AND v_a_min_stay IS NULL AND v_a_max_stay IS NULL THEN
    RETURN false; -- UserB wants long-term, UserA has no lease preferences
  END IF;
  
  -- ============================================
  -- 5. Gender preference (DISABLED - no gender column in profiles)
  -- ============================================
  -- NOTE: Gender constraints are DISABLED because the profiles table does not have a 'gender' column
  -- The user_housing_preferences table has gender_preference ('same', 'opposite', 'any'),
  -- but without actual gender data, we cannot enforce "same" or "opposite" preferences.
  -- If gender data is added to profiles in the future, uncomment and fix the logic below.
  --
  -- Gender constraints are opt-in only, never inferred
  -- Only enforce when both users have explicit preferences and genders are known
  -- Get gender preferences from user_housing_preferences
  -- SELECT gender_preference INTO v_a_gender_pref 
  -- FROM user_housing_preferences 
  -- WHERE user_id = user_a_id;
  -- 
  -- SELECT gender_preference INTO v_b_gender_pref 
  -- FROM user_housing_preferences 
  -- WHERE user_id = user_b_id;
  -- 
  -- Get actual genders from profiles (if available)
  -- SELECT gender INTO v_a_gender FROM profiles WHERE user_id = user_a_id;
  -- SELECT gender INTO v_b_gender FROM profiles WHERE user_id = user_b_id;
  -- 
  -- Only check if both users have gender preferences set (not NULL, not 'any')
  -- AND both genders are known
  -- IF v_a_gender_pref IS NOT NULL AND v_a_gender_pref != 'any' AND 
  --    v_b_gender IS NOT NULL AND v_a_gender IS NOT NULL THEN
  --   -- UserA wants same gender
  --   IF v_a_gender_pref = 'same' AND v_a_gender != v_b_gender THEN
  --     RETURN false; -- UserA wants same gender but genders differ
  --   END IF;
  --   -- UserA wants opposite gender  
  --   IF v_a_gender_pref = 'opposite' AND v_a_gender = v_b_gender THEN
  --     RETURN false; -- UserA wants opposite gender but genders are same
  --   END IF;
  -- END IF;
  -- 
  -- Symmetric check for userB
  -- IF v_b_gender_pref IS NOT NULL AND v_b_gender_pref != 'any' AND 
  --    v_b_gender IS NOT NULL AND v_a_gender IS NOT NULL THEN
  --   IF v_b_gender_pref = 'same' AND v_b_gender != v_a_gender THEN
  --     RETURN false; -- UserB wants same gender but genders differ
  --   END IF;
  --   IF v_b_gender_pref = 'opposite' AND v_b_gender = v_a_gender THEN
  --     RETURN false; -- UserB wants opposite gender but genders are same
  --   END IF;
  -- END IF;
  
  -- All constraints passed
  RETURN true;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_hard_constraints(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_hard_constraints(UUID, UUID) TO service_role;

-- Add comment explaining the change
COMMENT ON FUNCTION check_hard_constraints(UUID, UUID) IS 
'Checks hard dealbreaker constraints between two users. '
'Gender constraints are disabled because the profiles table does not have a gender column.';

