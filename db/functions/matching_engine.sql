-- Matching Engine RPC Functions
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
    usy.study_year
  INTO user_a_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  LEFT JOIN user_study_year_v usy ON ua.user_id = usy.user_id
  WHERE ua.user_id = user_a_id;
  
  SELECT 
    ua.university_id,
    ua.degree_level,
    ua.program_id,
    ua.study_start_year,
    p.faculty,
    usy.study_year
  INTO user_b_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  LEFT JOIN user_study_year_v usy ON ua.user_id = usy.user_id
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
  IF user_a_profile.study_year IS NOT NULL AND user_b_profile.study_year IS NOT NULL THEN
    DECLARE
      year_gap int := ABS(user_a_profile.study_year - user_b_profile.study_year);
    BEGIN
      academic_details := academic_details || jsonb_build_object('study_year_gap', year_gap);
      
      IF year_gap > 2 THEN
        DECLARE
          gap_penalty numeric := LEAST((year_gap - 2) * 0.02, 0.06);
        BEGIN
          academic_bonus := academic_bonus - gap_penalty;
        END;
      END IF;
    END;
  END IF;
  
  -- Apply general penalties (simplified)
  penalty := 0.1; -- Placeholder
  
  -- Calculate final score
  base_score := (0.47 * similarity_score + 0.18 * schedule_overlap + 0.09 * cleanliness_align + 0.13 * social_align) - penalty;
  final_score := GREATEST(0, LEAST(1, base_score + academic_bonus));
  
  -- Determine top alignment
  IF academic_bonus > 0.1 THEN
    top_alignment := 'academic';
  ELSIF similarity_score > schedule_overlap AND similarity_score > cleanliness_align AND similarity_score > social_align THEN
    top_alignment := 'personality';
  ELSIF schedule_overlap > cleanliness_align AND schedule_overlap > social_align THEN
    top_alignment := 'schedule';
  ELSE
    top_alignment := 'lifestyle';
  END IF;
  
  -- Determine watch out
  watch_out := 'none';
  IF penalty > 0.15 THEN
    watch_out := 'different_preferences';
  ELSIF academic_details ? 'study_year_gap' AND (academic_details->>'study_year_gap')::int > 4 THEN
    watch_out := 'academic_stage';
  ELSIF cleanliness_align < 0.3 THEN
    watch_out := 'cleanliness_differences';
  ELSIF schedule_overlap < 0.2 THEN
    watch_out := 'schedule_conflicts';
  END IF;
  
  -- Generate house rules suggestion
  house_rules := 'Regular house meetings to maintain harmony';
  
  RETURN QUERY SELECT 
    final_score,
    similarity_score,
    schedule_overlap,
    (cleanliness_align + social_align) / 2,
    social_align,
    academic_bonus,
    penalty,
    top_alignment,
    watch_out,
    house_rules,
    academic_details;
END;
$$;

