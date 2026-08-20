-- ─────────────────────────────────────────────────────────────────────────────
-- v2 Dimension Extractor Helpers
-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: read a single item answer from onboarding_sections (v2 sections only)
CREATE OR REPLACE FUNCTION public.get_v2_answer(
  p_user_id UUID,
  p_item_id  TEXT,
  p_section  TEXT
) RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- App stores answers as [{itemId, value}, ...]; also accept object maps.
  SELECT COALESCE(
    (
      SELECT elem->'value'
      FROM public.onboarding_sections os
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(os.answers) = 'array' THEN os.answers ELSE '[]'::jsonb END
      ) AS elem
      WHERE os.user_id = p_user_id
        AND os.section = p_section
        AND elem->>'itemId' = p_item_id
      LIMIT 1
    ),
    (
      SELECT os.answers -> p_item_id
      FROM public.onboarding_sections os
      WHERE os.user_id = p_user_id
        AND os.section = p_section
        AND jsonb_typeof(os.answers) = 'object'
      LIMIT 1
    )
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Similarity helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- Likert / bipolar 1-5: 1 - |a-b| / 4
CREATE OR REPLACE FUNCTION public.sim_likert(a JSONB, b JSONB) RETURNS NUMERIC
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN a IS NULL OR b IS NULL THEN NULL
    ELSE 1.0 - ABS( (a->>'value')::NUMERIC - (b->>'value')::NUMERIC ) / 4.0
  END;
$$;

-- MCQ ordered (normalized to 0–1 range based on ordinal position)
CREATE OR REPLACE FUNCTION public.sim_mcq_ordered(
  a JSONB, b JSONB, options_count INT
) RETURNS NUMERIC
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN a IS NULL OR b IS NULL OR options_count <= 1 THEN NULL
    ELSE 1.0 - ABS(
        (a->>'ordinal')::NUMERIC / (options_count - 1) -
        (b->>'ordinal')::NUMERIC / (options_count - 1)
      )
  END;
$$;

-- MCQ exact match (unordered categories like language preference)
CREATE OR REPLACE FUNCTION public.sim_mcq_exact(a JSONB, b JSONB) RETURNS NUMERIC
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN a IS NULL OR b IS NULL THEN NULL
    WHEN (a->>'value') = (b->>'value') THEN 1.0
    -- partial credit when one side is 'either' / open preference
    WHEN (a->>'value') IN ('docs_lang_either','lang_either','reply_any')
      OR (b->>'value') IN ('docs_lang_either','lang_either','reply_any') THEN 0.75
    ELSE 0.0
  END;
$$;

-- Toggle exact match
CREATE OR REPLACE FUNCTION public.sim_toggle(a JSONB, b JSONB) RETURNS NUMERIC
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN a IS NULL OR b IS NULL THEN NULL
    WHEN (a->>'value') = (b->>'value') THEN 1.0
    ELSE 0.0
  END;
$$;

-- TimeRange overlap ratio (HH:MM start/end)
CREATE OR REPLACE FUNCTION public.sim_time_range(a JSONB, b JSONB) RETURNS NUMERIC
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  a_start INT; a_end INT; b_start INT; b_end INT;
  overlap INT; total INT;
BEGIN
  IF a IS NULL OR b IS NULL THEN RETURN NULL; END IF;
  a_start := EXTRACT(HOUR FROM (a->>'start')::TIME)::INT * 60 + EXTRACT(MINUTE FROM (a->>'start')::TIME)::INT;
  a_end   := EXTRACT(HOUR FROM (a->>'end')::TIME)::INT   * 60 + EXTRACT(MINUTE FROM (a->>'end')::TIME)::INT;
  b_start := EXTRACT(HOUR FROM (b->>'start')::TIME)::INT * 60 + EXTRACT(MINUTE FROM (b->>'start')::TIME)::INT;
  b_end   := EXTRACT(HOUR FROM (b->>'end')::TIME)::INT   * 60 + EXTRACT(MINUTE FROM (b->>'end')::TIME)::INT;
  overlap := GREATEST(0, LEAST(a_end, b_end) - GREATEST(a_start, b_start));
  total   := GREATEST(1, GREATEST(a_end, b_end) - LEAST(a_start, b_start));
  RETURN overlap::NUMERIC / total;
END;
$$;

