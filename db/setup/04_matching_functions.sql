-- Matching Engine Functions for Roommate Match
-- These functions implement the matching algorithm using pgvector and academic affinity

-- Function to compute user compatibility score
CREATE OR REPLACE FUNCTION compute_compatibility_score(
  user_a_id uuid,
  user_b_id uuid
) RETURNS TABLE (
  compatibility_score numeric,
  personality_score numeric,
  schedule_score numeric,
  lifestyle_score numeric,
  social_score numeric,
  academic_bonus numeric,
  penalty numeric,
  top_alignment text,
  watch_out text,
  house_rules_suggestion text,
  academic_details jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_a_vector numeric[];
  user_b_vector numeric[];
  user_a_profile record;
  user_b_profile record;
  similarity_score numeric;
  schedule_overlap numeric;
  cleanliness_align numeric;
  social_align numeric;
  academic_bonus numeric := 0;
  penalty numeric := 0;
  base_score numeric;
  final_score numeric;
  top_alignment text;
  watch_out text;
  house_rules text;
  academic_details jsonb;
BEGIN
  -- Get user vectors and profiles
  SELECT vector INTO user_a_vector FROM user_vectors WHERE user_id = user_a_id;
  SELECT vector INTO user_b_vector FROM user_vectors WHERE user_id = user_b_id;
  
  -- Get user profiles for lifestyle matching
  SELECT 
    ua.university_id,
    ua.degree_level,
    ua.program_id,
    ua.study_start_year,
    p.faculty,
    GREATEST(1, EXTRACT(YEAR FROM NOW())::int - ua.study_start_year + 1) as study_year
  INTO user_a_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  WHERE ua.user_id = user_a_id;
  
  SELECT 
    ua.university_id,
    ua.degree_level,
    ua.program_id,
    ua.study_start_year,
    p.faculty,
    GREATEST(1, EXTRACT(YEAR FROM NOW())::int - ua.study_start_year + 1) as study_year
  INTO user_b_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  WHERE ua.user_id = user_b_id;

  -- Compute cosine similarity (simplified)
  similarity_score := 0.8; -- Placeholder - would compute actual cosine similarity
  
  -- Compute schedule overlap (simplified)
  schedule_overlap := 0.7; -- Placeholder
  
  -- Compute lifestyle alignment (simplified)
  cleanliness_align := 0.6; -- Placeholder
  social_align := 0.5; -- Placeholder
  
  -- Compute academic affinity
  academic_details := '{}'::jsonb;
  
  -- Same university bonus (8%)
  IF user_a_profile.university_id = user_b_profile.university_id THEN
    academic_bonus := academic_bonus + 0.08;
    academic_details := academic_details || '{"university_affinity": true}'::jsonb;
  END IF;
  
  -- Same programme bonus (12%) - highest priority
  IF user_a_profile.program_id = user_b_profile.program_id AND user_a_profile.program_id IS NOT NULL THEN
    academic_bonus := academic_bonus + 0.12;
    academic_details := academic_details || '{"program_affinity": true}'::jsonb;
  -- Same faculty bonus (5%) - only if not same programme
  ELSIF user_a_profile.faculty = user_b_profile.faculty AND user_a_profile.faculty IS NOT NULL THEN
    academic_bonus := academic_bonus + 0.05;
    academic_details := academic_details || '{"faculty_affinity": true}'::jsonb;
  END IF;
  
  -- Study year gap penalty (2% per year beyond 2)
  IF ABS(user_a_profile.study_year - user_b_profile.study_year) > 2 THEN
    penalty := penalty + (ABS(user_a_profile.study_year - user_b_profile.study_year) - 2) * 0.02;
    academic_details := academic_details || '{"year_gap_penalty": ' || ABS(user_a_profile.study_year - user_b_profile.study_year) || '}'::jsonb;
  END IF;
  
  -- Calculate component scores
  personality_score := similarity_score;
  schedule_score := schedule_overlap;
  lifestyle_score := (cleanliness_align + social_align) / 2;
  social_score := social_align;
  
  -- Calculate final compatibility score
  base_score := (personality_score * 0.3 + schedule_score * 0.2 + lifestyle_score * 0.3 + social_score * 0.2);
  final_score := base_score + academic_bonus - penalty;
  
  -- Ensure score is between 0 and 1
  final_score := GREATEST(0, LEAST(1, final_score));
  
  -- Generate insights
  IF academic_bonus > 0.1 THEN
    top_alignment := 'Academic compatibility';
  ELSIF similarity_score > 0.8 THEN
    top_alignment := 'Personality match';
  ELSIF schedule_overlap > 0.8 THEN
    top_alignment := 'Schedule alignment';
  ELSE
    top_alignment := 'General compatibility';
  END IF;
  
  IF penalty > 0.1 THEN
    watch_out := 'Significant age gap';
  ELSIF cleanliness_align < 0.4 THEN
    watch_out := 'Different cleanliness standards';
  ELSIF social_align < 0.3 THEN
    watch_out := 'Different social preferences';
  ELSE
    watch_out := 'No major concerns';
  END IF;
  
  house_rules := 'Discuss shared spaces, quiet hours, and guest policies';
  
  RETURN QUERY SELECT 
    final_score,
    personality_score,
    schedule_score,
    lifestyle_score,
    social_score,
    academic_bonus,
    penalty,
    top_alignment,
    watch_out,
    house_rules,
    academic_details;
END;
$$;

-- Function to find potential matches for a user
CREATE OR REPLACE FUNCTION find_potential_matches(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_min_score numeric DEFAULT 0.6
) RETURNS TABLE (
  user_id uuid,
  first_name text,
  university_name text,
  program_name text,
  compatibility_score numeric,
  academic_bonus numeric,
  top_alignment text,
  watch_out text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    p.first_name,
    univ.name as university_name,
    prog.name as program_name,
    cs.compatibility_score,
    cs.academic_bonus,
    cs.top_alignment,
    cs.watch_out
  FROM users u
  JOIN profiles p ON u.id = p.user_id
  JOIN user_academic ua ON u.id = ua.user_id
  JOIN universities univ ON ua.university_id = univ.id
  LEFT JOIN programs prog ON ua.program_id = prog.id
  CROSS JOIN LATERAL compute_compatibility_score(p_user_id, u.id) cs
  WHERE u.id != p_user_id
    AND u.is_active = true
    AND p.verification_status = 'verified'
    AND cs.compatibility_score >= p_min_score
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit;
END;
$$;

-- Function to create matches for a user
CREATE OR REPLACE FUNCTION create_matches_for_user(
  p_user_id uuid,
  p_batch_size integer DEFAULT 10
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_count integer := 0;
  potential_match record;
BEGIN
  -- Find potential matches
  FOR potential_match IN 
    SELECT user_id, compatibility_score, academic_bonus, top_alignment, watch_out
    FROM find_potential_matches(p_user_id, p_batch_size, 0.6)
  LOOP
    -- Check if match already exists
    IF NOT EXISTS (
      SELECT 1 FROM matches 
      WHERE (a_user = p_user_id AND b_user = potential_match.user_id) 
         OR (a_user = potential_match.user_id AND b_user = p_user_id)
    ) THEN
      -- Insert new match
      INSERT INTO matches (a_user, b_user, score, explanation, status)
      VALUES (
        p_user_id, 
        potential_match.user_id, 
        potential_match.compatibility_score,
        json_build_object(
          'academic_bonus', potential_match.academic_bonus,
          'top_alignment', potential_match.top_alignment,
          'watch_out', potential_match.watch_out,
          'created_by', 'matching_algorithm'
        ),
        'pending'
      );
      match_count := match_count + 1;
    END IF;
  END LOOP;
  
  RETURN match_count;
END;
$$;

-- Function to update user vector from questionnaire responses
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
    CASE response_record.type
      WHEN 'slider' THEN
        normalized_value := (response_record.value::numeric) / 10.0;
      WHEN 'boolean' THEN
        normalized_value := CASE WHEN response_record.value::boolean THEN 1.0 ELSE 0.0 END;
      WHEN 'single' THEN
        -- For single choice, map to numeric value based on options
        normalized_value := 0.5; -- Default middle value
      WHEN 'multiple' THEN
        -- For multiple choice, count selections
        normalized_value := CASE 
          WHEN response_record.value::text[] IS NOT NULL 
          THEN array_length(response_record.value::text[], 1)::numeric / 5.0
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

-- Function to get match statistics for a user
CREATE OR REPLACE FUNCTION get_user_match_stats(
  p_user_id uuid
) RETURNS TABLE (
  total_matches integer,
  pending_matches integer,
  accepted_matches integer,
  rejected_matches integer,
  avg_compatibility_score numeric,
  highest_score numeric,
  lowest_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_matches,
    COUNT(*) FILTER (WHERE status = 'pending')::integer as pending_matches,
    COUNT(*) FILTER (WHERE status = 'accepted')::integer as accepted_matches,
    COUNT(*) FILTER (WHERE status = 'rejected')::integer as rejected_matches,
    AVG(score) as avg_compatibility_score,
    MAX(score) as highest_score,
    MIN(score) as lowest_score
  FROM matches
  WHERE a_user = p_user_id OR b_user = p_user_id;
END;
$$;

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION compute_compatibility_score(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION find_potential_matches(uuid, integer, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION create_matches_for_user(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_vector(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_match_stats(uuid) TO authenticated;
