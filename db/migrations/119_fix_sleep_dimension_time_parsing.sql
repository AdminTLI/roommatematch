-- Fix get_sleep_dimension to properly parse timeRange values
-- Issue: The function tries to cast "23:00" (time string) directly to numeric, which fails
-- Fix: Parse the time string and extract the hour value

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
  v_sleep_start_str TEXT;
  v_hour_part TEXT;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_chronotype := get_dimension_value(p_user_id, 'M2_Q1', v_resolved);
  v_weeknight := get_dimension_value(p_user_id, 'M2_Q2', v_resolved);
  
  -- Chronotype: night-owl=0.0, morning-lark=1.0
  v_chronotype_norm := normalize_bipolar_value(v_chronotype);
  
  -- Weeknight sleep window: extract start time and normalize
  -- Format is typically timeRange: {"start": "23:00", "end": "07:00"} or similar
  IF v_weeknight IS NOT NULL AND jsonb_typeof(v_weeknight) = 'object' THEN
    -- Extract start time as string first
    v_sleep_start_str := v_weeknight->>'start';
    
    -- Parse time string (e.g., "23:00" -> 23.0)
    IF v_sleep_start_str IS NOT NULL THEN
      -- Extract hour part (before the colon)
      v_hour_part := SPLIT_PART(v_sleep_start_str, ':', 1);
      
      -- Convert to numeric hour (0-23 scale)
      BEGIN
        v_sleep_start := v_hour_part::numeric;
        
        -- Normalize sleep start time: 20:00=0.0 (early), 02:00=1.0 (late)
        -- Map 20-26 (8pm-2am) to [0,1]
        -- Handle wrap-around: 20-24 (8pm-midnight) and 0-2 (midnight-2am)
        IF v_sleep_start >= 20 THEN
          -- 20-24: map to [0, 0.67] (8pm-midnight)
          v_chronotype_norm := (v_sleep_start - 20.0) / 6.0;
        ELSIF v_sleep_start <= 2 THEN
          -- 0-2: map to [0.67, 1.0] (midnight-2am)
          v_chronotype_norm := 0.67 + (v_sleep_start / 6.0);
        ELSE
          -- 3-19: map to middle range (3am-7pm, less common for sleep start)
          -- These are unusual sleep times, map to 0.5 (neutral)
          v_chronotype_norm := 0.5;
        END IF;
        
        -- Clamp to [0,1]
        v_chronotype_norm := LEAST(1.0, GREATEST(0.0, v_chronotype_norm));
      EXCEPTION
        WHEN OTHERS THEN
          -- If parsing fails, keep the chronotype value from M2_Q1
          NULL;
      END;
    END IF;
  END IF;
  
  RETURN COALESCE(v_chronotype_norm, 0.5);
END;
$$;

