-- Add user_type to onboarding_submissions so we can distinguish student vs professional questionnaire completion.
-- Professionals must complete the young professionals flow; completion is only valid when submission.user_type matches the user's cohort.

ALTER TABLE onboarding_submissions
  ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NULL;

ALTER TABLE onboarding_submissions
  DROP CONSTRAINT IF EXISTS onboarding_submissions_user_type_check;

ALTER TABLE onboarding_submissions
  ADD CONSTRAINT onboarding_submissions_user_type_check
  CHECK (user_type IS NULL OR user_type IN ('student', 'professional'));

COMMENT ON COLUMN onboarding_submissions.user_type IS 'Cohort at time of submission: student or professional. Used to gate dashboard/matches by cohort-specific questionnaire completion.';

-- Backfill: set user_type from users table where we have a matching user
UPDATE onboarding_submissions os
SET user_type = u.user_type
FROM public.users u
WHERE os.user_id = u.id
  AND os.user_type IS NULL
  AND (u.user_type = 'student' OR u.user_type = 'professional');

CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_user_type
  ON onboarding_submissions(user_type);
