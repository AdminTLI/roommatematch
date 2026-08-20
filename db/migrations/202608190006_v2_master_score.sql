-- compute_compatibility_score_v2(user_a, user_b)
--
-- Returns the full compatibility record for storage in match_suggestions.
--
-- Score formula:
--   final_score  = 0.75 × harmony + 0.25 × context
--   harmony      = 0.70 × weighted_avg + 0.30 × (worst + 2nd_worst) / 2
--   weighted_avg = 0.28 × cleanliness + 0.24 × environment + 0.24 × communication + 0.24 × social
--   context      = calculate_context_score_v2(a, b)
--
-- Hard-gate rule:
--   0 conflicts        → show match normally
--   1 conflict AND score ≥ 0.70 → show with warning (soft_gate_override = true)
--   1 conflict AND score < 0.70 → hard block (passed = false)
--   2+ conflicts       → hard block always

DROP TYPE IF EXISTS public.compatibility_score_v2 CASCADE;
CREATE TYPE public.compatibility_score_v2 AS (
  overall_score          NUMERIC,
  harmony_score          NUMERIC,
  context_score          NUMERIC,
  dimension_environment  NUMERIC,
  dimension_cleanliness  NUMERIC,
  dimension_communication NUMERIC,
  dimension_social       NUMERIC,
  dimension_logistics    NUMERIC,
  gate_conflicts         TEXT[],
  soft_gate_override     BOOLEAN,
  match_blocked          BOOLEAN,
  algorithm_version      TEXT
);

CREATE OR REPLACE FUNCTION public.compute_compatibility_score_v2(
  p_a UUID,
  p_b UUID
) RETURNS public.compatibility_score_v2
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result      public.compatibility_score_v2;
  gate_result public.hard_constraint_result;
  n_conflicts INT;

  d_env  NUMERIC;
  d_cln  NUMERIC;
  d_com  NUMERIC;
  d_soc  NUMERIC;

  weighted_avg NUMERIC;
  sorted_dims  NUMERIC[];
  worst1       NUMERIC;
  worst2       NUMERIC;
  harmony      NUMERIC;
  ctx          NUMERIC;
BEGIN
  -- ── Gate check ─────────────────────────────────────────────────────────────
  gate_result := public.check_hard_constraints_v2(p_a, p_b);
  n_conflicts := COALESCE(array_length(gate_result.gate_conflicts, 1), 0);

  -- ── Dimension scores ───────────────────────────────────────────────────────
  d_env := public.get_environment_dimension_v2(p_a, p_b);
  d_cln := public.get_cleanliness_dimension_v2(p_a, p_b);
  d_com := public.get_communication_dimension_v2(p_a, p_b);
  d_soc := public.get_social_dimension_v2(p_a, p_b);

  -- Weighted average of 4 harmony modules
  weighted_avg := 0.28 * d_cln + 0.24 * d_env + 0.24 * d_com + 0.24 * d_soc;

  -- Worst-two average (risk dampener)
  sorted_dims := ARRAY(SELECT unnest FROM unnest(ARRAY[d_env, d_cln, d_com, d_soc]) ORDER BY 1);
  worst1 := sorted_dims[1];
  worst2 := sorted_dims[2];

  harmony := 0.70 * weighted_avg + 0.30 * (worst1 + worst2) / 2.0;

  -- ── Context score ──────────────────────────────────────────────────────────
  ctx := public.calculate_context_score_v2(p_a, p_b);

  -- ── Final score ────────────────────────────────────────────────────────────
  result.overall_score           := 0.75 * harmony + 0.25 * ctx;
  result.harmony_score           := harmony;
  result.context_score           := ctx;
  result.dimension_environment   := d_env;
  result.dimension_cleanliness   := d_cln;
  result.dimension_communication := d_com;
  result.dimension_social        := d_soc;
  result.dimension_logistics     := ctx;  -- logistics dimension = context score for display
  result.gate_conflicts          := gate_result.gate_conflicts;
  result.algorithm_version       := 'v2';

  -- ── Gate blocking logic ────────────────────────────────────────────────────
  IF n_conflicts = 0 THEN
    result.soft_gate_override := false;
    result.match_blocked      := false;
  ELSIF n_conflicts = 1 AND result.overall_score >= 0.70 THEN
    result.soft_gate_override := true;
    result.match_blocked      := false;  -- shown WITH warning
  ELSE
    result.soft_gate_override := false;
    result.match_blocked      := true;   -- 2+ conflicts, or 1 conflict + low score
  END IF;

  RETURN result;
END;
$$;