-- Function to get matches for a user with filters
CREATE OR REPLACE FUNCTION get_user_matches(
  p_user_id uuid,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0,
  p_university_ids uuid[] DEFAULT NULL,
  p_degree_levels text[] DEFAULT NULL,
  p_program_ids uuid[] DEFAULT NULL,
  p_study_years int[] DEFAULT NULL
) RETURNS TABLE (
  match_user_id uuid,
  name text,
  age int,
  university_name text,
  program_name text,
  degree_level text,
  study_year int,
  budget_min numeric,
  budget_max numeric,
  compatibility_score numeric,
  personality_score numeric,
  schedule_score numeric,
  lifestyle_score numeric,
  social_score numeric,
  academic_bonus numeric,
  top_alignment text,
  watch_out text,
  house_rules_suggestion text,
  academic_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_users AS (
    SELECT DISTINCT p.user_id
    FROM profiles p
    JOIN user_academic ua ON p.user_id = ua.user_id
    LEFT JOIN programs pr ON ua.program_id = pr.id
    LEFT JOIN user_study_year_v usy ON p.user_id = usy.user_id
    WHERE p.user_id != p_user_id
      AND p.verification_status = 'verified'
      AND (p_university_ids IS NULL OR ua.university_id = ANY(p_university_ids))
      AND (p_degree_levels IS NULL OR ua.degree_level = ANY(p_degree_levels))
      AND (p_program_ids IS NULL OR ua.program_id = ANY(p_program_ids))
      AND (p_study_years IS NULL OR usy.study_year = ANY(p_study_years))
  )
  SELECT 
    fu.user_id,
    COALESCE(pr.full_name, 'Anonymous') as name,
    EXTRACT(YEAR FROM AGE(pr.date_of_birth))::int as age,
    u.common_name as university_name,
    COALESCE(prog.name, 'Undecided') as program_name,
    ua.degree_level,
    usy.study_year,
    pr.budget_min,
    pr.budget_max,
    cs.compatibility_score,
    cs.personality_score,
    cs.schedule_score,
    cs.lifestyle_score,
    cs.social_score,
    cs.academic_bonus,
    cs.top_alignment,
    cs.watch_out,
    cs.house_rules_suggestion,
    cs.academic_details
  FROM filtered_users fu
  JOIN profiles pr ON fu.user_id = pr.user_id
  JOIN user_academic ua ON fu.user_id = ua.user_id
  JOIN universities u ON ua.university_id = u.id
  LEFT JOIN programs prog ON ua.program_id = prog.id
  LEFT JOIN user_study_year_v usy ON fu.user_id = usy.user_id
  CROSS JOIN LATERAL compute_compatibility_score(p_user_id, fu.user_id) cs
  WHERE NOT EXISTS (
    SELECT 1 FROM match_decisions md 
    WHERE md.user_id = p_user_id AND md.matched_user_id = fu.user_id
  )
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get group matches
CREATE OR REPLACE FUNCTION get_group_matches(
  p_user_id uuid,
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  group_id uuid,
  member_count int,
  compatibility_score numeric,
  members jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_compatible_groups AS (
    SELECT DISTINCT g.id as group_id
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = p_user_id
      AND g.status = 'active'
  ),
  group_compatibility AS (
    SELECT 
      g.id as group_id,
      COUNT(gm.user_id) as member_count,
      AVG(
        CASE 
          WHEN gm.user_id = p_user_id THEN 0
          ELSE (SELECT compatibility_score FROM compute_compatibility_score(p_user_id, gm.user_id))
        END
      ) as avg_compatibility
    FROM user_compatible_groups ug
    JOIN groups g ON ug.group_id = g.id
    JOIN group_members gm ON g.id = gm.group_id
    GROUP BY g.id
    HAVING COUNT(gm.user_id) >= 2
  )
  SELECT 
    gc.group_id,
    gc.member_count,
    gc.avg_compatibility,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', gm.user_id,
          'name', COALESCE(pr.full_name, 'Anonymous'),
          'university', u.common_name,
          'program', COALESCE(prog.name, 'Undecided')
        )
      )
      FROM group_members gm
      JOIN profiles pr ON gm.user_id = pr.user_id
      JOIN user_academic ua ON gm.user_id = ua.user_id
      JOIN universities u ON ua.university_id = u.id
      LEFT JOIN programs prog ON ua.program_id = prog.id
      WHERE gm.group_id = gc.group_id AND gm.user_id != p_user_id
    ) as members
  FROM group_compatibility gc
  ORDER BY gc.avg_compatibility DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics(
  p_admin_university_id uuid DEFAULT NULL
) RETURNS TABLE (
  total_users int,
  verified_users int,
  active_chats int,
  total_matches int,
  reports_pending int,
  university_stats jsonb,
  program_stats jsonb,
  study_year_distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  filter_condition text;
BEGIN
  -- Build filter condition based on admin's university
  IF p_admin_university_id IS NOT NULL THEN
    filter_condition := 'WHERE ua.university_id = ''' || p_admin_university_id || '''';
  ELSE
    filter_condition := '';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles p 
     JOIN user_academic ua ON p.user_id = ua.user_id 
     WHERE p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id)::int,
    
    (SELECT COUNT(*) FROM profiles p 
     JOIN user_academic ua ON p.user_id = ua.user_id 
     WHERE p.verification_status = 'verified' 
     AND (p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id))::int,
    
    (SELECT COUNT(DISTINCT room_id) FROM chat_messages 
     WHERE created_at > NOW() - INTERVAL '24 hours')::int,
    
    (SELECT COUNT(*) FROM match_decisions 
     WHERE decision = 'accepted' 
     AND created_at > NOW() - INTERVAL '7 days')::int,
    
    (SELECT COUNT(*) FROM reports WHERE status = 'pending')::int,
    
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'university_name', u.common_name,
          'total_users', COUNT(*),
          'verified_users', COUNT(*) FILTER (WHERE p.verification_status = 'verified')
        )
      )
      FROM profiles p
      JOIN user_academic ua ON p.user_id = ua.user_id
      JOIN universities u ON ua.university_id = u.id
      WHERE p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id
      GROUP BY u.id, u.common_name
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ),
    
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'program_name', prog.name,
          'university_name', u.common_name,
          'total_users', COUNT(*)
        )
      )
      FROM profiles p
      JOIN user_academic ua ON p.user_id = ua.user_id
      JOIN universities u ON ua.university_id = u.id
      LEFT JOIN programs prog ON ua.program_id = prog.id
      WHERE (p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id)
        AND prog.name IS NOT NULL
      GROUP BY prog.id, prog.name, u.common_name
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ),
    
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'study_year', study_year,
          'count', user_count
        )
      )
      FROM (
        SELECT 
          usy.study_year,
          COUNT(*) as user_count
        FROM profiles p
        JOIN user_academic ua ON p.user_id = ua.user_id
        JOIN user_study_year_v usy ON p.user_id = usy.user_id
        WHERE p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id
        GROUP BY usy.study_year
        ORDER BY usy.study_year
      ) yearly_stats
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION compute_compatibility_score TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_matches TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_matches TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_analytics TO authenticated;
