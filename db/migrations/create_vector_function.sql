-- Function to compute and store user vector
CREATE OR REPLACE FUNCTION compute_user_vector_and_store(p_user_id UUID)
RETURNS void AS $$
DECLARE
  computed_vector vector(50);
BEGIN
  -- Compute the vector
  computed_vector := compute_user_vector(p_user_id);
  
  -- Store or update the vector
  INSERT INTO user_vectors (user_id, vector)
  VALUES (p_user_id, computed_vector)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    vector = EXCLUDED.vector,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
