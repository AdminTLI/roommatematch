-- Optimization Migration: Vector Search & Fixes
-- 1. Fix vector generation to fit within vector(50) by compacting indices
-- 2. Recompute vectors for all users
-- 3. Add hybrid search function (Vector + Logic)

-- ==========================================
-- 1. Fix compute_user_vector_v2 (Compact Indices)
-- ==========================================

CREATE OR REPLACE FUNCTION compute_user_vector_v2(p_user_id UUID)
RETURNS vector AS $$
DECLARE
  -- Create a 50-dim vector initialized to 0. Length constrained to 50 for the column.
  result_vector vector(50) := array_fill(0.0, ARRAY[50])::vector;
  question_record RECORD;
  vector_index INTEGER;
  normalized_value DECIMAL;
BEGIN
  -- Map questionnaire responses to normalized vector positions
  -- COMPACT MAPPING SCHEME:
  -- 0-9: Lifestyle
  -- 10-12: Social
  -- 13-17: Big Five (Personality)
  -- 18-19: Communication
  -- 20-23: Deal Breakers
  
  FOR question_record IN 
    SELECT r.question_key, r.value
    FROM responses r
    WHERE r.user_id = p_user_id
  LOOP
    vector_index := -1;

    CASE question_record.question_key
      -- Lifestyle dimensions (0-9)
      WHEN 'sleep_start' THEN
        vector_index := 0;
        normalized_value := (question_record.value::DECIMAL - 20) / 12.0;
      WHEN 'sleep_end' THEN
        vector_index := 1;
        normalized_value := (question_record.value::DECIMAL - 5) / 12.0;
      WHEN 'study_intensity' THEN
        vector_index := 2;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'cleanliness_room' THEN
        vector_index := 3;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'cleanliness_kitchen' THEN
        vector_index := 4;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'noise_tolerance' THEN
        vector_index := 5;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'guests_frequency' THEN
        vector_index := 6;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'parties_frequency' THEN
        vector_index := 7;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'chores_preference' THEN
        vector_index := 8;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'alcohol_at_home' THEN
        vector_index := 9;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Social dimensions (10-12)
      WHEN 'social_level' THEN
        vector_index := 10;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'food_sharing' THEN
        vector_index := 11;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'utensils_sharing' THEN
        vector_index := 12;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Personality dimensions - Big Five (13-17)
      WHEN 'extraversion' THEN
        vector_index := 13;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'agreeableness' THEN
        vector_index := 14;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'conscientiousness' THEN
        vector_index := 15;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'neuroticism' THEN
        vector_index := 16;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'openness' THEN
        vector_index := 17;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Communication style (18-19)
      WHEN 'conflict_style' THEN
        vector_index := 18;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'communication_preference' THEN
        vector_index := 19;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Deal breakers (20-23)
      WHEN 'smoking' THEN
        vector_index := 20;
        normalized_value := CASE WHEN question_record.value::BOOLEAN THEN 1.0 ELSE 0.0 END;
      WHEN 'pets_allowed' THEN
        vector_index := 21;
        normalized_value := CASE WHEN question_record.value::BOOLEAN THEN 1.0 ELSE 0.0 END;
      WHEN 'parties_max' THEN
        vector_index := 22;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'guests_max' THEN
        vector_index := 23;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      ELSE
        -- Skip unknown
        vector_index := -1;
    END CASE;
    
    -- Assign if valid index
    IF vector_index >= 0 AND vector_index < 50 THEN
      result_vector[vector_index + 1] := normalized_value; -- 1-based indexing for arrays
    END IF;
  END LOOP;
  
  RETURN result_vector;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 2. Update compute_user_vector_and_store to use v2
-- ============================================
CREATE OR REPLACE FUNCTION compute_user_vector_and_store(p_user_id UUID)
RETURNS void AS $$
DECLARE
  computed_vector vector(50);
BEGIN
  computed_vector := compute_user_vector_v2(p_user_id);
  
  INSERT INTO user_vectors (user_id, vector)
  VALUES (p_user_id, computed_vector)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    vector = EXCLUDED.vector,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 3. Hybrid Search Function (Vector + Filters)
-- This replaces the O(N) scan with approximate KNN + Verification
-- ============================================

CREATE OR REPLACE FUNCTION find_best_matches_v2(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_candidates_limit INTEGER DEFAULT 200, -- Fetch more candidates for filtering
  p_min_score NUMERIC DEFAULT 0.6
) RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  university_name TEXT,
  program_name TEXT,
  compatibility_score NUMERIC,
  academic_bonus NUMERIC,
  top_alignment TEXT,
  watch_out TEXT,
  debug_info JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_vector vector(50);
BEGIN
  -- Get active user's vector
  SELECT vector INTO v_user_vector FROM user_vectors WHERE user_id = p_user_id;

  IF v_user_vector IS NULL THEN
    -- Fallback if no vector: use basic query (not optimized, but safe)
    -- Or verify generate vector on fly
    PERFORM compute_user_vector_and_store(p_user_id);
    SELECT vector INTO v_user_vector FROM user_vectors WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT 
      uv.user_id,
      -- Use Euclidean distance as proxy for dissimilarity (lower is better)
      -- or Cosine Distance (<=>)
      (uv.vector <=> v_user_vector) as vector_dist
    FROM user_vectors uv
    WHERE uv.user_id != p_user_id
    -- Only active, verified users
    AND EXISTS (
      SELECT 1 FROM users u 
      JOIN profiles p ON u.id = p.user_id 
      WHERE u.id = uv.user_id 
      AND u.is_active = true 
      AND p.verification_status = 'verified'
    )
    ORDER BY uv.vector <=> v_user_vector ASC
    LIMIT p_candidates_limit
  )
  SELECT 
    c.user_id,
    p.first_name,
    univ.name AS university_name,
    prog.name AS program_name,
    cs.compatibility_score,
    cs.academic_bonus,
    cs.top_alignment,
    cs.watch_out,
    jsonb_build_object('vector_dist', c.vector_dist, 'algo', 'hybrid_v2') as debug_info
  FROM candidates c
  JOIN profiles p ON c.user_id = p.user_id
  JOIN user_academic ua ON c.user_id = ua.user_id
  JOIN universities univ ON ua.university_id = univ.id
  LEFT JOIN programs prog ON ua.program_id = prog.id
  -- Run the precise logic score on the candidates
  CROSS JOIN LATERAL compute_compatibility_score(p_user_id, c.user_id) cs
  WHERE cs.is_valid_match = true
    AND cs.compatibility_score >= p_min_score
  -- Re-rank by precise score
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit;
END;
$$;
