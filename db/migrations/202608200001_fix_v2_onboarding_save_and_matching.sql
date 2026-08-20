-- Fix questionnaire save failure + v2 matching answer reads
--
-- 1) Broken function search_path from migration 202603251200 used
--    SET search_path = 'pg_catalog, public, extensions' (%L quoted the whole list
--    as a single schema name). Unqualified "profiles" then fails with:
--    relation "profiles" does not exist — seen on responses upsert via
--    enforce_questionnaire_cooldown.
-- 2) get_v2_answer / answer-distribution assumed object-shaped answers, but the
--    app stores answers as [{itemId, value}, ...].
-- 3) calculate_context_score_v2 read non-existent profiles columns
--    (institution/programme/study_year/city) and matched on profiles.id instead
--    of profiles.user_id.

-- ─────────────────────────────────────────────────────────────────────────────
-- A) Repair search_path on all functions that got the quoted list
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proconfig IS NOT NULL
      AND array_to_string(p.proconfig, ',') LIKE '%pg_catalog, public, extensions%'
  LOOP
    EXECUTE format(
      'ALTER FUNCTION public.%I(%s) SET search_path TO pg_catalog, public, extensions',
      r.proname,
      r.args
    );
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- B) Cooldown trigger: fully-qualify relations + safe search_path
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_questionnaire_cooldown()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO public, pg_catalog
AS $$
DECLARE
  jwt_role TEXT;
  user_id_check UUID;
  is_service_role BOOLEAN := false;
  last_changed TIMESTAMPTZ;
