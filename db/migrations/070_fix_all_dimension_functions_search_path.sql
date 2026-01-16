-- Migration: Fix all dimension functions to use public. prefixes
-- Date: 2025-11-27
-- Description: All dimension functions have SET search_path = '' but don't use public. prefixes
--              for function calls, causing them to fail when called from compute_compatibility_score.

-- Fix get_cleanliness_dimension
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
  v_kitchen JSONB;
  v_bathroom JSONB;
  v_living JSONB;
  v_kitchen_norm NUMERIC;
  v_bathroom_norm NUMERIC;
  v_living_norm NUMERIC;
BEGIN
  -- Get resolved preferences first (handles contradictions) - single source of truth
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_kitchen := public.get_dimension_value(p_user_id, 'M4_Q1', v_resolved);
  v_bathroom := public.get_dimension_value(p_user_id, 'M4_Q2', v_resolved);
  v_living := public.get_dimension_value(p_user_id, 'M4_Q3', v_resolved);
  
  -- Normalize MCQ values (low=0, medium=0.5, high=1.0)
  v_kitchen_norm := public.normalize_mcq_value(v_kitchen);
  v_bathroom_norm := public.normalize_mcq_value(v_bathroom);
  v_living_norm := public.normalize_mcq_value(v_living);
  
  -- Average the three areas
  RETURN COALESCE((v_kitchen_norm + v_bathroom_norm + v_living_norm) / 3.0, 0.5);
END;
$$;

-- Fix get_guests_dimension
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
  v_daytime JSONB;
  v_overnight JSONB;
  v_daytime_norm NUMERIC;
  v_overnight_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_daytime := public.get_dimension_value(p_user_id, 'M5_Q3', v_resolved);
  v_overnight := public.get_dimension_value(p_user_id, 'M5_Q4', v_resolved);
  
  -- Normalize frequency (0=0.0, 1-2=0.33, 3-4=0.67, 5+=1.0)
  v_daytime_norm := public.normalize_mcq_value(v_daytime);
  v_overnight_norm := public.normalize_mcq_value(v_overnight);
  
  -- Average (higher = more guests)
  RETURN COALESCE((v_daytime_norm + v_overnight_norm) / 2.0, 0.5);
END;
$$;

-- Fix get_sleep_dimension (includes time parsing from migration 058)
CREATE OR REPLACE FUNCTION public.get_sleep_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_chronotype JSONB;
  v_weeknight JSONB;
  v_chronotype_norm NUMERIC;
  v_sleep_start NUMERIC;
  v_sleep_end NUMERIC;
  v_start_str TEXT;
  v_hours INTEGER;
  v_minutes INTEGER;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_chronotype := public.get_dimension_value(p_user_id, 'M2_Q1', v_resolved);
  v_weeknight := public.get_dimension_value(p_user_id, 'M2_Q2', v_resolved);
  
  -- Chronotype: night-owl=0.0, morning-lark=1.0
  v_chronotype_norm := public.normalize_bipolar_value(v_chronotype);
  
  -- Weeknight sleep window: extract start time and normalize
  -- Format can be:
  -- 1. timeRange object: {"start": "23:00", "end": "07:00"} (time strings)
  -- 2. timeRange object: {"start": 23.0, "end": 7.0} (numeric hours)
  -- 3. Simple numeric value: 23.0
  IF v_weeknight IS NOT NULL THEN
    IF jsonb_typeof(v_weeknight) = 'object' THEN
      -- Extract start time (could be string "HH:mm" or numeric)
      v_start_str := v_weeknight->>'start';
      
      IF v_start_str IS NOT NULL THEN
        BEGIN
          -- Try to parse as time string "HH:mm" first
          IF position(':' IN v_start_str) > 0 THEN
            -- Parse "HH:mm" format using split_part
            v_hours := split_part(v_start_str, ':', 1)::INTEGER;
            v_minutes := split_part(v_start_str, ':', 2)::INTEGER;
            v_sleep_start := v_hours + (v_minutes / 60.0);
          ELSE
            -- Try to parse as numeric
            v_sleep_start := v_start_str::NUMERIC;
          END IF;
        EXCEPTION
          WHEN others THEN
            -- If parsing fails, use chronotype value
            v_sleep_start := NULL;
        END;
      ELSE
        -- Try to get numeric value directly
        BEGIN
          v_sleep_start := (v_weeknight->'start')::NUMERIC;
        EXCEPTION
          WHEN others THEN
            v_sleep_start := NULL;
        END;
      END IF;
      
      -- Normalize sleep start time: 20:00=0.0 (early), 02:00=1.0 (late)
      -- Map 20-26 (8pm-2am) to [0,1]
      IF v_sleep_start IS NOT NULL THEN
        v_chronotype_norm := LEAST(1.0, GREATEST(0.0, (v_sleep_start - 20.0) / 6.0));
      END IF;
    ELSIF jsonb_typeof(v_weeknight) = 'number' THEN
      -- Direct numeric value
      v_sleep_start := v_weeknight::NUMERIC;
      IF v_sleep_start IS NOT NULL THEN
        v_chronotype_norm := LEAST(1.0, GREATEST(0.0, (v_sleep_start - 20.0) / 6.0));
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(v_chronotype_norm, 0.5);
END;
$$;