-- Weighted module score helper: given an array of (weight, similarity) pairs,
-- return SUM(w * s) / SUM(w) ignoring NULL similarities.
CREATE OR REPLACE FUNCTION public.weighted_module_score(
  p_items NUMERIC[][]  -- each sub-array is [weight, similarity_or_null]
) RETURNS NUMERIC
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  total_weight NUMERIC := 0;
  total_score  NUMERIC := 0;
  item NUMERIC[];
BEGIN
  FOREACH item SLICE 1 IN ARRAY p_items
  LOOP
    IF item[2] IS NOT NULL THEN
      total_weight := total_weight + item[1];
      total_score  := total_score  + item[1] * item[2];
    END IF;
  END LOOP;
  IF total_weight = 0 THEN RETURN 0.5; END IF; -- neutral fallback
  RETURN total_score / total_weight;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_environment_dimension_v2(user_a, user_b)  →  0–1 score  (M2)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_environment_dimension_v2(
  p_a UUID, p_b UUID
) RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s TEXT := 'environment-rhythms';
  a_M2Q1  JSONB; b_M2Q1  JSONB;
  a_M2Q13 JSONB; b_M2Q13 JSONB;
  a_M3Q2  JSONB; b_M3Q2  JSONB;
  a_M3Q4  JSONB; b_M3Q4  JSONB;
  a_M2Q6  JSONB; b_M2Q6  JSONB;
  a_M2Q19 JSONB; b_M2Q19 JSONB;
  a_M1Q6  JSONB; b_M1Q6  JSONB;
  a_M7Q2  JSONB; b_M7Q2  JSONB;
  a_M2Q15 JSONB; b_M2Q15 JSONB;
  a_M3Q12 JSONB; b_M3Q12 JSONB;
  a_M3Q18 JSONB; b_M3Q18 JSONB;
  a_M3Q25 JSONB; b_M3Q25 JSONB;
BEGIN
  a_M2Q1  := get_v2_answer(p_a,'M2_Q1',s);  b_M2Q1  := get_v2_answer(p_b,'M2_Q1',s);
  a_M2Q13 := get_v2_answer(p_a,'M2_Q13',s); b_M2Q13 := get_v2_answer(p_b,'M2_Q13',s);
  a_M3Q2  := get_v2_answer(p_a,'M3_Q2',s);  b_M3Q2  := get_v2_answer(p_b,'M3_Q2',s);
  a_M3Q4  := get_v2_answer(p_a,'M3_Q4',s);  b_M3Q4  := get_v2_answer(p_b,'M3_Q4',s);
  a_M2Q6  := get_v2_answer(p_a,'M2_Q6',s);  b_M2Q6  := get_v2_answer(p_b,'M2_Q6',s);
  a_M2Q19 := get_v2_answer(p_a,'M2_Q19',s); b_M2Q19 := get_v2_answer(p_b,'M2_Q19',s);
  a_M1Q6  := get_v2_answer(p_a,'M1_Q6',s);  b_M1Q6  := get_v2_answer(p_b,'M1_Q6',s);
  a_M7Q2  := get_v2_answer(p_a,'M7_Q2',s);  b_M7Q2  := get_v2_answer(p_b,'M7_Q2',s);
  a_M2Q15 := get_v2_answer(p_a,'M2_Q15',s); b_M2Q15 := get_v2_answer(p_b,'M2_Q15',s);
  a_M3Q12 := get_v2_answer(p_a,'M3_Q12',s); b_M3Q12 := get_v2_answer(p_b,'M3_Q12',s);
  a_M3Q18 := get_v2_answer(p_a,'M3_Q18',s); b_M3Q18 := get_v2_answer(p_b,'M3_Q18',s);
  a_M3Q25 := get_v2_answer(p_a,'M3_Q25',s); b_M3Q25 := get_v2_answer(p_b,'M3_Q25',s);

  RETURN weighted_module_score(ARRAY[
    ARRAY[0.16, sim_likert(a_M2Q1,  b_M2Q1)],
    ARRAY[0.16, sim_time_range(a_M2Q13, b_M2Q13)],
    ARRAY[0.12, sim_likert(a_M3Q2,  b_M3Q2)],
    ARRAY[0.10, sim_likert(a_M3Q4,  b_M3Q4)],
    ARRAY[0.10, sim_likert(a_M2Q6,  b_M2Q6)],
    ARRAY[0.09, sim_likert(a_M2Q19, b_M2Q19)],
    ARRAY[0.08, sim_likert(a_M1Q6,  b_M1Q6)],
    ARRAY[0.07, sim_likert(a_M7Q2,  b_M7Q2)],
    ARRAY[0.06, sim_mcq_exact(a_M2Q15, b_M2Q15)],
    ARRAY[0.03, sim_likert(a_M3Q12, b_M3Q12)],
    ARRAY[0.02, sim_likert(a_M3Q18, b_M3Q18)],
    ARRAY[0.01, sim_likert(a_M3Q25, b_M3Q25)]
  ]::NUMERIC[][]);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_cleanliness_dimension_v2(user_a, user_b)  →  0–1 score  (M3)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_cleanliness_dimension_v2(
  p_a UUID, p_b UUID
) RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s TEXT := 'cleanliness-operations';
  a_M4Q1  JSONB; b_M4Q1  JSONB;
  a_M4Q4  JSONB; b_M4Q4  JSONB;
  a_M4Q12 JSONB; b_M4Q12 JSONB;
  a_M4Q14 JSONB; b_M4Q14 JSONB;
  a_M4Q7  JSONB; b_M4Q7  JSONB;
  a_M4Q25 JSONB; b_M4Q25 JSONB;
  a_M4Q20 JSONB; b_M4Q20 JSONB;
  a_M8Q5  JSONB; b_M8Q5  JSONB;
  a_M4Q24 JSONB; b_M4Q24 JSONB;
  a_M8Q2  JSONB; b_M8Q2  JSONB;
  a_M7Q9  JSONB; b_M7Q9  JSONB;
  a_M8Q7  JSONB; b_M8Q7  JSONB;
