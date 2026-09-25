-- Align suggestion generation with match-pool product rules:
-- 1) Persona verification is NOT required to appear in suggestions (deferred to accept)
-- 2) Context-stage users (logistics-context answered) are eligible, not only full v2
-- 3) find_best_matches_v2 must not depend on legacy user_vectors (vector compute is broken on PG17)

-- ── A) Hourly cron matcher ───────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE private.run_daily_matching(
  p_user_type   TEXT,
  p_batch_size  INTEGER DEFAULT 250,
  p_top_n       INTEGER DEFAULT 10,
  p_min_score   NUMERIC DEFAULT 0.30,
  p_auto_accept_fit_index INTEGER DEFAULT 80
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, extensions, pg_catalog
AS $$
DECLARE
  v_lock_acquired BOOLEAN;
  v_run_id TEXT := format(
    'pg_cron_%s_%s', coalesce(p_user_type,'unknown'), to_char(now(),'YYYYMMDD_HH24MISS')
  );
  v_processed_users INTEGER := 0;
  v_upserts         INTEGER := 0;
  v_user_id         UUID;
  v_match           RECORD;
  v_compat          public.compatibility_score_v2;
  v_fit_index       INTEGER;
  v_status          TEXT;
  v_low             UUID;
  v_high            UUID;
  v_member_ids      UUID[];
BEGIN
  v_lock_acquired := pg_try_advisory_lock(hashtext('private.run_daily_matching'));
  IF NOT v_lock_acquired THEN
    INSERT INTO private.matching_job_runs (run_id, user_type, status, error_message)
    VALUES (v_run_id, p_user_type, 'skipped', 'Another matching run is already in progress');
    RETURN;
  END IF;

  INSERT INTO private.matching_job_runs (run_id, user_type, status)
  VALUES (v_run_id, p_user_type, 'running');

  FOR v_user_id IN
    SELECT u.id
      FROM public.users u
      JOIN public.profiles p ON p.user_id = u.id
     WHERE u.is_active = TRUE
       AND p.user_type = p_user_type
       AND (p.is_visible IS DISTINCT FROM FALSE)
       AND COALESCE((p.privacy_settings->>'showInMatches')::boolean, TRUE) = TRUE
       AND EXISTS (
         SELECT 1
           FROM public.onboarding_submissions sub
          WHERE sub.user_id = u.id
       )
       -- Context-stage or full: logistics-context answers are enough for the pool
       AND EXISTS (
         SELECT 1
           FROM public.onboarding_sections os
          WHERE os.user_id = u.id
            AND os.section = 'logistics-context'
            AND jsonb_typeof(os.answers) = 'array'
            AND jsonb_array_length(os.answers) > 0
       )
     ORDER BY u.id
     LIMIT p_batch_size
  LOOP
    v_processed_users := v_processed_users + 1;

    FOR v_match IN
      SELECT candidate_id
        FROM (
          SELECT u2.id AS candidate_id
            FROM public.users u2
            JOIN public.profiles p2 ON p2.user_id = u2.id
           WHERE u2.id != v_user_id
             AND u2.is_active = TRUE
             AND p2.user_type = p_user_type
             AND (p2.is_visible IS DISTINCT FROM FALSE)
             AND COALESCE((p2.privacy_settings->>'showInMatches')::boolean, TRUE) = TRUE
             AND EXISTS (
               SELECT 1
                 FROM public.onboarding_submissions sub2
                WHERE sub2.user_id = u2.id
             )
             AND EXISTS (
               SELECT 1
                 FROM public.onboarding_sections os
                WHERE os.user_id = u2.id
                  AND os.section = 'logistics-context'
                  AND jsonb_typeof(os.answers) = 'array'
                  AND jsonb_array_length(os.answers) > 0
             )
             AND NOT EXISTS (
               SELECT 1
                 FROM public.match_blocklist mb
                WHERE mb.user_id = v_user_id
                  AND mb.blocked_user_id = u2.id
                  AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
             )
             AND NOT EXISTS (
               SELECT 1
                 FROM public.match_blocklist mb
                WHERE mb.user_id = u2.id
                  AND mb.blocked_user_id = v_user_id
                  AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
             )
           ORDER BY random()
           LIMIT p_top_n * 20
        ) AS candidates
       LIMIT p_top_n
    LOOP
      v_compat := public.compute_compatibility_score_v2(v_user_id, v_match.candidate_id);

      CONTINUE WHEN v_compat.match_blocked;
      CONTINUE WHEN v_compat.overall_score < p_min_score;

      v_low        := LEAST(v_user_id, v_match.candidate_id);
      v_high       := GREATEST(v_user_id, v_match.candidate_id);
      v_member_ids := ARRAY[v_low, v_high];
      v_fit_index  := GREATEST(0, LEAST(100, ROUND(v_compat.overall_score * 100)::INT));
      v_status     := CASE WHEN v_fit_index >= p_auto_accept_fit_index THEN 'accepted' ELSE 'pending' END;

      INSERT INTO public.match_suggestions (
        run_id, kind, member_ids, fit_score, fit_index,
        section_scores, reasons, expires_at, status, accepted_by, algorithm_version
      ) VALUES (
        v_run_id, 'pair', v_member_ids,
        v_compat.overall_score, v_fit_index,
        jsonb_build_object(
          'environment',    v_compat.dimension_environment,
          'cleanliness',    v_compat.dimension_cleanliness,
          'communication',  v_compat.dimension_communication,
          'social',         v_compat.dimension_social,
          'logistics_context', v_compat.dimension_logistics,
          'harmony',        v_compat.harmony_score,
          'context',        v_compat.context_score,
          'gate_conflicts', v_compat.gate_conflicts,
          'soft_gate_override', v_compat.soft_gate_override,
          'algo',           'v2'
        ),
        ARRAY['Compatible on environment, cleanliness, communication, and social life'],
        NOW() + INTERVAL '100 years',
        v_status,
        ARRAY[]::uuid[],
        'v2'
      )
      ON CONFLICT (user_low_id, user_high_id) WHERE kind = 'pair'
      DO UPDATE SET
        run_id            = EXCLUDED.run_id,
        fit_score         = EXCLUDED.fit_score,
        fit_index         = EXCLUDED.fit_index,
        section_scores    = EXCLUDED.section_scores,
        algorithm_version = EXCLUDED.algorithm_version,
        status            = CASE
          WHEN public.match_suggestions.status IN ('confirmed','declined')
          THEN public.match_suggestions.status
          ELSE EXCLUDED.status
        END,
        accepted_by       = CASE
          WHEN public.match_suggestions.status IN ('confirmed','declined')
          THEN public.match_suggestions.accepted_by
          ELSE EXCLUDED.accepted_by
        END,
        updated_at = NOW();

      v_upserts := v_upserts + 1;
    END LOOP;
  END LOOP;

  UPDATE private.matching_job_runs
     SET status               = 'success',
         processed_users      = v_processed_users,
         suggestions_upserted = v_upserts,
         finished_at          = NOW()
   WHERE run_id = v_run_id;

  PERFORM pg_advisory_unlock(hashtext('private.run_daily_matching'));
EXCEPTION WHEN OTHERS THEN
  UPDATE private.matching_job_runs
     SET status          = 'failed',
         finished_at     = NOW(),
         processed_users = v_processed_users,
         suggestions_upserted = v_upserts,
         error_message   = SQLERRM,
         error_detail    = jsonb_build_object('sqlstate', SQLSTATE, 'run_id', v_run_id)
   WHERE run_id = v_run_id;
  PERFORM pg_advisory_unlock(hashtext('private.run_daily_matching'));
  RAISE;
END;
$$;

REVOKE ALL ON PROCEDURE private.run_daily_matching(text, integer, integer, numeric, integer) FROM PUBLIC;
GRANT EXECUTE ON PROCEDURE private.run_daily_matching(text, integer, integer, numeric, integer) TO postgres;

-- ── B) Refresh / hybrid candidate search (no legacy vectors) ─────────────────
CREATE OR REPLACE FUNCTION public.find_best_matches_v2(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_candidates_limit integer DEFAULT 200,
  p_min_score numeric DEFAULT 0.3
)
RETURNS TABLE(
  user_id uuid,
  first_name text,
  university_name text,
  program_name text,
  compatibility_score numeric,
  academic_bonus numeric,
  top_alignment text,
  watch_out text,
  debug_info jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'extensions'
AS $$
DECLARE
  v_requesting_user_type text;
BEGIN
  SELECT pr.user_type
    INTO v_requesting_user_type
  FROM public.profiles pr
  WHERE pr.user_id = p_user_id;

  IF v_requesting_user_type IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT u.id AS candidate_user_id
      FROM public.users u
      JOIN public.profiles p ON p.user_id = u.id
     WHERE u.id != p_user_id
       AND u.is_active = TRUE
       AND p.user_type = v_requesting_user_type
       AND p.user_type IS NOT NULL
       AND (p.is_visible IS DISTINCT FROM FALSE)
       AND COALESCE((p.privacy_settings->>'showInMatches')::boolean, TRUE) = TRUE
       AND EXISTS (
         SELECT 1
           FROM public.onboarding_submissions sub
          WHERE sub.user_id = u.id
       )
       AND EXISTS (
         SELECT 1
           FROM public.onboarding_sections os
          WHERE os.user_id = u.id
            AND os.section = 'logistics-context'
            AND jsonb_typeof(os.answers) = 'array'
            AND jsonb_array_length(os.answers) > 0
       )
       AND NOT EXISTS (
         SELECT 1
           FROM public.match_blocklist mb
          WHERE mb.user_id = p_user_id
            AND mb.blocked_user_id = u.id
            AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
       )
       AND NOT EXISTS (
         SELECT 1
           FROM public.match_blocklist mb
          WHERE mb.user_id = u.id
            AND mb.blocked_user_id = p_user_id
            AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
       )
       AND NOT EXISTS (
         SELECT 1
           FROM public.matches m
          WHERE (
            (m.a_user = p_user_id AND m.b_user = u.id)
            OR (m.a_user = u.id AND m.b_user = p_user_id)
          )
            AND m.status = 'unmatched'
       )
     ORDER BY random()
     LIMIT p_candidates_limit
  )
  SELECT
    c.candidate_user_id,
    p.first_name::text,
    univ.name::text AS university_name,
    prog.name::text AS program_name,
    cs.compatibility_score,
    cs.academic_bonus,
    cs.top_alignment::text,
    cs.watch_out::text,
    jsonb_build_object('algo', 'v2_onboarding_pool') AS debug_info
  FROM candidates c
  JOIN public.profiles p ON c.candidate_user_id = p.user_id
  JOIN public.user_academic ua ON c.candidate_user_id = ua.user_id
  JOIN public.universities univ ON ua.university_id = univ.id
  LEFT JOIN public.programs prog ON ua.program_id = prog.id
  CROSS JOIN LATERAL public.compute_compatibility_score(p_user_id, c.candidate_user_id) cs
  WHERE cs.is_valid_match = true
    AND cs.compatibility_score >= p_min_score
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.find_best_matches_v2(uuid, integer, integer, numeric) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_best_matches_v2(uuid, integer, integer, numeric) TO service_role, postgres;
