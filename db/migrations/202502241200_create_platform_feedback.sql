-- Migration: Platform Success & NPS Micro-Survey
-- Captures roommate placement status and NPS for Domu Match.

CREATE TABLE IF NOT EXISTS public.platform_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- How the user ultimately found a roommate (if at all)
  -- 'domu_match'    - found through Domu Match
  -- 'external'      - found somewhere else
  -- 'still_looking' - has not yet found a roommate
  success_status VARCHAR(32) CHECK (success_status IN ('domu_match', 'external', 'still_looking')),
  -- Standard NPS score (0–10); nullable when survey dismissed
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  -- Optional free‑text reason explaining the score
  reason TEXT,
  -- Overall interaction outcome for this micro-survey
  -- 'completed' - user answered all required questions and submitted
  -- 'dismissed' - user closed/dismissed the widget without completing
  status VARCHAR(32) NOT NULL CHECK (status IN ('completed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure each user is only surveyed once
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_feedback_user_id ON public.platform_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_status ON public.platform_feedback(status);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_created_at ON public.platform_feedback(created_at);

COMMENT ON TABLE public.platform_feedback IS 'Platform success & NPS micro-survey responses; one record per user capturing roommate placement outcome and NPS score.';

-- RLS
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;

-- Authenticated users may insert their own row (user_id = auth.uid())
DROP POLICY IF EXISTS platform_feedback_insert_own ON public.platform_feedback;
CREATE POLICY platform_feedback_insert_own
  ON public.platform_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users may read their own row
DROP POLICY IF EXISTS platform_feedback_select_own ON public.platform_feedback;
CREATE POLICY platform_feedback_select_own
  ON public.platform_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

