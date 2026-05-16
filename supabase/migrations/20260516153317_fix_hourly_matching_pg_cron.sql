-- Ensure unmatching status exists for find_best_matches_v2 filters.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'match_status'
      AND e.enumlabel = 'unmatched'
  ) THEN
    ALTER TYPE public.match_status ADD VALUE 'unmatched';
  END IF;
END $$;

-- Fix pg_cron matching jobs failing with:
--   ERROR: unsupported transaction command in PL/pgSQL
-- pg_cron invokes jobs inside a transaction; START TRANSACTION/COMMIT in the
-- procedure is not allowed. Run batches in a single transaction instead.
-- Also reschedule from daily (02:00 UTC) to hourly, staggered by cohort.

CREATE OR REPLACE PROCEDURE private.run_daily_matching(
  p_user_type TEXT,
  p_batch_size INTEGER DEFAULT 250,
  p_top_n INTEGER DEFAULT 10,
  p_min_score NUMERIC DEFAULT 0.60,
  p_auto_accept_fit_index INTEGER DEFAULT 80
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, extensions, pg_catalog
AS $$
DECLARE
  v_lock_key BIGINT;
  v_lock_acquired BOOLEAN;
  v_run_id TEXT := format(
    'pg_cron_%s_%s',
    coalesce(p_user_type, 'unknown'),
    to_char(now(), 'YYYYMMDD_HH24MISS')
  );
  v_processed_users INTEGER := 0;
  v_upserts INTEGER := 0;
  v_user_id UUID;
  v_last_user_id UUID := '00000000-0000-0000-0000-000000000000';
  v_batch_count INTEGER := 0;
  v_match RECORD;
  v_fit_index INTEGER;
  v_status TEXT;
  v_member_ids UUID[];
  v_low UUID;
  v_high UUID;
BEGIN
  v_lock_key := hashtext('private.run_daily_matching:' || coalesce(p_user_type, 'unknown'));
  v_lock_acquired := pg_try_advisory_lock(v_lock_key);

  IF NOT v_lock_acquired THEN
    INSERT INTO private.matching_job_runs (run_id, job_name, user_type, status, error_message)
    VALUES (
      v_run_id,
      'hourly_matching',
      p_user_type,
      'skipped',
      format('Another %s matching run is already in progress', coalesce(p_user_type, 'unknown'))
    );
    RETURN;
  END IF;

  INSERT INTO private.matching_job_runs (run_id, job_name, user_type, status)
  VALUES (v_run_id, 'hourly_matching', p_user_type, 'running');

  LOOP
    v_batch_count := 0;

    FOR v_user_id IN
      SELECT u.id
      FROM public.users u
      JOIN public.profiles p ON p.user_id = u.id
      WHERE u.is_active = TRUE
        AND p.verification_status = 'verified'
        AND p.user_type = p_user_type
        AND u.id > v_last_user_id
      ORDER BY u.id
      LIMIT p_batch_size
    LOOP
      v_processed_users := v_processed_users + 1;
      v_batch_count := v_batch_count + 1;
      v_last_user_id := v_user_id;

      FOR v_match IN
        SELECT *
        FROM public.find_best_matches_v2(v_user_id, p_top_n, 200, p_min_score)
      LOOP
        v_low := LEAST(v_user_id, v_match.user_id);
        v_high := GREATEST(v_user_id, v_match.user_id);
        v_member_ids := ARRAY[v_low, v_high];

        v_fit_index := GREATEST(
          0,
          LEAST(100, ROUND((v_match.compatibility_score::numeric) * 100)::int)
        );
        v_status := CASE
          WHEN v_fit_index >= p_auto_accept_fit_index THEN 'accepted'
          ELSE 'pending'
        END;

        INSERT INTO public.match_suggestions (
          run_id,
          kind,
          member_ids,
          fit_score,
          fit_index,
          section_scores,
          reasons,
          expires_at,
          status,
          accepted_by
        )
        VALUES (
          v_run_id,
          'pair',
          v_member_ids,
          v_match.compatibility_score,
          v_fit_index,
          jsonb_build_object(
            'academic_bonus', v_match.academic_bonus,
            'top_alignment', v_match.top_alignment,
            'watch_out', v_match.watch_out,
            'algo', 'pg_cron_hybrid_v2'
          ),
          ARRAY[COALESCE(v_match.top_alignment, 'Good overall compatibility')],
          NOW() + INTERVAL '100 years',
          v_status,
          ARRAY[]::uuid[]
        )
        ON CONFLICT (user_low_id, user_high_id) WHERE kind = 'pair'
        DO UPDATE SET
          run_id = EXCLUDED.run_id,
          member_ids = EXCLUDED.member_ids,
          fit_score = EXCLUDED.fit_score,
          fit_index = EXCLUDED.fit_index,
          section_scores = EXCLUDED.section_scores,
          reasons = EXCLUDED.reasons,
          expires_at = EXCLUDED.expires_at,
          status = CASE
            WHEN public.match_suggestions.status IN ('confirmed', 'declined')
              THEN public.match_suggestions.status
            ELSE EXCLUDED.status
          END,
          updated_at = NOW();

        v_upserts := v_upserts + 1;
      END LOOP;
    END LOOP;

    EXIT WHEN v_batch_count = 0;
  END LOOP;

  UPDATE private.matching_job_runs
  SET
    status = 'success',
    processed_users = v_processed_users,
    suggestions_upserted = v_upserts,
    finished_at = NOW()
  WHERE run_id = v_run_id;

  PERFORM pg_advisory_unlock(v_lock_key);
EXCEPTION
  WHEN OTHERS THEN
    UPDATE private.matching_job_runs
    SET
      status = 'failed',
      finished_at = NOW(),
      processed_users = v_processed_users,
      suggestions_upserted = v_upserts,
      error_message = SQLERRM,
      error_detail = jsonb_build_object('sqlstate', SQLSTATE, 'run_id', v_run_id)
    WHERE run_id = v_run_id;

    PERFORM pg_advisory_unlock(v_lock_key);
    RAISE;
END;
$$;

REVOKE ALL ON PROCEDURE private.run_daily_matching(text, integer, integer, numeric, integer) FROM PUBLIC;
GRANT EXECUTE ON PROCEDURE private.run_daily_matching(text, integer, integer, numeric, integer) TO postgres;

-- pgvector type lives in extensions; pinned public-only search_path breaks cron matching.
-- Qualify user_vectors.user_id to avoid ambiguity with RETURNS TABLE (user_id).
CREATE OR REPLACE FUNCTION public.find_best_matches_v2(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_candidates_limit integer DEFAULT 200,
  p_min_score numeric DEFAULT 0.6
)
RETURNS TABLE (
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
SET search_path = pg_catalog, public, extensions
AS $$
DECLARE
  v_user_vector vector(50);
  v_requesting_user_type text;
BEGIN
  SELECT pr.user_type INTO v_requesting_user_type
  FROM public.profiles pr
  WHERE pr.user_id = p_user_id;

  IF v_requesting_user_type IS NULL THEN
    RETURN;
  END IF;

  SELECT uv.vector INTO v_user_vector
  FROM public.user_vectors uv
  WHERE uv.user_id = p_user_id;

  IF v_user_vector IS NULL THEN
    PERFORM public.compute_user_vector_and_store(p_user_id);
    SELECT uv.vector INTO v_user_vector
    FROM public.user_vectors uv
    WHERE uv.user_id = p_user_id;
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT
      uv.user_id AS candidate_user_id,
      (uv.vector <=> v_user_vector) AS vector_dist
    FROM public.user_vectors uv
    INNER JOIN public.profiles p_cand ON p_cand.user_id = uv.user_id
      AND p_cand.user_type = v_requesting_user_type
      AND p_cand.user_type IS NOT NULL
    WHERE uv.user_id != p_user_id
      AND EXISTS (
        SELECT 1
        FROM public.users u
        JOIN public.profiles p ON u.id = p.user_id
        WHERE u.id = uv.user_id
          AND u.is_active = true
          AND p.verification_status = 'verified'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.match_blocklist mb
        WHERE mb.user_id = p_user_id
          AND mb.blocked_user_id = uv.user_id
          AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.match_blocklist mb
        WHERE mb.user_id = uv.user_id
          AND mb.blocked_user_id = p_user_id
          AND (mb.ended_at IS NULL OR mb.ended_at > NOW())
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.matches m
        WHERE (
          (m.a_user = p_user_id AND m.b_user = uv.user_id)
          OR (m.a_user = uv.user_id AND m.b_user = p_user_id)
        )
          AND m.status = 'unmatched'
      )
    ORDER BY uv.vector <=> v_user_vector ASC
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
    jsonb_build_object('vector_dist', c.vector_dist, 'algo', 'hybrid_v2') AS debug_info
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

-- Hourly: students at :00, professionals at :30 (UTC) to reduce overlap.
SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'daily_matching_students'),
  schedule := '0 * * * *'
);

SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'daily_matching_professionals'),
  schedule := '30 * * * *'
);
