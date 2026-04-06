-- Platform Success & NPS micro-survey (was only under db/migrations; sync for Supabase-hosted DBs)

CREATE TABLE IF NOT EXISTS public.platform_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  success_status VARCHAR(32) CHECK (success_status IN ('domu_match', 'external', 'still_looking')),
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  reason TEXT,
  status VARCHAR(32) NOT NULL CHECK (status IN ('completed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_feedback_user_id ON public.platform_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_status ON public.platform_feedback(status);
CREATE INDEX IF NOT EXISTS idx_platform_feedback_created_at ON public.platform_feedback(created_at);

COMMENT ON TABLE public.platform_feedback IS 'Platform success & NPS micro-survey responses; one record per user capturing roommate placement outcome and NPS score.';

ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_feedback_insert_own ON public.platform_feedback;
CREATE POLICY platform_feedback_insert_own
  ON public.platform_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS platform_feedback_select_own ON public.platform_feedback;
CREATE POLICY platform_feedback_select_own
  ON public.platform_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