BEGIN
  a_M4Q1  := get_v2_answer(p_a,'M4_Q1',s);  b_M4Q1  := get_v2_answer(p_b,'M4_Q1',s);
  a_M4Q4  := get_v2_answer(p_a,'M4_Q4',s);  b_M4Q4  := get_v2_answer(p_b,'M4_Q4',s);
  a_M4Q12 := get_v2_answer(p_a,'M4_Q12',s); b_M4Q12 := get_v2_answer(p_b,'M4_Q12',s);
  a_M4Q14 := get_v2_answer(p_a,'M4_Q14',s); b_M4Q14 := get_v2_answer(p_b,'M4_Q14',s);
  a_M4Q7  := get_v2_answer(p_a,'M4_Q7',s);  b_M4Q7  := get_v2_answer(p_b,'M4_Q7',s);
  a_M4Q25 := get_v2_answer(p_a,'M4_Q25',s); b_M4Q25 := get_v2_answer(p_b,'M4_Q25',s);
  a_M4Q20 := get_v2_answer(p_a,'M4_Q20',s); b_M4Q20 := get_v2_answer(p_b,'M4_Q20',s);
  a_M8Q5  := get_v2_answer(p_a,'M8_Q5',s);  b_M8Q5  := get_v2_answer(p_b,'M8_Q5',s);
  a_M4Q24 := get_v2_answer(p_a,'M4_Q24',s); b_M4Q24 := get_v2_answer(p_b,'M4_Q24',s);
  a_M8Q2  := get_v2_answer(p_a,'M8_Q2',s);  b_M8Q2  := get_v2_answer(p_b,'M8_Q2',s);
  a_M7Q9  := get_v2_answer(p_a,'M7_Q9',s);  b_M7Q9  := get_v2_answer(p_b,'M7_Q9',s);
  a_M8Q7  := get_v2_answer(p_a,'M8_Q7',s);  b_M8Q7  := get_v2_answer(p_b,'M8_Q7',s);

  RETURN weighted_module_score(ARRAY[
    ARRAY[0.18, sim_mcq_exact(a_M4Q1,  b_M4Q1)],
    ARRAY[0.14, sim_mcq_exact(a_M4Q4,  b_M4Q4)],
    ARRAY[0.14, sim_likert(a_M4Q12, b_M4Q12)],
    ARRAY[0.10, sim_likert(a_M4Q14, b_M4Q14)],
    ARRAY[0.08, sim_likert(a_M4Q7,  b_M4Q7)],
    ARRAY[0.08, sim_likert(a_M4Q25, b_M4Q25)],
    ARRAY[0.06, sim_likert(a_M4Q20, b_M4Q20)],
    ARRAY[0.06, sim_likert(a_M8Q5,  b_M8Q5)],
    ARRAY[0.05, sim_likert(a_M4Q24, b_M4Q24)],
    ARRAY[0.05, sim_likert(a_M8Q2,  b_M8Q2)],
    ARRAY[0.03, sim_likert(a_M7Q9,  b_M7Q9)],
    ARRAY[0.03, sim_likert(a_M8Q7,  b_M8Q7)]
  ]::NUMERIC[][]);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_communication_dimension_v2(user_a, user_b)  →  0–1 score  (M4)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_communication_dimension_v2(
  p_a UUID, p_b UUID
) RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s TEXT := 'communication-resolution';
  a_M6Q9  JSONB; b_M6Q9  JSONB;
  a_M1Q23 JSONB; b_M1Q23 JSONB;
  a_M6Q1  JSONB; b_M6Q1  JSONB;
  a_M6Q8  JSONB; b_M6Q8  JSONB;
  a_M1Q19 JSONB; b_M1Q19 JSONB;
  a_M1Q18 JSONB; b_M1Q18 JSONB;
  a_M5Q12 JSONB; b_M5Q12 JSONB;
  a_M6Q15 JSONB; b_M6Q15 JSONB;
  a_M6Q16 JSONB; b_M6Q16 JSONB;
  a_M5Q14 JSONB; b_M5Q14 JSONB;
  a_M6Q11 JSONB; b_M6Q11 JSONB;
  a_M6Q21 JSONB; b_M6Q21 JSONB;
