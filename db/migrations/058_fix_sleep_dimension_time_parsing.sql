-- Migration: Fix get_sleep_dimension to handle time strings
-- Issue: Function expects numeric time values but receives time strings like "23:00"
-- Solution: Parse time strings in "HH:mm" format and convert to numeric hours

CREATE OR REPLACE FUNCTION get_sleep_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_chronotype := get_dimension_value(p_user_id, 'M2_Q1', v_resolved);
  v_weeknight := get_dimension_value(p_user_id, 'M2_Q2', v_resolved);
  
  -- Chronotype: night-owl=0.0, morning-lark=1.0
  v_chronotype_norm := normalize_bipolar_value(v_chronotype);
  
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
          
          -- Normalize sleep start time: 20:00=0.0 (early), 02:00=1.0 (late)
          -- Map 20-26 (8pm-2am) to [0,1]
          -- Handle times that wrap around midnight (e.g., 1:00 = 25.0 hours)
          IF v_sleep_start < 12 THEN
            -- Times after midnight (0-12) should be treated as 24-36
            v_sleep_start := v_sleep_start + 24.0;
          END IF;
          
          IF v_sleep_start IS NOT NULL AND v_sleep_start >= 20.0 THEN
            v_chronotype_norm := LEAST(1.0, GREATEST(0.0, (v_sleep_start - 20.0) / 6.0));
          END IF;
        EXCEPTION
          WHEN OTHERS THEN
            -- If parsing fails, keep the chronotype value from bipolar scale
            NULL;
        END;
      END IF;
    ELSIF jsonb_typeof(v_weeknight) = 'string' THEN
      -- Direct time string value
      BEGIN
        IF position(':' IN v_weeknight::TEXT) > 0 THEN
          -- Parse "HH:mm" format using split_part
          v_hours := split_part(v_weeknight::TEXT, ':', 1)::INTEGER;
          v_minutes := split_part(v_weeknight::TEXT, ':', 2)::INTEGER;
          v_sleep_start := v_hours + (v_minutes / 60.0);
          
          IF v_sleep_start < 12 THEN
            v_sleep_start := v_sleep_start + 24.0;
          END IF;
          
          IF v_sleep_start >= 20.0 THEN
            v_chronotype_norm := LEAST(1.0, GREATEST(0.0, (v_sleep_start - 20.0) / 6.0));
          END IF;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END;
    ELSIF jsonb_typeof(v_weeknight) = 'number' THEN
      -- Direct numeric value
      v_sleep_start := (v_weeknight::TEXT)::NUMERIC;
      IF v_sleep_start < 12 THEN
        v_sleep_start := v_sleep_start + 24.0;
      END IF;
      IF v_sleep_start >= 20.0 THEN
        v_chronotype_norm := LEAST(1.0, GREATEST(0.0, (v_sleep_start - 20.0) / 6.0));
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(v_chronotype_norm, 0.5);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_sleep_dimension(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sleep_dimension(UUID) TO service_role;

