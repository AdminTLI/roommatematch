-- Fix Supabase security lints:
-- - 0010_security_definer_view: ensure views run with invoker privileges (PG15+)
-- - 0013_rls_disabled_in_public: enable RLS on public tables exposed to PostgREST

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) Views: switch to SECURITY INVOKER (avoid creator/owner privileges + RLS bypass)
-- ---------------------------------------------------------------------------

-- user_study_year_v
-- IMPORTANT: keep the view's column shape stable (historically: user_id, study_year).
-- Postgres does not allow CREATE OR REPLACE VIEW to change/rename existing view columns.
CREATE OR REPLACE VIEW public.user_study_year_v
WITH (security_invoker = true)
AS
SELECT
  ua.user_id,
  CASE
    WHEN ua.study_start_month IS NOT NULL
      AND ua.graduation_month IS NOT NULL
      AND ua.expected_graduation_year IS NOT NULL
      AND ua.study_start_year IS NOT NULL
    THEN
      GREATEST(
        1,
        LEAST(
          (EXTRACT(YEAR FROM now())::int + CASE WHEN EXTRACT(MONTH FROM now()) >= 9 THEN 1 ELSE 0 END)
          - (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END)
          + 1,
          COALESCE(
            CASE
              WHEN ua.programme_duration_months IS NOT NULL THEN (ua.programme_duration_months / 12)::int + 1
              ELSE NULL
            END,
            (ua.expected_graduation_year + CASE WHEN ua.graduation_month >= 9 THEN 1 ELSE 0 END)
            - (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END)
            + 1
          )
        )
      )
    ELSE
      GREATEST(1, EXTRACT(YEAR FROM now())::int - ua.study_start_year + 1)
  END AS study_year
FROM public.user_academic ua;

COMMENT ON VIEW public.user_study_year_v IS 'View to calculate current academic year status using month-aware logic and programme duration. Falls back to calendar year calculation when months or expected_graduation_year are NULL. Academic year starts in September (month 9).';

-- confirmed_matches_summary (verification/monitoring view; invoker-safe)
CREATE OR REPLACE VIEW public.confirmed_matches_summary
WITH (security_invoker = true)
AS
SELECT
  kind,
  COUNT(*) AS count,
  MIN(created_at) AS oldest_confirmed,
  MAX(created_at) AS newest_confirmed,
  AVG(array_length(member_ids, 1)) AS avg_members
FROM public.match_suggestions
WHERE status = 'confirmed'
GROUP BY kind;

COMMENT ON VIEW public.confirmed_matches_summary IS 'Summary view of confirmed matches by kind. Useful for monitoring and verification.';

-- admin_analytics_responses (invoker-safe; relies on RLS policies on responses/profiles)
CREATE OR REPLACE VIEW public.admin_analytics_responses
WITH (security_invoker = true)
AS
SELECT
  r.question_key,
  r.value,
  COUNT(*) AS response_count,
  p.university_id
FROM public.responses r
JOIN public.profiles p ON p.user_id = r.user_id
GROUP BY r.question_key, r.value, p.university_id;

-- ---------------------------------------------------------------------------
-- 2) Tables: enable RLS (service role bypasses RLS; anon/authenticated blocked)
-- ---------------------------------------------------------------------------

ALTER TABLE public.exit_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_email_digest_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_email_log ENABLE ROW LEVEL SECURITY;

COMMIT;

