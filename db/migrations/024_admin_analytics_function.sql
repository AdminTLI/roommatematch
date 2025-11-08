-- Migration: Ensure get_admin_analytics RPC function exists
-- This function provides analytics data for admin dashboards

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
  v_total_users int;
  v_verified_users int;
  v_active_chats int;
  v_total_matches int;
  v_reports_pending int;
  v_university_stats jsonb;
  v_program_stats jsonb;
  v_study_year_distribution jsonb;
BEGIN
  -- Calculate total users
  SELECT COUNT(*)::int INTO v_total_users
  FROM profiles p 
  JOIN user_academic ua ON p.user_id = ua.user_id 
  WHERE p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id;
  
  -- Calculate verified users
  SELECT COUNT(*)::int INTO v_verified_users
  FROM profiles p 
  JOIN user_academic ua ON p.user_id = ua.user_id 
  WHERE p.verification_status = 'verified' 
    AND (p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id);
  
  -- Calculate active chats (last 24 hours)
  SELECT COUNT(DISTINCT chat_id)::int INTO v_active_chats
  FROM messages 
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  -- Calculate total matches (last 7 days)
  SELECT COUNT(*)::int INTO v_total_matches
  FROM match_suggestions 
  WHERE created_at > NOW() - INTERVAL '7 days';
  
  -- Calculate pending reports
  SELECT COUNT(*)::int INTO v_reports_pending
  FROM reports 
  WHERE status = 'open';
  
  -- Calculate university statistics
  SELECT jsonb_agg(
    jsonb_build_object(
      'university_name', stats.name,
      'total_users', stats.total_users,
      'verified_users', stats.verified_users
    )
  ) INTO v_university_stats
  FROM (
    SELECT 
      u.id,
      u.name,
      COUNT(DISTINCT p.user_id) as total_users,
      COUNT(DISTINCT CASE WHEN p.verification_status = 'verified' THEN p.user_id END) as verified_users
    FROM universities u
    LEFT JOIN user_academic ua ON ua.university_id = u.id
    LEFT JOIN profiles p ON p.user_id = ua.user_id
    WHERE p_admin_university_id IS NULL OR u.id = p_admin_university_id
    GROUP BY u.id, u.name
    ORDER BY COUNT(DISTINCT p.user_id) DESC
    LIMIT 10
  ) stats;
  
  -- Calculate program statistics
  SELECT jsonb_agg(
    jsonb_build_object(
      'program_name', stats.program_name,
      'university_name', stats.university_name,
      'total_users', stats.total_users
    )
  ) INTO v_program_stats
  FROM (
    SELECT 
      prog.id,
      prog.name as program_name,
      u.name as university_name,
      COUNT(*) as total_users
    FROM profiles p
    JOIN user_academic ua ON p.user_id = ua.user_id
    JOIN universities u ON ua.university_id = u.id
    LEFT JOIN programs prog ON ua.program_id = prog.id
    WHERE (p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id)
      AND prog.name IS NOT NULL
    GROUP BY prog.id, prog.name, u.name
    ORDER BY COUNT(*) DESC
    LIMIT 10
  ) stats;
  
  -- Calculate study year distribution
  SELECT jsonb_agg(
    jsonb_build_object(
      'study_year', yearly_stats.study_year,
      'count', yearly_stats.user_count
    )
  ) INTO v_study_year_distribution
  FROM (
    SELECT 
      GREATEST(1, EXTRACT(YEAR FROM NOW())::int - ua.study_start_year + 1) as study_year,
      COUNT(*) as user_count
    FROM profiles p
    JOIN user_academic ua ON p.user_id = ua.user_id
    WHERE p_admin_university_id IS NULL OR ua.university_id = p_admin_university_id
    GROUP BY GREATEST(1, EXTRACT(YEAR FROM NOW())::int - ua.study_start_year + 1)
    ORDER BY study_year
  ) yearly_stats;
  
  -- Return the results
  RETURN QUERY SELECT 
    COALESCE(v_total_users, 0),
    COALESCE(v_verified_users, 0),
    COALESCE(v_active_chats, 0),
    COALESCE(v_total_matches, 0),
    COALESCE(v_reports_pending, 0),
    COALESCE(v_university_stats, '[]'::jsonb),
    COALESCE(v_program_stats, '[]'::jsonb),
    COALESCE(v_study_year_distribution, '[]'::jsonb);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_analytics(uuid) TO authenticated;

