-- Migration: Strict user_type segregation for dual marketplace (Phase 3)
-- Date: 2026-03-01
-- Description:
--   - get_deduplicated_suggestions: Return empty if requesting user has NULL user_type;
--     only return suggestions where the other user has the same user_type (student/professional).
--   - find_best_matches_v2: Return empty if requesting user has NULL user_type;
--     exclude candidates with NULL user_type and enforce candidate.user_type = requesting user_type.
--   - Ensures verified students are never matched with young professionals and vice versa.

-- ============================================
-- 1. get_deduplicated_suggestions: user_type segregation + null guard
-- ============================================

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
DECLARE
  v_requesting_user_type TEXT;
BEGIN
  -- Null check: requesting user must have a valid user_type (complete onboarding)
  SELECT pr.user_type INTO v_requesting_user_type
  FROM profiles pr
  WHERE pr.user_id = p_user_id;

  IF v_requesting_user_type IS NULL THEN
    RETURN;  -- Return 0 rows; do not expose any suggestions
  END IF;

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
      CASE 
        WHEN ms.member_ids[1] = p_user_id THEN ms.member_ids[2]
        ELSE ms.member_ids[1]
      END AS other_user_id,
      ROW_NUMBER() OVER (
        PARTITION BY 
          CASE 
            WHEN ms.member_ids[1] = p_user_id THEN ms.member_ids[2]
            ELSE ms.member_ids[1]
          END
        ORDER BY 
          CASE WHEN ms.status = 'confirmed' THEN 0 ELSE 1 END,
          ms.created_at DESC
      ) AS rn
    FROM match_suggestions ms
    INNER JOIN profiles p_other ON (
      p_other.user_id = (CASE WHEN ms.member_ids[1] = p_user_id THEN ms.member_ids[2] ELSE ms.member_ids[1] END)
      AND p_other.user_type = v_requesting_user_type
      AND p_other.user_type IS NOT NULL
    )
    WHERE p_user_id = ANY(ms.member_ids)
      AND (
        p_include_expired
        OR (
          ms.status = 'confirmed'
          OR (
            ms.status = 'accepted'
            AND ms.accepted_by IS NOT NULL 
            AND array_length(ms.accepted_by, 1) = array_length(ms.member_ids, 1)
            AND array_length(ms.member_ids, 1) >= 2
          )
          OR (
            ms.status != 'declined'
            AND ms.status != 'expired'
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
  WHERE rs.rn = 1
  ORDER BY rs.fit_index DESC, rs.created_at DESC
  LIMIT CASE WHEN p_limit IS NULL THEN NULL ELSE p_limit END
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_deduplicated_suggestions(UUID, BOOLEAN, INTEGER, INTEGER) TO authenticated;

COMMENT ON FUNCTION get_deduplicated_suggestions IS 'Returns deduplicated match suggestions for a user. Enforces strict user_type segregation: returns empty if requesting user has NULL user_type; only returns suggestions where the other user has the same user_type (student or professional).';

-- ============================================
-- 2. find_best_matches_v2: user_type segregation + null guard
-- ============================================

CREATE OR REPLACE FUNCTION find_best_matches_v2(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_candidates_limit INTEGER DEFAULT 200,
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
SET search_path = public
AS $$
DECLARE
  v_user_vector vector(50);
  v_requesting_user_type TEXT;
BEGIN
  -- Null check: requesting user must have a valid user_type
  SELECT pr.user_type INTO v_requesting_user_type
  FROM profiles pr
  WHERE pr.user_id = p_user_id;

  IF v_requesting_user_type IS NULL THEN
    RETURN;  -- Return 0 rows
  END IF;

  SELECT vector INTO v_user_vector FROM user_vectors WHERE user_id = p_user_id;

  IF v_user_vector IS NULL THEN
    PERFORM compute_user_vector_and_store(p_user_id);
    SELECT vector INTO v_user_vector FROM user_vectors WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT 
      uv.user_id,
      (uv.vector <=> v_user_vector) AS vector_dist
    FROM user_vectors uv
    INNER JOIN profiles p_cand ON p_cand.user_id = uv.user_id
      AND p_cand.user_type = v_requesting_user_type
      AND p_cand.user_type IS NOT NULL
    WHERE uv.user_id != p_user_id
      AND EXISTS (
        SELECT 1 FROM users u 
        JOIN profiles p ON u.id = p.user_id 
        WHERE u.id = uv.user_id 
          AND u.is_active = true 
          AND p.verification_status = 'verified'
      )
      AND NOT EXISTS (
        SELECT 1 FROM match_blocklist mb
        WHERE mb.user_id = p_user_id
          AND mb.blocked_user_id = uv.user_id
          AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
      )
      AND NOT EXISTS (
        SELECT 1 FROM match_blocklist mb
        WHERE mb.user_id = uv.user_id
          AND mb.blocked_user_id = p_user_id
          AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
      )
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE (
          (m.a_user = p_user_id AND m.b_user = uv.user_id) OR
          (m.a_user = uv.user_id AND m.b_user = p_user_id)
        )
        AND m.status = 'unmatched'
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
    jsonb_build_object('vector_dist', c.vector_dist, 'algo', 'hybrid_v2') AS debug_info
  FROM candidates c
  JOIN profiles p ON c.user_id = p.user_id
  JOIN user_academic ua ON c.user_id = ua.user_id
  JOIN universities univ ON ua.university_id = univ.id
  LEFT JOIN programs prog ON ua.program_id = prog.id
  CROSS JOIN LATERAL compute_compatibility_score(p_user_id, c.user_id) cs
  WHERE cs.is_valid_match = true
    AND cs.compatibility_score >= p_min_score
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION find_best_matches_v2(UUID, INTEGER, INTEGER, NUMERIC) TO authenticated;

COMMENT ON FUNCTION find_best_matches_v2 IS 'Returns best matches for a user using vector + compatibility. Enforces strict user_type segregation: returns empty if requesting user has NULL user_type; only includes candidates with the same user_type (student or professional).';
