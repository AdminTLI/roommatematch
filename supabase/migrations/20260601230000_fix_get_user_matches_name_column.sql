-- Security/correctness fix: replace references to the non-existent profiles.full_name
-- column with the actual columns (first_name, last_name) that are defined in the schema.
--
-- Root cause: migration 20260525230000_get_user_matches_enforce_cohort.sql used
-- COALESCE(pr.full_name, 'Anonymous') but the profiles table only has first_name and
-- last_name (no full_name column). If that migration failed to apply on a database
-- where the column doesn't exist, the preceding unpatched version of get_user_matches
-- (without cohort filtering) would remain active, allowing cross-cohort PII exposure
-- where professional users see student profiles and vice-versa.
--
-- This migration idempotently re-creates get_user_matches with:
--   1. The same same-cohort user_type filter from the previous migration.
--   2. Name derived from profiles.first_name / profiles.last_name (source of truth).
--   3. All result columns preserved for backward compatibility.

CREATE OR REPLACE FUNCTION public.get_user_matches(
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
DECLARE
  v_caller_user_type text;
BEGIN
  -- Resolve the caller's cohort so we can enforce same-cohort matching.
  -- If user_type is NULL (incomplete profile) we return zero results to be safe.
  SELECT p.user_type
  INTO v_caller_user_type
  FROM public.profiles p
  WHERE p.user_id = p_user_id;

  IF v_caller_user_type IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH filtered_users AS (
    SELECT DISTINCT p.user_id
    FROM public.profiles p
    JOIN public.user_academic ua ON p.user_id = ua.user_id
    LEFT JOIN public.programs pr ON ua.program_id = pr.id
    LEFT JOIN public.user_study_year_v usy ON p.user_id = usy.user_id
    WHERE p.user_id != p_user_id
      AND p.verification_status = 'verified'
      AND p.user_type = v_caller_user_type        -- same-cohort guard
      AND (p_university_ids IS NULL OR ua.university_id = ANY(p_university_ids))
      AND (p_degree_levels IS NULL OR ua.degree_level = ANY(p_degree_levels))
      AND (p_program_ids IS NULL OR ua.program_id = ANY(p_program_ids))
      AND (p_study_years IS NULL OR usy.study_year = ANY(p_study_years))
  )
  SELECT
    fu.user_id,
    -- Use first_name / last_name directly; profiles.full_name does not exist in the schema.
    COALESCE(
      CASE
        WHEN pr.last_name IS NOT NULL AND pr.last_name <> ''
          THEN pr.first_name || ' ' || pr.last_name
        ELSE pr.first_name
      END,
      'Anonymous'
    ) AS name,
    EXTRACT(YEAR FROM AGE(pr.date_of_birth))::int AS age,
    u.common_name AS university_name,
    COALESCE(prog.name, 'Undecided') AS program_name,
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
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Preserve permission model: only service_role may call this function directly.
-- API routes call it via createAdminClient() after authenticating the session user.
REVOKE ALL ON FUNCTION public.get_user_matches(uuid, int, int, uuid[], text[], uuid[], int[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_matches(uuid, int, int, uuid[], text[], uuid[], int[]) TO service_role;