BEGIN
  a_M6Q9  := get_v2_answer(p_a,'M6_Q9',s);  b_M6Q9  := get_v2_answer(p_b,'M6_Q9',s);
  a_M1Q23 := get_v2_answer(p_a,'M1_Q23',s); b_M1Q23 := get_v2_answer(p_b,'M1_Q23',s);
  a_M6Q1  := get_v2_answer(p_a,'M6_Q1',s);  b_M6Q1  := get_v2_answer(p_b,'M6_Q1',s);
  a_M6Q8  := get_v2_answer(p_a,'M6_Q8',s);  b_M6Q8  := get_v2_answer(p_b,'M6_Q8',s);
  a_M1Q19 := get_v2_answer(p_a,'M1_Q19',s); b_M1Q19 := get_v2_answer(p_b,'M1_Q19',s);
  a_M1Q18 := get_v2_answer(p_a,'M1_Q18',s); b_M1Q18 := get_v2_answer(p_b,'M1_Q18',s);
  a_M5Q12 := get_v2_answer(p_a,'M5_Q12',s); b_M5Q12 := get_v2_answer(p_b,'M5_Q12',s);
  a_M6Q15 := get_v2_answer(p_a,'M6_Q15',s); b_M6Q15 := get_v2_answer(p_b,'M6_Q15',s);
  a_M6Q16 := get_v2_answer(p_a,'M6_Q16',s); b_M6Q16 := get_v2_answer(p_b,'M6_Q16',s);
  a_M5Q14 := get_v2_answer(p_a,'M5_Q14',s); b_M5Q14 := get_v2_answer(p_b,'M5_Q14',s);
  a_M6Q11 := get_v2_answer(p_a,'M6_Q11',s); b_M6Q11 := get_v2_answer(p_b,'M6_Q11',s);
  a_M6Q21 := get_v2_answer(p_a,'M6_Q21',s); b_M6Q21 := get_v2_answer(p_b,'M6_Q21',s);

  RETURN weighted_module_score(ARRAY[
    ARRAY[0.16, sim_likert(a_M6Q9,  b_M6Q9)],
    ARRAY[0.14, sim_likert(a_M1Q23, b_M1Q23)],
    ARRAY[0.12, sim_likert(a_M6Q1,  b_M6Q1)],
    ARRAY[0.12, sim_likert(a_M6Q8,  b_M6Q8)],
    ARRAY[0.10, sim_likert(a_M1Q19, b_M1Q19)],
    ARRAY[0.08, sim_likert(a_M1Q18, b_M1Q18)],
    ARRAY[0.08, sim_mcq_exact(a_M5Q12, b_M5Q12)],
    ARRAY[0.06, sim_likert(a_M6Q15, b_M6Q15)],
    ARRAY[0.05, sim_mcq_exact(a_M6Q16, b_M6Q16)],
    ARRAY[0.04, sim_likert(a_M5Q14, b_M5Q14)],
    ARRAY[0.03, sim_likert(a_M6Q11, b_M6Q11)],
    ARRAY[0.02, sim_likert(a_M6Q21, b_M6Q21)]
  ]::NUMERIC[][]);
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_social_dimension_v2(user_a, user_b)  →  0–1 score  (M5)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_social_dimension_v2(
  p_a UUID, p_b UUID
) RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s TEXT := 'social-spaces';
  a_M5Q1  JSONB; b_M5Q1  JSONB;
  a_M5Q5  JSONB; b_M5Q5  JSONB;
  a_M5Q8  JSONB; b_M5Q8  JSONB;
  a_M5Q2  JSONB; b_M5Q2  JSONB;
  a_M1Q13 JSONB; b_M1Q13 JSONB;
  a_M5Q11 JSONB; b_M5Q11 JSONB;
  a_M5Q18 JSONB; b_M5Q18 JSONB;
  a_M7Q3  JSONB; b_M7Q3  JSONB;
  a_M7Q6  JSONB; b_M7Q6  JSONB;
  a_M7Q11 JSONB; b_M7Q11 JSONB;
  a_M7Q17 JSONB; b_M7Q17 JSONB;
  a_M7Q19 JSONB; b_M7Q19 JSONB;
