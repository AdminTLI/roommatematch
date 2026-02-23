-- Migration: Implement permanent unmatching with feedback
-- - Adds 'unmatched' status to match_status enum
-- - Creates match_feedback table for unmatch reasons
-- - Ensures match_blocklist supports ended_at for time-bounded blocks
-- - Adds unmatch_pair() helper to encapsulate transactional unmatching
-- - Updates matching functions to respect blocklist and unmatched pairs

-- 1) Extend match_status enum with 'unmatched' (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'match_status'
      AND e.enumlabel = 'unmatched'
  ) THEN
    ALTER TYPE match_status ADD VALUE 'unmatched';
  END IF;
END;
$$;

-- 2) Ensure match_blocklist has ended_at column used by RLS and block/unblock APIs
ALTER TABLE match_blocklist
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- 3) match_feedback table to capture unmatch reasons for ML/analytics
CREATE TABLE IF NOT EXISTS match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unmatcher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unmatched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason_category TEXT NOT NULL,
  reason_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient analytics
CREATE INDEX IF NOT EXISTS idx_match_feedback_unmatcher_id
  ON match_feedback (unmatcher_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_unmatched_user_id
  ON match_feedback (unmatched_user_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_created_at
  ON match_feedback (created_at);

-- Enable RLS and basic policy (unmatcher can manage their own rows)
ALTER TABLE match_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'match_feedback'
      AND policyname = 'match_feedback_own'
  ) THEN
    CREATE POLICY match_feedback_own ON match_feedback
      FOR ALL
      USING (unmatcher_id = auth.uid())
      WITH CHECK (unmatcher_id = auth.uid());
  END IF;
END;
$$;

-- 4) Helper function: unmatch_pair
-- Performs all required operations inside a single transaction:
-- - Insert feedback
-- - Mark matches as 'unmatched'
-- - Record mutual 'rejected' decisions in match_decisions
-- - Add symmetrical entries to match_blocklist (no ended_at)
-- - Remove both users from any 1:1 chats they share
CREATE OR REPLACE FUNCTION public.unmatch_pair(
  p_unmatcher_id UUID,
  p_unmatched_user_id UUID,
  p_reason_category TEXT,
  p_reason_text TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF p_unmatcher_id IS NULL OR p_unmatched_user_id IS NULL THEN
    RAISE EXCEPTION 'unmatch_pair: user IDs must not be null';
  END IF;

  IF p_unmatcher_id = p_unmatched_user_id THEN
    RAISE EXCEPTION 'unmatch_pair: cannot unmatch yourself';
  END IF;

  -- 4.1) Store feedback (allow multiple feedback rows over time)
  INSERT INTO match_feedback (unmatcher_id, unmatched_user_id, reason_category, reason_text, created_at)
  VALUES (
    p_unmatcher_id,
    p_unmatched_user_id,
    p_reason_category,
    NULLIF(BTRIM(p_reason_text), ''),
    v_now
  );

  -- 4.2) Mark any existing matches between the pair as 'unmatched'
  UPDATE matches
  SET status = 'unmatched',
      updated_at = v_now
  WHERE (
    (a_user = p_unmatcher_id AND b_user = p_unmatched_user_id) OR
    (a_user = p_unmatched_user_id AND b_user = p_unmatcher_id)
  )
  AND status <> 'unmatched';

  -- 4.3) Record mutual rejection in match_decisions so get_user_matches() excludes this pair
  INSERT INTO match_decisions (user_id, matched_user_id, decision, created_at)
  VALUES
    (p_unmatcher_id, p_unmatched_user_id, 'rejected', v_now),
    (p_unmatched_user_id, p_unmatcher_id, 'rejected', v_now)
  ON CONFLICT (user_id, matched_user_id) DO UPDATE
    SET decision = 'rejected', created_at = EXCLUDED.created_at;

  -- 4.4) Add symmetrical, permanent entries to match_blocklist (active blocks => ended_at NULL)
  INSERT INTO match_blocklist (user_id, blocked_user_id, created_at, ended_at)
  VALUES
    (p_unmatcher_id, p_unmatched_user_id, v_now, NULL),
    (p_unmatched_user_id, p_unmatcher_id, v_now, NULL)
  ON CONFLICT (user_id, blocked_user_id) DO UPDATE
    SET created_at = EXCLUDED.created_at,
        ended_at = NULL;

  -- 4.5) Remove both users from any direct 1:1 chats they share
  -- A 1:1 chat is identified as a non-group chat where these are the only two members
  DELETE FROM chat_members cm
  USING chats c
  WHERE cm.chat_id = c.id
    AND c.is_group = FALSE
    AND cm.chat_id IN (
      SELECT chat_id
      FROM chat_members
      WHERE user_id IN (p_unmatcher_id, p_unmatched_user_id)
      GROUP BY chat_id
      HAVING COUNT(DISTINCT user_id) = 2
    )
    AND cm.user_id IN (p_unmatcher_id, p_unmatched_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.unmatch_pair(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unmatch_pair(UUID, UUID, TEXT, TEXT) TO service_role;

-- 5) Update get_user_matches to also respect blocklist and 'unmatched' matches
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
  academic_details jsonb,
  -- New fields from compatibility algorithm v1.0
  harmony_score numeric,
  context_score numeric,
  dimension_scores_json jsonb,
  is_valid_match boolean,
  algorithm_version text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_users AS (
    SELECT DISTINCT p.user_id
    FROM public.profiles p
    JOIN public.user_academic ua ON p.user_id = ua.user_id
    LEFT JOIN public.programs pr ON ua.program_id = pr.id
    LEFT JOIN public.user_study_year_v usy ON p.user_id = usy.user_id
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
    cs.academic_details,
    -- New fields
    cs.harmony_score,
    cs.context_score,
    cs.dimension_scores_json,
    cs.is_valid_match,
    cs.algorithm_version
  FROM filtered_users fu
  JOIN public.profiles pr ON fu.user_id = pr.user_id
  JOIN public.user_academic ua ON fu.user_id = ua.user_id
  JOIN public.universities u ON ua.university_id = u.id
  LEFT JOIN public.programs prog ON ua.program_id = prog.id
  LEFT JOIN public.user_study_year_v usy ON fu.user_id = usy.user_id
  CROSS JOIN LATERAL public.compute_compatibility_score(p_user_id, fu.user_id) cs
  WHERE NOT EXISTS (
    SELECT 1 FROM public.match_decisions md 
    WHERE md.user_id = p_user_id AND md.matched_user_id = fu.user_id
  )
  -- Exclude any users where either side has an active block
  AND NOT EXISTS (
    SELECT 1 FROM public.match_blocklist mb
    WHERE mb.user_id = p_user_id
      AND mb.blocked_user_id = fu.user_id
      AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.match_blocklist mb
    WHERE mb.user_id = fu.user_id
      AND mb.blocked_user_id = p_user_id
      AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
  )
  -- Exclude pairs that have been explicitly marked as 'unmatched'
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE (
      (m.a_user = p_user_id AND m.b_user = fu.user_id) OR
      (m.a_user = fu.user_id AND m.b_user = p_user_id)
    )
    AND m.status = 'unmatched'
  )
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_matches(uuid, int, int, uuid[], text[], uuid[], int[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_matches(uuid, int, int, uuid[], text[], uuid[], int[]) TO service_role;

-- 6) Update find_best_matches_v2 to respect blocklist and unmatched pairs
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
    -- Fallback if no vector: compute and store, then reload
    PERFORM compute_user_vector_and_store(p_user_id);
    SELECT vector INTO v_user_vector FROM user_vectors WHERE user_id = p_user_id;
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT 
      uv.user_id,
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
      -- Exclude any users where either side has an active block
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
      -- Exclude pairs that have been explicitly marked as 'unmatched'
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
    jsonb_build_object('vector_dist', c.vector_dist, 'algo', 'hybrid_v2') as debug_info
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

