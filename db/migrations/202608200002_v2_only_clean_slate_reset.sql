-- =============================================================================
-- v2-only clean slate
-- 1) Reset questionnaire answers for anyone who has not started v2 modules
-- 2) Remove stale v1 match suggestions
-- 3) Make daily matching + compute_compatibility_score v2-only
-- =============================================================================

-- ── A) Identify users who already have any v2 module answers ─────────────────
CREATE TEMP TABLE tmp_v2_users ON COMMIT DROP AS
SELECT DISTINCT user_id
  FROM public.onboarding_sections
 WHERE section IN (
   'logistics-context',
   'environment-rhythms',
   'cleanliness-operations',
   'communication-resolution',
   'social-spaces'
 );

-- ── B) Delete legacy questionnaire sections for non-v2 users ─────────────────
-- Keep `intro` (academic / welcome) so university & programme stay intact.
DELETE FROM public.onboarding_sections os
 WHERE os.section <> 'intro'
   AND NOT EXISTS (
     SELECT 1 FROM tmp_v2_users v WHERE v.user_id = os.user_id
   );

-- Drop legacy submissions/responses for non-v2 users so completion gates reopen.
DELETE FROM public.onboarding_submissions s
 WHERE NOT EXISTS (
   SELECT 1 FROM tmp_v2_users v WHERE v.user_id = s.user_id
 );

DELETE FROM public.responses r
 WHERE NOT EXISTS (
   SELECT 1 FROM tmp_v2_users v WHERE v.user_id = r.user_id
 );

-- Allow everyone who was reset to re-answer without the 30-day lock.
UPDATE public.profiles p
   SET last_answers_changed_at = NULL
 WHERE NOT EXISTS (
   SELECT 1 FROM tmp_v2_users v WHERE v.user_id = p.user_id
 );

-- ── C) Remove non-v2 / orphaned pair suggestions ─────────────────────────────
DELETE FROM public.match_suggestions ms
 WHERE ms.kind = 'pair'
   AND (
     COALESCE(ms.algorithm_version, 'v1') <> 'v2'
     OR NOT EXISTS (
       SELECT 1 FROM public.onboarding_sections os
        WHERE os.user_id = ms.user_low_id
          AND os.section IN (
            'logistics-context','environment-rhythms','cleanliness-operations',
            'communication-resolution','social-spaces'
          )
     )
     OR NOT EXISTS (
       SELECT 1 FROM public.onboarding_sections os
        WHERE os.user_id = ms.user_high_id
          AND os.section IN (
            'logistics-context','environment-rhythms','cleanliness-operations',
            'communication-resolution','social-spaces'
          )
     )
   );

-- ── D) compute_compatibility_score → thin v2 adapter (keeps API return shape) ─
CREATE OR REPLACE FUNCTION public.compute_compatibility_score(
  user_a_id uuid,
  user_b_id uuid
)
RETURNS TABLE(
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
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v2 public.compatibility_score_v2;
BEGIN
  v2 := public.compute_compatibility_score_v2(user_a_id, user_b_id);

  RETURN QUERY SELECT
    COALESCE(v2.overall_score, 0)::numeric AS compatibility_score,
    NULL::numeric AS personality_score,
    NULL::numeric AS schedule_score,
    NULL::numeric AS lifestyle_score,
    COALESCE(v2.dimension_social, 0)::numeric AS social_score,
    NULL::numeric AS academic_bonus,
    NULL::numeric AS penalty,
    'v2 compatibility'::text AS top_alignment,
    CASE
      WHEN COALESCE(array_length(v2.gate_conflicts, 1), 0) > 0
        THEN 'Hard-gate conflict detected'
      ELSE NULL
    END AS watch_out,
    NULL::text AS house_rules_suggestion,
    NULL::jsonb AS academic_details,
    COALESCE(v2.harmony_score, 0)::numeric AS harmony_score,
    COALESCE(v2.context_score, 0)::numeric AS context_score,
    jsonb_build_object(
      'environment', v2.dimension_environment,
      'cleanliness', v2.dimension_cleanliness,
      'communication', v2.dimension_communication,
      'social', v2.dimension_social,
      'logistics_context', v2.dimension_logistics,
      'gate_conflicts', to_jsonb(COALESCE(v2.gate_conflicts, ARRAY[]::text[])),
      'soft_gate_override', COALESCE(v2.soft_gate_override, false)
    ) AS dimension_scores_json,
    (NOT COALESCE(v2.match_blocked, true)) AS is_valid_match,
    'v2'::text AS algorithm_version;
END;
$$;

REVOKE ALL ON FUNCTION public.compute_compatibility_score(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_compatibility_score(uuid, uuid) TO service_role;

-- ── E) Daily matching: v2 users only (no legacy find_best_matches path) ───────
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
         -- v2-only: require at least one v2 module row
         AND EXISTS (
           SELECT 1 FROM public.onboarding_sections os
            WHERE os.user_id = u.id
              AND os.section IN (
                'logistics-context','environment-rhythms',
                'cleanliness-operations','communication-resolution','social-spaces'
              )
         )
       ORDER BY u.id
       LIMIT p_batch_size
    LOOP
      v_processed_users := v_processed_users + 1;
      v_batch_count     := v_batch_count + 1;
      v_last_user_id    := v_user_id;

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
                    AND os.section IN (
                      'logistics-context','environment-rhythms',
                      'cleanliness-operations','communication-resolution','social-spaces'
                    )
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