BEGIN
  a_M5Q1  := get_v2_answer(p_a,'M5_Q1',s);  b_M5Q1  := get_v2_answer(p_b,'M5_Q1',s);
  a_M5Q5  := get_v2_answer(p_a,'M5_Q5',s);  b_M5Q5  := get_v2_answer(p_b,'M5_Q5',s);
  a_M5Q8  := get_v2_answer(p_a,'M5_Q8',s);  b_M5Q8  := get_v2_answer(p_b,'M5_Q8',s);
  a_M5Q2  := get_v2_answer(p_a,'M5_Q2',s);  b_M5Q2  := get_v2_answer(p_b,'M5_Q2',s);
  a_M1Q13 := get_v2_answer(p_a,'M1_Q13',s); b_M1Q13 := get_v2_answer(p_b,'M1_Q13',s);
  a_M5Q11 := get_v2_answer(p_a,'M5_Q11',s); b_M5Q11 := get_v2_answer(p_b,'M5_Q11',s);
  a_M5Q18 := get_v2_answer(p_a,'M5_Q18',s); b_M5Q18 := get_v2_answer(p_b,'M5_Q18',s);
  a_M7Q3  := get_v2_answer(p_a,'M7_Q3',s);  b_M7Q3  := get_v2_answer(p_b,'M7_Q3',s);
  a_M7Q6  := get_v2_answer(p_a,'M7_Q6',s);  b_M7Q6  := get_v2_answer(p_b,'M7_Q6',s);
  a_M7Q11 := get_v2_answer(p_a,'M7_Q11',s); b_M7Q11 := get_v2_answer(p_b,'M7_Q11',s);
  a_M7Q17 := get_v2_answer(p_a,'M7_Q17',s); b_M7Q17 := get_v2_answer(p_b,'M7_Q17',s);
  a_M7Q19 := get_v2_answer(p_a,'M7_Q19',s); b_M7Q19 := get_v2_answer(p_b,'M7_Q19',s);

  RETURN weighted_module_score(ARRAY[
    ARRAY[0.16, sim_mcq_exact(a_M5Q1,  b_M5Q1)],
    ARRAY[0.16, sim_likert(a_M5Q5,  b_M5Q5)],
    ARRAY[0.14, sim_likert(a_M5Q8,  b_M5Q8)],
    ARRAY[0.10, sim_mcq_exact(a_M5Q2,  b_M5Q2)],
    ARRAY[0.09, sim_likert(a_M1Q13, b_M1Q13)],
    ARRAY[0.09, sim_likert(a_M5Q11, b_M5Q11)],
    ARRAY[0.08, sim_likert(a_M5Q18, b_M5Q18)],
    ARRAY[0.06, sim_likert(a_M7Q3,  b_M7Q3)],
    ARRAY[0.04, sim_likert(a_M7Q6,  b_M7Q6)],
    ARRAY[0.03, sim_likert(a_M7Q11, b_M7Q11)],
    ARRAY[0.03, sim_likert(a_M7Q17, b_M7Q17)],
    ARRAY[0.02, sim_likert(a_M7Q19, b_M7Q19)]
  ]::NUMERIC[][]);
END;
$$;
