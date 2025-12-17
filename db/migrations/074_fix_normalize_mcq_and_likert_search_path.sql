-- Migration: Fix normalize_mcq_value and normalize_likert_value to use public. prefix for extract_actual_value
-- Date: 2025-11-27
-- Description: Both functions have SET search_path = '' but call extract_actual_value
--              without the public. prefix. This migration updates them to use public.extract_actual_value.

-- Fix normalize_mcq_value
CREATE OR REPLACE FUNCTION public.normalize_mcq_value(
  p_value JSONB,
  p_options JSONB DEFAULT NULL
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actual JSONB;
  v_text TEXT;
BEGIN
  IF p_value IS NULL THEN
    RETURN 0.5; -- Neutral default
  END IF;
  
  -- Extract actual value from nested structure (use public. prefix due to search_path = '')
  v_actual := public.extract_actual_value(p_value);
  
  -- Convert to text for comparison
  v_text := v_actual::text;
  -- Clean up quotes
  v_text := TRIM(BOTH '"' FROM v_text);
  v_text := LOWER(v_text); -- Case-insensitive comparison
  
  -- Map cleanliness values: "low"=0.0, "medium"=0.5, "high"=1.0
  IF v_text = 'low' THEN RETURN 0.0;
  ELSIF v_text = 'medium' THEN RETURN 0.5;
  ELSIF v_text = 'high' THEN RETURN 1.0;
  END IF;
  
  -- Map frequency values: "0"=0.0, "1-2"=0.33, "3-4"=0.67, "5+"=1.0
  IF v_text = '0' OR v_text = '"0"' THEN RETURN 0.0;
  ELSIF v_text = '1-2' OR v_text = '"1-2"' THEN RETURN 0.33;
  ELSIF v_text = '3-4' OR v_text = '"3-4"' THEN RETURN 0.67;
  ELSIF v_text = '5+' OR v_text = '"5+"' OR v_text LIKE '5%' THEN RETURN 1.0;
  END IF;
  
  -- Handle numeric MCQ values (0-10 scale)
  IF jsonb_typeof(v_actual) = 'number' THEN
    RETURN LEAST(1.0, GREATEST(0.0, v_actual::numeric / 10.0));
  END IF;
  
  RETURN 0.5; -- Default neutral
END;
$$;

-- Fix normalize_likert_value
CREATE OR REPLACE FUNCTION public.normalize_likert_value(
  p_value JSONB
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actual JSONB;
  v_text TEXT;
BEGIN
  IF p_value IS NULL THEN
    RETURN 0.5; -- Neutral default
  END IF;
  
  -- Extract actual value from nested structure (use public. prefix due to search_path = '')
  v_actual := public.extract_actual_value(p_value);
  
  -- Handle string values (likert scale labels)
  IF jsonb_typeof(v_actual) = 'string' THEN
    v_text := v_actual::text;
    -- Remove quotes if present
    v_text := TRIM(BOTH '"' FROM v_text);
    
    CASE LOWER(v_text)
      WHEN 'strongly_disagree' THEN RETURN 0.0;
      WHEN 'disagree' THEN RETURN 0.25;
      WHEN 'neutral' THEN RETURN 0.5;
      WHEN 'agree' THEN RETURN 0.75;
      WHEN 'strongly_agree' THEN RETURN 1.0;
      ELSE NULL; -- Will fall through to numeric handling
    END CASE;
  END IF;
  
  -- Handle numeric values (1-5 scale: 1=0.0, 2=0.25, 3=0.5, 4=0.75, 5=1.0)
  IF jsonb_typeof(v_actual) = 'number' THEN
    RETURN LEAST(1.0, GREATEST(0.0, (v_actual::numeric - 1) / 4.0));
  END IF;
  
  -- Handle boolean (true=1.0, false=0.0)
  IF jsonb_typeof(v_actual) = 'boolean' THEN
    RETURN CASE WHEN v_actual::boolean THEN 1.0 ELSE 0.0 END;
  END IF;
  
  RETURN 0.5; -- Default neutral
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.normalize_mcq_value(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_mcq_value(JSONB, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.normalize_likert_value(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_likert_value(JSONB) TO service_role;










