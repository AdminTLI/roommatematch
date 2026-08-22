-- Fix check_hard_constraints_v2: append gate IDs with array_append, not scalar ||.
-- `conflicts || 'M8_Q11'` fails with: malformed array literal (22P02).

CREATE OR REPLACE FUNCTION public.check_hard_constraints_v2(
  p_a UUID,
  p_b UUID
) RETURNS public.hard_constraint_result
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflicts TEXT[] := '{}';
  s_lc TEXT := 'logistics-context';
  a_smoke TEXT; b_smoke TEXT;
  a_pet   TEXT; b_pet   TEXT;
  a_brp   BOOLEAN; b_brp   BOOLEAN;
  a_airbnb BOOLEAN; b_airbnb BOOLEAN;
  result public.hard_constraint_result;
BEGIN
  -- ── M5_Q17: Smoking gate ──────────────────────────────────────────────────
  a_smoke := (public.get_v2_answer(p_a, 'M5_Q17', s_lc) ->> 'value');
  b_smoke := (public.get_v2_answer(p_b, 'M5_Q17', s_lc) ->> 'value');
  IF (a_smoke = 'true' AND b_smoke = 'false')
  OR (a_smoke = 'false' AND b_smoke = 'true') THEN
    conflicts := array_append(conflicts, 'M5_Q17');
  END IF;

  -- ── M8_Q14: Pet gate ──────────────────────────────────────────────────────
  a_pet := (public.get_v2_answer(p_a, 'M8_Q14', s_lc) ->> 'value');
  b_pet := (public.get_v2_answer(p_b, 'M8_Q14', s_lc) ->> 'value');
  IF (a_pet = 'pet_bringing' AND b_pet = 'pet_cannot')
  OR (a_pet = 'pet_cannot'   AND b_pet = 'pet_bringing') THEN
    conflicts := array_append(conflicts, 'M8_Q14');
  END IF;

  -- ── M8_Q19: BRP gate (listing-level; no pairwise conflict) ────────────────
  a_brp := ((public.get_v2_answer(p_a, 'M8_Q19', s_lc)) ->> 'value')::BOOLEAN;
  b_brp := ((public.get_v2_answer(p_b, 'M8_Q19', s_lc)) ->> 'value')::BOOLEAN;

  -- ── M8_Q11: No Airbnb gate ────────────────────────────────────────────────
  a_airbnb := ((public.get_v2_answer(p_a, 'M8_Q11', s_lc)) ->> 'value')::BOOLEAN;
  b_airbnb := ((public.get_v2_answer(p_b, 'M8_Q11', s_lc)) ->> 'value')::BOOLEAN;
  IF a_airbnb IS NOT NULL AND b_airbnb IS NOT NULL AND a_airbnb IS DISTINCT FROM b_airbnb THEN
    conflicts := array_append(conflicts, 'M8_Q11');
  END IF;

  result.gate_conflicts := conflicts;
  result.passed         := (array_length(conflicts, 1) IS NULL OR array_length(conflicts, 1) = 0);
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.check_hard_constraints_v2(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_hard_constraints_v2(uuid, uuid) TO service_role;