-- Fix get_shared_spaces_dimension
CREATE OR REPLACE FUNCTION public.get_shared_spaces_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_door JSONB;
  v_study JSONB;
  v_social JSONB;
  v_door_norm NUMERIC;
  v_study_norm NUMERIC;
  v_social_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_door := public.get_dimension_value(p_user_id, 'M7_Q1', v_resolved);
  v_study := public.get_dimension_value(p_user_id, 'M7_Q3', v_resolved);
  v_social := public.get_dimension_value(p_user_id, 'M7_Q4', v_resolved);
  
  -- Door: open-door=1.0 (more shared), closed-door=0.0 (more private)
  v_door_norm := public.normalize_bipolar_value(v_door);
  -- Study in common areas: agree=1.0 (more shared)
  v_study_norm := public.normalize_likert_value(v_study);
  -- Common areas for socializing: agree=1.0 (more shared)
  v_social_norm := public.normalize_likert_value(v_social);
  
  RETURN COALESCE((v_door_norm + v_study_norm + v_social_norm) / 3.0, 0.5);
END;
$$;

-- Fix get_substances_dimension
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
  v_alcohol_common JSONB;
  v_alcohol_private JSONB;
  v_alcohol_common_norm NUMERIC;
  v_alcohol_private_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_alcohol_common := public.get_dimension_value(p_user_id, 'M5_Q18', v_resolved);
  v_alcohol_private := public.get_dimension_value(p_user_id, 'M5_Q19', v_resolved);
  
  -- Alcohol in common areas: agree=1.0 (more comfortable)
  v_alcohol_common_norm := public.normalize_likert_value(v_alcohol_common);
  -- Alcohol limited to private: agree=0.0 (less comfortable with substances)
  v_alcohol_private_norm := 1.0 - public.normalize_likert_value(v_alcohol_private);
  
  -- Average (higher = more comfortable with substances)
  RETURN COALESCE((v_alcohol_common_norm + v_alcohol_private_norm) / 2.0, 0.5);
END;
$$;

-- Fix get_study_social_dimension
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
  v_energized JSONB;
  v_social_home JSONB;
  v_quiet_home JSONB;
  v_energized_norm NUMERIC;
  v_social_norm NUMERIC;
  v_quiet_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_energized := public.get_dimension_value(p_user_id, 'M1_Q13', v_resolved);
  v_social_home := public.get_dimension_value(p_user_id, 'M5_Q1', v_resolved);
  v_quiet_home := public.get_dimension_value(p_user_id, 'M5_Q2', v_resolved);
  
  -- Energized by social: agree=1.0 (more social)
  v_energized_norm := public.normalize_likert_value(v_energized);
  -- Socially active home: agree=1.0 (more social)
  v_social_norm := public.normalize_likert_value(v_social_home);
  -- Quiet home: agree=0.0 (less social)
  v_quiet_norm := 1.0 - public.normalize_likert_value(v_quiet_home);
  
  RETURN COALESCE((v_energized_norm + v_social_norm + v_quiet_norm) / 3.0, 0.5);
END;
$$;

-- Fix get_home_vibe_dimension
CREATE OR REPLACE FUNCTION public.get_home_vibe_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_home_identity JSONB;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_home_identity := public.get_dimension_value(p_user_id, 'M1_Q6', v_resolved);
  
  -- Bipolar: left="Home as social hub"=0.0, right="Home as quiet retreat"=1.0
  -- For compatibility, we want similar values, so return as-is
  RETURN COALESCE(public.normalize_bipolar_value(v_home_identity), 0.5);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_cleanliness_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cleanliness_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_guests_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_guests_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_sleep_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sleep_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_shared_spaces_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_spaces_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_substances_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_substances_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_study_social_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_study_social_dimension(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_home_vibe_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_home_vibe_dimension(UUID) TO service_role;















