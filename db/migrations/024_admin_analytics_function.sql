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
    
    (SELECT COUNT(DISTINCT chat_id) FROM chat_members 
     WHERE created_at > NOW() - INTERVAL '24 hours')::int,
    
    (SELECT COUNT(*) FROM match_suggestions 
     WHERE created_at > NOW() - INTERVAL '7 days')::int,
    
    (SELECT COUNT(*) FROM reports WHERE status = 'open')::int,
    
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'university_name', u.name,
          'total_users', COUNT(DISTINCT p.user_id),
          'verified_users', COUNT(DISTINCT CASE WHEN p.verification_status = 'verified' THEN p.user_id END)
        )
      )
      FROM universities u
      LEFT JOIN user_academic ua ON ua.university_id = u.id
      LEFT JOIN profiles p ON p.user_id = ua.user_id
      WHERE p_admin_university_id IS NULL OR u.id = p_admin_university_id
      GROUP BY u.id, u.name
    )::jsonb,
    
    '[]'::jsonb, -- program_stats placeholder
    '[]'::jsonb  -- study_year_distribution placeholder
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_analytics(uuid) TO authenticated;

