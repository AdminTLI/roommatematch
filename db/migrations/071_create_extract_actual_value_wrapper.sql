-- Migration: Create extract_actual_value function
-- Date: 2025-11-27
-- Description: Some functions (like normalize_bipolar_value) call extract_actual_value
--              to extract the actual value from nested JSONB structures (e.g., {"kind": "slider", "value": 50}).
--              This function extracts the 'value' field from objects, or returns the value as-is if it's already a primitive.

-- Drop the old function if it exists with wrong signature
DROP FUNCTION IF EXISTS public.extract_actual_value(jsonb);

-- Create function to extract actual value from nested JSONB structures
CREATE OR REPLACE FUNCTION public.extract_actual_value(
  p_value JSONB
) RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If it's already a primitive (number, string, boolean, null), return as-is
  IF jsonb_typeof(p_value) IN ('number', 'string', 'boolean', 'null') THEN
    RETURN p_value;
  END IF;
  
  -- If it's an object with a 'value' field, extract that
  IF jsonb_typeof(p_value) = 'object' AND p_value ? 'value' THEN
    RETURN p_value->'value';
  END IF;
  
  -- Otherwise, return the value as-is (might be an array or complex object)
  RETURN p_value;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.extract_actual_value(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.extract_actual_value(JSONB) TO service_role;