BEGIN
  IF TG_TABLE_NAME = 'profiles' THEN
    IF (
      OLD.degree_level IS DISTINCT FROM NEW.degree_level OR
      OLD.program IS DISTINCT FROM NEW.program OR
      OLD.campus IS DISTINCT FROM NEW.campus OR
      OLD.languages IS DISTINCT FROM NEW.languages
    ) THEN
      BEGIN
        jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
        IF jwt_role = 'service_role' THEN
          is_service_role := true;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        BEGIN
          user_id_check := auth.uid();
          IF user_id_check IS NULL THEN
            is_service_role := true;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          is_service_role := false;
        END;
      END;

      IF is_service_role THEN
        NEW.last_answers_changed_at = NOW();
      ELSIF OLD.last_answers_changed_at IS NOT NULL AND
         (NOW() - OLD.last_answers_changed_at) < INTERVAL '30 days' THEN
        RAISE EXCEPTION 'Questionnaire answers cannot be changed within 30 days. Last changed: %', OLD.last_answers_changed_at;
      ELSE
        NEW.last_answers_changed_at = NOW();
      END IF;
    END IF;

  ELSIF TG_TABLE_NAME = 'responses' THEN
    IF OLD.value IS DISTINCT FROM NEW.value THEN
      is_service_role := false;

      BEGIN
        jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
        IF jwt_role = 'service_role' THEN
          is_service_role := true;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        BEGIN
          user_id_check := auth.uid();
          IF user_id_check IS NULL THEN
            is_service_role := true;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          is_service_role := false;
        END;
      END;

      IF is_service_role THEN
        UPDATE public.profiles
        SET last_answers_changed_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSE
        SELECT last_answers_changed_at INTO last_changed
        FROM public.profiles
        WHERE user_id = NEW.user_id;

        IF last_changed IS NOT NULL AND
           (NOW() - last_changed) < INTERVAL '30 days' THEN
          RAISE EXCEPTION 'Questionnaire answers cannot be changed within 30 days. Last changed: %', last_changed;
        END IF;

        UPDATE public.profiles
        SET last_answers_changed_at = NOW()
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- C) get_v2_answer: support array-shaped onboarding_sections.answers
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_v2_answer(
  p_user_id UUID,
  p_item_id  TEXT,
  p_section  TEXT
) RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT COALESCE(
    (
      SELECT elem->'value'
      FROM public.onboarding_sections os
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(os.answers) = 'array' THEN os.answers
          ELSE '[]'::jsonb
        END
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
-- D) Answer distribution trigger: iterate array answers
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_answer_distribution_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v2_sections TEXT[] := ARRAY[
    'logistics-context',
    'environment-rhythms',
    'cleanliness-operations',
    'communication-resolution',
    'social-spaces'
  ];
  elem       JSONB;
  item_key   TEXT;
  answer_val JSONB;
  bucket_key TEXT;
BEGIN
  IF NEW.section != ALL(v2_sections) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.answers IS NOT NULL AND jsonb_typeof(OLD.answers) = 'array' THEN
    FOR elem IN SELECT * FROM jsonb_array_elements(OLD.answers)
    LOOP
      item_key := elem->>'itemId';
      answer_val := elem->'value';
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL AND item_key IS NOT NULL THEN
        UPDATE public.answer_distribution_counts
           SET count      = GREATEST(0, count - 1),
               updated_at = now()
         WHERE item_id = item_key
           AND answer_key = bucket_key;
      END IF;
    END LOOP;
  ELSIF TG_OP = 'UPDATE' AND OLD.answers IS NOT NULL AND jsonb_typeof(OLD.answers) = 'object' THEN
    FOR item_key, answer_val IN SELECT * FROM jsonb_each(OLD.answers)
    LOOP
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL THEN
        UPDATE public.answer_distribution_counts
           SET count      = GREATEST(0, count - 1),
               updated_at = now()
         WHERE item_id = item_key
           AND answer_key = bucket_key;
      END IF;
    END LOOP;
  END IF;

  IF NEW.answers IS NOT NULL AND jsonb_typeof(NEW.answers) = 'array' THEN
    FOR elem IN SELECT * FROM jsonb_array_elements(NEW.answers)
    LOOP
      item_key := elem->>'itemId';
      answer_val := elem->'value';
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL AND item_key IS NOT NULL THEN
        INSERT INTO public.answer_distribution_counts (item_id, answer_key, count, updated_at)
          VALUES (item_key, bucket_key, 1, now())
        ON CONFLICT (item_id, answer_key)
          DO UPDATE SET count      = answer_distribution_counts.count + 1,
                        updated_at = now();
      END IF;
    END LOOP;
  ELSIF NEW.answers IS NOT NULL AND jsonb_typeof(NEW.answers) = 'object' THEN
    FOR item_key, answer_val IN SELECT * FROM jsonb_each(NEW.answers)
    LOOP
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL THEN
        INSERT INTO public.answer_distribution_counts (item_id, answer_key, count, updated_at)
          VALUES (item_key, bucket_key, 1, now())
        ON CONFLICT (item_id, answer_key)
          DO UPDATE SET count      = answer_distribution_counts.count + 1,
                        updated_at = now();
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- E) Context score: read real academic/profile fields by user_id
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.calculate_context_score_v2(
  p_a UUID,
  p_b UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_univ_a    UUID; v_univ_b    UUID;
  v_prog_a    UUID; v_prog_b    UUID;
  v_year_a    INT;  v_year_b    INT;
  v_cities_a  TEXT[]; v_cities_b TEXT[];
  v_undecided_a BOOLEAN; v_undecided_b BOOLEAN;

  v_univ_sim  NUMERIC;
  v_prog_sim  NUMERIC;
  v_year_sim  NUMERIC;
  v_city_sim  NUMERIC;
  v_acad_score NUMERIC;
  v_city_overlap INT;

  s_lc TEXT := 'logistics-context';
  a_M1Q10 JSONB; b_M1Q10 JSONB;
  a_M1Q20 JSONB; b_M1Q20 JSONB;
  a_M6Q7  JSONB; b_M6Q7  JSONB;
  a_M8Q23 JSONB; b_M8Q23 JSONB;
  a_M8Q20 JSONB; b_M8Q20 JSONB;
  a_M8Q25 JSONB; b_M8Q25 JSONB;
  a_M8Q24 JSONB; b_M8Q24 JSONB;
  a_M8Q12 JSONB; b_M8Q12 JSONB;
  v_logistics_score NUMERIC;
BEGIN
  SELECT ua.university_id, ua.program_id, usy.study_year, pr.preferred_cities,
         COALESCE(ua.undecided_program, false)
    INTO v_univ_a, v_prog_a, v_year_a, v_cities_a, v_undecided_a
    FROM public.profiles pr
    LEFT JOIN public.user_academic ua ON ua.user_id = pr.user_id
    LEFT JOIN public.user_study_year_v usy ON usy.user_id = pr.user_id
   WHERE pr.user_id = p_a;

  SELECT ua.university_id, ua.program_id, usy.study_year, pr.preferred_cities,
         COALESCE(ua.undecided_program, false)
    INTO v_univ_b, v_prog_b, v_year_b, v_cities_b, v_undecided_b
    FROM public.profiles pr
    LEFT JOIN public.user_academic ua ON ua.user_id = pr.user_id
    LEFT JOIN public.user_study_year_v usy ON usy.user_id = pr.user_id
   WHERE pr.user_id = p_b;

  v_univ_sim := CASE
    WHEN v_univ_a IS NOT NULL AND v_univ_b IS NOT NULL
      THEN CASE WHEN v_univ_a = v_univ_b THEN 1.0 ELSE 0.0 END
    ELSE 0.5
  END;

  IF v_undecided_a OR v_undecided_b THEN
    v_prog_sim := 0.5;
  ELSIF v_prog_a IS NOT NULL AND v_prog_b IS NOT NULL THEN
    v_prog_sim := CASE WHEN v_prog_a = v_prog_b THEN 1.0 ELSE 0.25 END;
  ELSE
    v_prog_sim := 0.5;
  END IF;

  v_year_sim := CASE
    WHEN v_year_a IS NOT NULL AND v_year_b IS NOT NULL
      THEN 1.0 - LEAST(ABS(v_year_a - v_year_b)::NUMERIC / 4.0, 1.0)
    ELSE 0.5
  END;

  IF v_cities_a IS NOT NULL AND array_length(v_cities_a, 1) > 0
     AND v_cities_b IS NOT NULL AND array_length(v_cities_b, 1) > 0 THEN
    SELECT COUNT(*)::INT INTO v_city_overlap
    FROM unnest(v_cities_a) AS a_city
    INNER JOIN unnest(v_cities_b) AS b_city
      ON lower(a_city) = lower(b_city);
    v_city_sim := LEAST(1.0, v_city_overlap::NUMERIC / 2.0);
  ELSE
    v_city_sim := 0.5;
  END IF;

  v_acad_score := 0.40 * COALESCE((v_univ_sim * 0.7 + v_city_sim * 0.3), v_univ_sim)
               +  0.35 * v_prog_sim
               +  0.25 * v_year_sim;

  a_M1Q10 := public.get_v2_answer(p_a,'M1_Q10', s_lc); b_M1Q10 := public.get_v2_answer(p_b,'M1_Q10', s_lc);
  a_M1Q20 := public.get_v2_answer(p_a,'M1_Q20', s_lc); b_M1Q20 := public.get_v2_answer(p_b,'M1_Q20', s_lc);
  a_M6Q7  := public.get_v2_answer(p_a,'M6_Q7',  s_lc); b_M6Q7  := public.get_v2_answer(p_b,'M6_Q7',  s_lc);
  a_M8Q23 := public.get_v2_answer(p_a,'M8_Q23', s_lc); b_M8Q23 := public.get_v2_answer(p_b,'M8_Q23', s_lc);
  a_M8Q20 := public.get_v2_answer(p_a,'M8_Q20', s_lc); b_M8Q20 := public.get_v2_answer(p_b,'M8_Q20', s_lc);
  a_M8Q25 := public.get_v2_answer(p_a,'M8_Q25', s_lc); b_M8Q25 := public.get_v2_answer(p_b,'M8_Q25', s_lc);
  a_M8Q24 := public.get_v2_answer(p_a,'M8_Q24', s_lc); b_M8Q24 := public.get_v2_answer(p_b,'M8_Q24', s_lc);
  a_M8Q12 := public.get_v2_answer(p_a,'M8_Q12', s_lc); b_M8Q12 := public.get_v2_answer(p_b,'M8_Q12', s_lc);

  v_logistics_score := public.weighted_module_score(ARRAY[
    ARRAY[0.18, public.sim_likert(a_M1Q10, b_M1Q10)],
    ARRAY[0.16, public.sim_likert(a_M1Q20, b_M1Q20)],
    ARRAY[0.14, public.sim_likert(a_M6Q7,  b_M6Q7)],
    ARRAY[0.14, public.sim_mcq_exact(a_M8Q23, b_M8Q23)],
    ARRAY[0.12, public.sim_mcq_exact(a_M8Q20, b_M8Q20)],
    ARRAY[0.10, public.sim_mcq_exact(a_M8Q25, b_M8Q25)],
    ARRAY[0.08, public.sim_toggle(a_M8Q24, b_M8Q24)],
    ARRAY[0.08, public.sim_toggle(a_M8Q12, b_M8Q12)]
  ]::NUMERIC[][]);

  RETURN 0.5 * v_acad_score + 0.5 * COALESCE(v_logistics_score, 0.5);
END;
$$;
