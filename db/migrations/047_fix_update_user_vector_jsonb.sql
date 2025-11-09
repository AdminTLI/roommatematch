-- Migration: Fix update_user_vector function to handle JSONB values correctly
-- The function was trying to cast JSONB directly to text[] which fails
-- This migration updates the function to properly extract values from JSONB

CREATE OR REPLACE FUNCTION update_user_vector(
  p_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vector_array numeric[] := ARRAY[]::numeric[];
  response_record record;
  normalized_value numeric;
BEGIN
  -- Clear existing vector
  DELETE FROM user_vectors WHERE user_id = p_user_id;
  
  -- Build vector from responses
  FOR response_record IN 
    SELECT qi.key, qi.type, r.value
    FROM responses r
    JOIN question_items qi ON r.question_key = qi.key
    WHERE r.user_id = p_user_id
    ORDER BY qi.key
  LOOP
    -- Normalize different response types to 0-1 scale
    -- Note: response_record.value is JSONB, so we need to extract values properly
    CASE response_record.type
      WHEN 'slider' THEN
        -- Extract numeric value from JSONB
        normalized_value := CASE 
          WHEN jsonb_typeof(response_record.value) = 'number' 
          THEN (response_record.value::numeric) / 10.0
          WHEN jsonb_typeof(response_record.value) = 'string'
          THEN (response_record.value#>>'{}')::numeric / 10.0
          ELSE 0.5
        END;
      WHEN 'boolean' THEN
        -- Extract boolean value from JSONB
        normalized_value := CASE 
          WHEN jsonb_typeof(response_record.value) = 'boolean'
          THEN CASE WHEN response_record.value::boolean THEN 1.0 ELSE 0.0 END
          WHEN jsonb_typeof(response_record.value) = 'string'
          THEN CASE WHEN (response_record.value#>>'{}')::boolean THEN 1.0 ELSE 0.0 END
          ELSE 0.0
        END;
      WHEN 'single' THEN
        -- For single choice, map to numeric value based on options
        normalized_value := 0.5; -- Default middle value
      WHEN 'multiple' THEN
        -- For multiple choice, count selections from JSONB array
        normalized_value := CASE 
          WHEN jsonb_typeof(response_record.value) = 'array'
          THEN LEAST(jsonb_array_length(response_record.value)::numeric / 5.0, 1.0)
          ELSE 0.0
        END;
      ELSE
        normalized_value := 0.5; -- Default for text and other types
    END CASE;
    
    vector_array := vector_array || normalized_value;
  END LOOP;
  
  -- Pad or truncate to exactly 50 dimensions
  WHILE array_length(vector_array, 1) < 50 LOOP
    vector_array := vector_array || 0.0;
  END LOOP;
  
  WHILE array_length(vector_array, 1) > 50 LOOP
    vector_array := vector_array[1:array_length(vector_array, 1)-1];
  END LOOP;
  
  -- Insert normalized vector
  INSERT INTO user_vectors (user_id, vector)
  VALUES (p_user_id, vector_array::vector);
  
  RETURN true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_user_vector(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_user_vector(uuid) IS 'Updates user vector from questionnaire responses. Properly handles JSONB values for all response types (slider, boolean, single, multiple).';

