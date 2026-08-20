-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 2.6 + 2.7 — Update run_daily_matching to v2 + one-time backfill
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Add algorithm_version column to match_suggestions (if not present)
ALTER TABLE public.match_suggestions
  ADD COLUMN IF NOT EXISTS algorithm_version TEXT NOT NULL DEFAULT 'v1';

-- 2) Replace run_daily_matching to call compute_compatibility_score_v2 for v2 users.
--    For pairs where BOTH users have at least one v2 section answer, use v2.
--    For legacy pairs, fall back to the old find_best_matches_v2 call.
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
  v_last_user_id    UUID := '00000000-0000-0000-0000-000000000000';
  v_batch_count     INTEGER := 0;
  v_match           RECORD;
  v_compat          public.compatibility_score_v2;
  v_fit_index       INTEGER;
  v_status          TEXT;
  v_low             UUID;
  v_high            UUID;
  v_member_ids      UUID[];
  v_is_v2           BOOLEAN;
BEGIN
  v_lock_acquired := pg_try_advisory_lock(hashtext('private.run_daily_matching'));
  IF NOT v_lock_acquired THEN
    INSERT INTO private.matching_job_runs (run_id, user_type, status, error_message)
    VALUES (v_run_id, p_user_type, 'skipped', 'Another matching run is already in progress');
    RETURN;
  END IF;

  INSERT INTO private.matching_job_runs (run_id, user_type, status)
  VALUES (v_run_id, p_user_type, 'running');

  LOOP
    START TRANSACTION;
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
      v_batch_count     := v_batch_count + 1;
      v_last_user_id    := v_user_id;

      -- Detect if this user is a v2 user
      SELECT EXISTS (
        SELECT 1 FROM public.onboarding_sections
         WHERE user_id = v_user_id
           AND section IN ('logistics-context','environment-rhythms',
                           'cleanliness-operations','communication-resolution','social-spaces')
      ) INTO v_is_v2;

      IF v_is_v2 THEN
        -- v2 path: score against other v2 users
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
                   SELECT 1 FROM public.onboarding_sections os
                    WHERE os.user_id = u2.id
                      AND os.section IN ('logistics-context','environment-rhythms',
                                         'cleanliness-operations','communication-resolution','social-spaces')
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
          ON CONFLICT (user_low_id, user_high_id)
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
            updated_at = NOW();

          v_upserts := v_upserts + 1;
        END LOOP;

      ELSE
        -- Legacy v1 path: use existing find_best_matches_v2 function
        FOR v_match IN
          SELECT * FROM public.find_best_matches_v2(v_user_id, p_top_n, 200, p_min_score)
        LOOP
          v_low        := LEAST(v_user_id, v_match.user_id);
          v_high       := GREATEST(v_user_id, v_match.user_id);
          v_member_ids := ARRAY[v_low, v_high];
          v_fit_index  := GREATEST(0, LEAST(100, ROUND(v_match.compatibility_score::NUMERIC * 100)::INT));
          v_status     := CASE WHEN v_fit_index >= p_auto_accept_fit_index THEN 'accepted' ELSE 'pending' END;

          INSERT INTO public.match_suggestions (
            run_id, kind, member_ids, fit_score, fit_index,
            section_scores, reasons, expires_at, status, accepted_by, algorithm_version
          ) VALUES (
            v_run_id, 'pair', v_member_ids,
            v_match.compatibility_score, v_fit_index,
            jsonb_build_object(
              'academic_bonus', v_match.academic_bonus,
              'top_alignment',  v_match.top_alignment,
              'watch_out',      v_match.watch_out,
              'algo',           'pg_cron_hybrid_v1'
            ),
            ARRAY[COALESCE(v_match.top_alignment,'Good overall compatibility')],
            NOW() + INTERVAL '100 years',
            v_status,
            ARRAY[]::uuid[],
            'v1'
          )
          ON CONFLICT (user_low_id, user_high_id)
          DO UPDATE SET
            run_id            = EXCLUDED.run_id,
            fit_score         = EXCLUDED.fit_score,
            fit_index         = EXCLUDED.fit_index,
            section_scores    = EXCLUDED.section_scores,
            status            = CASE
              WHEN public.match_suggestions.status IN ('confirmed','declined')
              THEN public.match_suggestions.status
              ELSE EXCLUDED.status
            END,
            updated_at = NOW();

          v_upserts := v_upserts + 1;
        END LOOP;
      END IF;

    END LOOP;

    COMMIT;
    EXIT WHEN v_batch_count = 0;
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
    BEGIN ROLLBACK; EXCEPTION WHEN OTHERS THEN NULL; END;
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) One-time backfill: recompute all non-confirmed pairs where both users are
--    v2 users, in batches of 500 to avoid lock contention.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_batch_size INT := 500;
  v_offset     INT := 0;
  v_count      INT;
  v_pair       RECORD;
  v_compat     public.compatibility_score_v2;
BEGIN
  LOOP
    v_count := 0;
    FOR v_pair IN
      SELECT ms.id, ms.user_low_id, ms.user_high_id
        FROM public.match_suggestions ms
       WHERE ms.kind = 'pair'
         AND ms.status NOT IN ('confirmed')
         -- both users must have v2 data
         AND EXISTS (
           SELECT 1 FROM public.onboarding_sections os
            WHERE os.user_id = ms.user_low_id
              AND os.section IN ('logistics-context','environment-rhythms',
                                 'cleanliness-operations','communication-resolution','social-spaces')
         )
         AND EXISTS (
           SELECT 1 FROM public.onboarding_sections os
            WHERE os.user_id = ms.user_high_id
              AND os.section IN ('logistics-context','environment-rhythms',
                                 'cleanliness-operations','communication-resolution','social-spaces')
         )
       ORDER BY ms.updated_at ASC NULLS LAST
       LIMIT v_batch_size
       OFFSET v_offset
    LOOP
      v_count := v_count + 1;

      BEGIN
        v_compat := public.compute_compatibility_score_v2(
          v_pair.user_low_id, v_pair.user_high_id
        );

        IF v_compat.match_blocked THEN
          DELETE FROM public.match_suggestions WHERE id = v_pair.id;
        ELSE
          UPDATE public.match_suggestions
             SET fit_score         = v_compat.overall_score,
                 fit_index         = GREATEST(0, LEAST(100, ROUND(v_compat.overall_score * 100)::INT)),
                 section_scores    = jsonb_build_object(
                   'environment',       v_compat.dimension_environment,
                   'cleanliness',       v_compat.dimension_cleanliness,
                   'communication',     v_compat.dimension_communication,
                   'social',            v_compat.dimension_social,
                   'logistics_context', v_compat.dimension_logistics,
                   'harmony',           v_compat.harmony_score,
                   'context',           v_compat.context_score,
                   'gate_conflicts',    v_compat.gate_conflicts,
                   'soft_gate_override', v_compat.soft_gate_override,
                   'algo',              'backfill_v2'
                 ),
                 algorithm_version = 'v2',
                 updated_at        = NOW()
           WHERE id = v_pair.id;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Skip pairs that fail (e.g. missing profile data) to keep the batch moving
        NULL;
      END;
    END LOOP;

    EXIT WHEN v_count = 0;
    v_offset := v_offset + v_batch_size;
    COMMIT;
  END LOOP;
END;
$$;
