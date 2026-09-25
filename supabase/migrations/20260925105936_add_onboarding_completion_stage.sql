-- Split questionnaire completion into context-only vs full (harmony) stages.
-- Existing submissions are treated as 'full' so current users keep full access.

ALTER TABLE public.onboarding_submissions
  ADD COLUMN IF NOT EXISTS completion_stage text;

ALTER TABLE public.onboarding_submissions
  DROP CONSTRAINT IF EXISTS onboarding_submissions_completion_stage_check;

ALTER TABLE public.onboarding_submissions
  ADD CONSTRAINT onboarding_submissions_completion_stage_check
  CHECK (completion_stage IS NULL OR completion_stage IN ('context', 'full'));

COMMENT ON COLUMN public.onboarding_submissions.completion_stage IS
  'context = intro + logistics/context only (dashboard access); full = all harmony modules complete. NULL legacy rows are treated as full.';

-- Backfill: any existing submission without a stage is a completed full questionnaire
UPDATE public.onboarding_submissions
SET completion_stage = 'full'
WHERE completion_stage IS NULL;

ALTER TABLE public.onboarding_submissions
  ALTER COLUMN completion_stage SET DEFAULT 'full';

CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_completion_stage
  ON public.onboarding_submissions (completion_stage);
