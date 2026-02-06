-- Migration: Fix compute_compatibility_scores_batch to use schema-qualified inner function
-- Date: 2026-02-06
-- Description: Ensures compute_compatibility_scores_batch calls public.compute_compatibility_score
--              correctly when running with an empty search_path, preventing runtime errors
--              in the dashboard when computing batch compatibility scores.

CREATE OR REPLACE FUNCTION compute_compatibility_scores_batch(
  user_a_id uuid,
  user_b_ids uuid[]
) RETURNS TABLE (
  user_b_id uuid,
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
  user_b_id_item uuid;
  score_result record;
BEGIN
  -- Loop through each user_b_id and compute compatibility score
  FOREACH user_b_id_item IN ARRAY user_b_ids
  LOOP
    -- Call the existing compute_compatibility_score function for each pair
    -- This leverages the existing optimized function in the public schema
    -- Use a subquery to get all columns directly
    RETURN QUERY
    SELECT
      user_b_id_item as user_b_id,
      cs.compatibility_score,
      cs.personality_score,
      cs.schedule_score,
      cs.lifestyle_score,
      cs.social_score,
      cs.academic_bonus,
      cs.penalty,
      cs.top_alignment,
      cs.watch_out,
      cs.house_rules_suggestion,
      cs.academic_details,
      cs.harmony_score,
      cs.context_score,
      cs.dimension_scores_json,
      cs.is_valid_match,
      cs.algorithm_version
    FROM public.compute_compatibility_score(user_a_id, user_b_id_item) cs;
  END LOOP;
  
  RETURN;
END;
$$;

-- Grant execute permissions (idempotent)
GRANT EXECUTE ON FUNCTION compute_compatibility_scores_batch(uuid, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_compatibility_scores_batch(uuid, uuid[]) TO service_role;

-- Comment for documentation
COMMENT ON FUNCTION compute_compatibility_scores_batch IS 
  'Computes compatibility scores for multiple user pairs in a single call using public.compute_compatibility_score. Returns results with user_b_id included for easy mapping.';

