-- M5_Q3 daytime guests: new options (0-2 | 3-5 | 6-10 | 10+)
-- Add mappings for new option values in normalize_mcq_value; keep old mappings for backward compatibility.

DROP FUNCTION IF EXISTS public.normalize_mcq_value(JSONB, JSONB);
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
  v_text TEXT;
  v_actual JSONB;
BEGIN
  IF p_value IS NULL THEN
    RETURN 0.5; -- Neutral default
  END IF;

  v_actual := public.extract_actual_value(p_value);
  v_text := v_actual::text;
  v_text := TRIM(BOTH '"' FROM v_text);
  v_text := LOWER(v_text);

  -- Map cleanliness values: "low"=0.0, "medium"=0.5, "high"=1.0
  IF v_text = 'low' THEN RETURN 0.0;
  ELSIF v_text = 'medium' THEN RETURN 0.5;
  ELSIF v_text = 'high' THEN RETURN 1.0;
  END IF;

  -- Legacy frequency (M5_Q3/M5_Q4 old): "0"=0.0, "1-2"=0.33, "3-4"=0.67, "5+"=1.0
  IF v_text = '0' OR v_text = '"0"' THEN RETURN 0.0;
  ELSIF v_text = '1-2' OR v_text = '"1-2"' THEN RETURN 0.33;
  ELSIF v_text = '3-4' OR v_text = '"3-4"' THEN RETURN 0.67;
  ELSIF v_text = '10+' OR v_text = '"10+"' THEN RETURN 1.0;  -- M5_Q3 new highest (before 5+)
  ELSIF v_text = '5+' OR v_text = '"5+"' OR v_text LIKE '5%' THEN RETURN 1.0;
  END IF;

  -- M5_Q3 new options: "0-2"=0.0, "3-5"=0.33, "6-10"=0.67, "10+"=1.0
  IF v_text = '0-2' OR v_text = '"0-2"' THEN RETURN 0.0;
  ELSIF v_text = '3-5' OR v_text = '"3-5"' THEN RETURN 0.33;
  ELSIF v_text = '6-10' OR v_text = '"6-10"' THEN RETURN 0.67;
  END IF;

  -- Handle numeric MCQ values (0-10 scale)
  IF jsonb_typeof(v_actual) = 'number' THEN
    RETURN LEAST(1.0, GREATEST(0.0, v_actual::numeric / 10.0));
  END IF;

  RETURN 0.5; -- Default neutral
END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_mcq_value(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_mcq_value(JSONB, JSONB) TO service_role;
