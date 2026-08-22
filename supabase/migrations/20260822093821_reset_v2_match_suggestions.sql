-- =============================================================================
-- Reset match suggestions after v2 questionnaire launch
--
-- Goals:
-- 1) Keep confirmed (mutual-accept) matches untouched
-- 2) Reset non-confirmed pair suggestions for v2-complete users to pending with
--    fresh v2 scores (declined, one-sided accepted, stale pending)
-- 3) Clear v1-era blocklist entries for those reset pairs
-- 4) Mark users who have NOT fully completed v2 as questionnaire-incomplete
-- 5) Tighten daily matching to v2-complete users only (all 5 modules + submission)
-- =============================================================================

-- ── A) Cohort helpers ────────────────────────────────────────────────────────
CREATE TEMP TABLE tmp_v2_sections ON COMMIT DROP AS
SELECT unnest(ARRAY[
  'logistics-context',
  'environment-rhythms',
  'cleanliness-operations',
  'communication-resolution',
  'social-spaces'
]::text[]) AS section;

-- Users with all five v2 modules answered (matches app completion gate)
CREATE TEMP TABLE tmp_v2_complete_users ON COMMIT DROP AS
SELECT os.user_id
  FROM public.onboarding_sections os
  JOIN tmp_v2_sections vs ON vs.section = os.section
 WHERE jsonb_typeof(os.answers) = 'array'
   AND jsonb_array_length(os.answers) > 0
 GROUP BY os.user_id
HAVING COUNT(DISTINCT os.section) = 5;

CREATE TEMP TABLE tmp_v2_complete_eligible ON COMMIT DROP AS
SELECT vc.user_id
  FROM tmp_v2_complete_users vc
 WHERE EXISTS (
   SELECT 1
     FROM public.onboarding_submissions sub
    WHERE sub.user_id = vc.user_id
 );

-- Confirmed pair partners — never reset blocklist or suggestions for these pairs
CREATE TEMP TABLE tmp_confirmed_pairs ON COMMIT DROP AS
SELECT ms.user_low_id  AS user_a,
       ms.user_high_id AS user_b
  FROM public.match_suggestions ms
 WHERE ms.kind = 'pair'
   AND ms.status = 'confirmed';

-- Non-confirmed pair suggestions eligible for reset (both members v2-complete)
CREATE TEMP TABLE tmp_pairs_to_reset ON COMMIT DROP AS
SELECT ms.id,
       ms.user_low_id,
       ms.user_high_id
  FROM public.match_suggestions ms
 WHERE ms.kind = 'pair'
   AND ms.status <> 'confirmed'
   AND EXISTS (
     SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = ms.user_low_id
   )
   AND EXISTS (
     SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = ms.user_high_id
   );

-- ── B) Mark non-v2-complete users as questionnaire incomplete ────────────────
-- Drop completion records so dashboard/onboarding gates reopen.
DELETE FROM public.onboarding_submissions sub
 WHERE NOT EXISTS (
   SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = sub.user_id
 );

-- Remove legacy v1 section rows for users who have not finished v2 (keep intro).
DELETE FROM public.onboarding_sections os
 WHERE os.section NOT IN (
   'intro',
   'logistics-context',
   'environment-rhythms',
   'cleanliness-operations',
   'communication-resolution',
   'social-spaces'
 )
   AND NOT EXISTS (
     SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = os.user_id
   );

DELETE FROM public.responses r
 WHERE NOT EXISTS (
   SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = r.user_id
 );

UPDATE public.profiles p
   SET last_answers_changed_at = NULL
 WHERE NOT EXISTS (
   SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = p.user_id
 );

-- ── C) Remove suggestions that should not exist (incomplete v2 on either side) ─
DELETE FROM public.match_suggestions ms
 WHERE ms.kind = 'pair'
   AND ms.status <> 'confirmed'
   AND (
     NOT EXISTS (
       SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = ms.user_low_id
     )
     OR NOT EXISTS (
       SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = ms.user_high_id
     )
   );

-- ── D) Clear blocklist between v2-complete users (preserve confirmed pairs) ───
-- Covers v1 declines even when the old suggestion row was already removed.
DELETE FROM public.match_blocklist mb
 WHERE EXISTS (
   SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = mb.user_id
 )
   AND EXISTS (
   SELECT 1 FROM tmp_v2_complete_eligible v WHERE v.user_id = mb.blocked_user_id
 )
   AND NOT EXISTS (
     SELECT 1
       FROM tmp_confirmed_pairs cp
      WHERE (cp.user_a = mb.user_id AND cp.user_b = mb.blocked_user_id)
         OR (cp.user_a = mb.blocked_user_id AND cp.user_b = mb.user_id)
   );

-- ── E) Recalculate v2 scores + reset non-confirmed statuses to pending ───────
DO $$
DECLARE
  r RECORD;
  v_compat public.compatibility_score_v2;
  v_fit_index INTEGER;
  v_status TEXT;
BEGIN
  FOR r IN SELECT id, user_low_id, user_high_id FROM tmp_pairs_to_reset LOOP
    v_compat := public.compute_compatibility_score_v2(r.user_low_id, r.user_high_id);

    IF COALESCE(v_compat.match_blocked, true)
       OR COALESCE(v_compat.overall_score, 0) < 0.60 THEN
      DELETE FROM public.match_suggestions WHERE id = r.id;
      CONTINUE;
    END IF;

    v_fit_index := GREATEST(0, LEAST(100, ROUND(v_compat.overall_score * 100)::INT));
    v_status := CASE WHEN v_fit_index >= 80 THEN 'accepted' ELSE 'pending' END;

    UPDATE public.match_suggestions ms
       SET run_id            = 'v2_match_reset_' || to_char(now(), 'YYYYMMDD'),
           fit_score         = v_compat.overall_score,
           fit_index         = v_fit_index,
           section_scores    = jsonb_build_object(
             'environment',        v_compat.dimension_environment,
             'cleanliness',        v_compat.dimension_cleanliness,
             'communication',      v_compat.dimension_communication,
             'social',             v_compat.dimension_social,
             'logistics_context',  v_compat.dimension_logistics,
             'harmony',            v_compat.harmony_score,
             'context',            v_compat.context_score,
             'gate_conflicts',     v_compat.gate_conflicts,
             'soft_gate_override', v_compat.soft_gate_override,
             'algo',               'v2'
           ),
           algorithm_version = 'v2',
           status            = v_status,
           accepted_by       = ARRAY[]::uuid[],
           updated_at        = NOW()
     WHERE ms.id = r.id;
  END LOOP;
END $$;

-- ── F) Daily matching: require full v2 completion (5 modules + submission) ─────
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
          accepted_by       = CASE
            WHEN public.match_suggestions.status IN ('confirmed','declined')
            THEN public.match_suggestions.accepted_by
            ELSE EXCLUDED.accepted_by
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
