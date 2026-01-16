-- Migration: Add server-side deduplication function for match suggestions
-- This function uses window functions to efficiently deduplicate suggestions
-- by keeping only the latest suggestion per other user ID

CREATE OR REPLACE FUNCTION get_deduplicated_suggestions(
  p_user_id UUID,
  p_include_expired BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT NULL,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  run_id TEXT,
  kind TEXT,
  member_ids UUID[],
  fit_index INTEGER,
  section_scores JSONB,
  reasons TEXT[],
  personalized_explanation TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  accepted_by UUID[],
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_suggestions AS (
    SELECT 
      ms.id,
      ms.run_id,
      ms.kind,
      ms.member_ids,
      ms.fit_index,
      ms.section_scores,
      ms.reasons,
      ms.personalized_explanation,
      ms.expires_at,
      ms.status,
      ms.accepted_by,
      ms.created_at,
      -- Extract the other user ID (the one that's not p_user_id)
      CASE 
        WHEN ms.member_ids[1] = p_user_id THEN ms.member_ids[2]
        ELSE ms.member_ids[1]
      END AS other_user_id,
      -- Use ROW_NUMBER to rank suggestions by created_at DESC (latest first)
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN ms.member_ids[1] = p_user_id THEN ms.member_ids[2]
            ELSE ms.member_ids[1]
          END
        ORDER BY ms.created_at DESC
      ) AS rn
    FROM match_suggestions ms
    WHERE p_user_id = ANY(ms.member_ids)
      AND (
        -- When includeExpired is true, include everything (declined, confirmed, all statuses)
        p_include_expired 
        -- When includeExpired is false, include:
        -- - Confirmed matches (status = 'confirmed')
        -- - Pending matches (status = 'pending')
        -- - Accepted matches where not all members have accepted yet
        -- Exclude: declined matches and accepted matches where all members have accepted (but status not yet 'confirmed')
        OR (
          ms.status = 'confirmed'  -- Always include confirmed matches
          OR (
            ms.status != 'declined' 
            AND ms.status != 'confirmed'
            AND NOT (
              ms.status = 'accepted' 
              AND ms.accepted_by IS NOT NULL 
              AND array_length(ms.accepted_by, 1) = array_length(ms.member_ids, 1)
            )
          )
        )
      )
  )
  SELECT 
    rs.id,
    rs.run_id,
    rs.kind,
    rs.member_ids,
    rs.fit_index,
    rs.section_scores,
    rs.reasons,
    rs.personalized_explanation,
    rs.expires_at,
    rs.status,
    rs.accepted_by,
    rs.created_at
  FROM ranked_suggestions rs
  WHERE rs.rn = 1  -- Only keep the latest suggestion per other user
  ORDER BY rs.fit_index DESC, rs.created_at DESC
  LIMIT CASE WHEN p_limit IS NULL THEN NULL ELSE p_limit END
  OFFSET p_offset;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_deduplicated_suggestions(UUID, BOOLEAN, INTEGER, INTEGER) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_deduplicated_suggestions IS 'Returns deduplicated match suggestions for a user, keeping only the latest suggestion per other user ID. Uses window functions for efficient server-side deduplication.';

