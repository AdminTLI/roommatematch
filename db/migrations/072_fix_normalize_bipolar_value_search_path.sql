-- Migration: Fix normalize_bipolar_value to use public. prefix for extract_actual_value
-- Date: 2025-11-27
-- Description: normalize_bipolar_value has SET search_path = '' but calls extract_actual_value
--              without the public. prefix. This migration updates it to use public.extract_actual_value.

CREATE OR REPLACE FUNCTION public.normalize_bipolar_value(
  p_value JSONB
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actual JSONB;
BEGIN
  IF p_value IS NULL THEN
    RETURN 0.5; -- Neutral default
  END IF;
  
  -- Extract actual value from nested structure (use public. prefix due to search_path = '')
  v_actual := public.extract_actual_value(p_value);
  
  -- Bipolar values are typically numeric 0-100 or 0-5 scale
  IF jsonb_typeof(v_actual) = 'number' THEN
    -- Check if it's 0-100 scale or 0-5 scale
    IF v_actual::numeric <= 100 THEN
      -- Assume 0-100 scale, normalize to [0,1]
      RETURN LEAST(1.0, GREATEST(0.0, v_actual::numeric / 100.0));
    ELSE
      -- Assume 0-5 scale, normalize to [0,1]
      RETURN LEAST(1.0, GREATEST(0.0, v_actual::numeric / 5.0));
    END IF;
  END IF;
  
  -- Handle string representation of numbers
  IF jsonb_typeof(v_actual) = 'string' THEN
    BEGIN
      RETURN LEAST(1.0, GREATEST(0.0, (v_actual::text)::numeric / 100.0));
    EXCEPTION
      WHEN OTHERS THEN
        RETURN 0.5;
    END;
  END IF;
  
  RETURN 0.5; -- Default neutral
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.normalize_bipolar_value(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_bipolar_value(JSONB) TO service_role;










