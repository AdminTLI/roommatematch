-- check_hard_constraints_v2(user_a, user_b)
-- Returns (passed BOOLEAN, gate_conflicts TEXT[])
-- Gate IDs checked: M5_Q17 (smoking), M8_Q14 (pets), M8_Q19 (BRP), M8_Q11 (Airbnb)

CREATE TYPE public.hard_constraint_result AS (
  passed         BOOLEAN,
  gate_conflicts TEXT[]
);

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
  -- Conflict: one side requires strict non-smoking, the other smokes indoors
  a_smoke := (get_v2_answer(p_a, 'M5_Q17', s_lc) ->> 'value');
  b_smoke := (get_v2_answer(p_b, 'M5_Q17', s_lc) ->> 'value');
  IF (a_smoke = 'true' AND b_smoke = 'false')
  OR (a_smoke = 'false' AND b_smoke = 'true') THEN
    conflicts := conflicts || 'M5_Q17';
  END IF;

  -- ── M8_Q14: Pet gate ──────────────────────────────────────────────────────
  -- Conflict: one side is bringing a pet, the other cannot live with pets
  a_pet := (get_v2_answer(p_a, 'M8_Q14', s_lc) ->> 'value');
  b_pet := (get_v2_answer(p_b, 'M8_Q14', s_lc) ->> 'value');
  IF (a_pet = 'pet_bringing' AND b_pet = 'pet_cannot')
  OR (a_pet = 'pet_cannot'   AND b_pet = 'pet_bringing') THEN
    conflicts := conflicts || 'M8_Q14';
  END IF;

  -- ── M8_Q19: BRP gate ──────────────────────────────────────────────────────
  -- Both users answer whether they require BRP (true = requires it).
  -- Conflict: both require it — they would compete, OR one requires it but it
  -- is marked as unavailable by the other.  Here: flagged when both require =
  -- potential competition (platform-level flag, operator can decide).
  -- More conservative: conflict only if one requires AND the other explicitly
  -- marked "not available" (toggle = false means "do not need / not available").
  a_brp := ((get_v2_answer(p_a, 'M8_Q19', s_lc)) ->> 'value')::BOOLEAN;
  b_brp := ((get_v2_answer(p_b, 'M8_Q19', s_lc)) ->> 'value')::BOOLEAN;
  -- No conflict on BRP (both just indicate their own need). Gate is reserved
  -- for the platform to flag if the listing cannot support BRP registration.
  -- Skip pairwise BRP conflict — this gate is checked at listing level.

  -- ── M8_Q11: No Airbnb gate ────────────────────────────────────────────────
  -- Conflict: one requires no subletting/Airbnb, the other is okay with it.
  a_airbnb := ((get_v2_answer(p_a, 'M8_Q11', s_lc)) ->> 'value')::BOOLEAN;
  b_airbnb := ((get_v2_answer(p_b, 'M8_Q11', s_lc)) ->> 'value')::BOOLEAN;
  IF a_airbnb != b_airbnb THEN
    conflicts := conflicts || 'M8_Q11';
  END IF;

  result.gate_conflicts := conflicts;
  result.passed         := (array_length(conflicts, 1) IS NULL OR array_length(conflicts, 1) = 0);
  RETURN result;
END;
$$;
