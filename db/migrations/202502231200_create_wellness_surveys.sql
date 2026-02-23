-- Migration: Wellness Check surveys (14-day and 30-day)
-- Used to prove platform value to universities; triggered on dashboard.

CREATE TABLE IF NOT EXISTS public.wellness_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_type VARCHAR(20) NOT NULL CHECK (survey_type IN ('day_14', 'day_30')),
  found_housing BOOLEAN NOT NULL,
  found_with_match BOOLEAN,
  reduced_stress BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, survey_type)
);

CREATE INDEX IF NOT EXISTS idx_wellness_surveys_user_id ON public.wellness_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_surveys_survey_type ON public.wellness_surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_wellness_surveys_created_at ON public.wellness_surveys(created_at);

COMMENT ON TABLE public.wellness_surveys IS 'Wellness check surveys at 14 and 30 days after signup; one response per user per survey type.';

-- RLS
ALTER TABLE public.wellness_surveys ENABLE ROW LEVEL SECURITY;

-- Authenticated users may insert their own row (user_id = auth.uid())
DROP POLICY IF EXISTS wellness_surveys_insert_own ON public.wellness_surveys;
CREATE POLICY wellness_surveys_insert_own
  ON public.wellness_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users may read their own rows
DROP POLICY IF EXISTS wellness_surveys_select_own ON public.wellness_surveys;
CREATE POLICY wellness_surveys_select_own
  ON public.wellness_surveys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
