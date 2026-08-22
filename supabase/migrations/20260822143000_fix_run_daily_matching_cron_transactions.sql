-- Fix run_daily_matching: remove START TRANSACTION/COMMIT/ROLLBACK.
-- pg_cron already runs inside a transaction; nested transaction commands fail with:
--   ERROR: unsupported transaction command in PL/pgSQL

CREATE OR REPLACE PROCEDURE private.run_daily_matching(
  p_user_type   TEXT,
  p_batch_size  INTEGER DEFAULT 250,
  p_top_n       INTEGER DEFAULT 10,
  p_min_score   NUMERIC DEFAULT 0.60,
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
       AND p.verification_status = 'verified'
       AND p.user_type = p_user_type
       AND EXISTS (
         SELECT 1
           FROM public.onboarding_submissions sub
          WHERE sub.user_id = u.id
       )
       AND (
         SELECT COUNT(DISTINCT os.section)
           FROM public.onboarding_sections os
          WHERE os.user_id = u.id
            AND os.section IN (
              'logistics-context','environment-rhythms',
              'cleanliness-operations','communication-resolution','social-spaces'
            )
            AND jsonb_typeof(os.answers) = 'array'
            AND jsonb_array_length(os.answers) > 0
       ) = 5
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
             AND p2.verification_status = 'verified'
             AND p2.user_type = p_user_type
             AND EXISTS (
               SELECT 1
                 FROM public.onboarding_submissions sub2
                WHERE sub2.user_id = u2.id
             )
             AND (
               SELECT COUNT(DISTINCT os.section)
                 FROM public.onboarding_sections os
                WHERE os.user_id = u2.id
                  AND os.section IN (
                    'logistics-context','environment-rhythms',
                    'cleanliness-operations','communication-resolution','social-spaces'
                  )
                  AND jsonb_typeof(os.answers) = 'array'
                  AND jsonb_array_length(os.answers) > 0
             ) = 5
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
     SET status              = 'success',
         processed_users     = v_processed_users,
         suggestions_upserted = v_upserts,
         finished_at         = NOW()
   WHERE run_id = v_run_id;

  PERFORM pg_advisory_unlock(hashtext('private.run_daily_matching'));
EXCEPTION
  WHEN OTHERS THEN
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
