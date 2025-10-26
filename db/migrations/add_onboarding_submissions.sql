CREATE TABLE IF NOT EXISTS onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_user_id 
  ON onboarding_submissions(user_id);

ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_submissions' AND policyname = 'onboarding_submissions_own') THEN
    CREATE POLICY onboarding_submissions_own ON onboarding_submissions
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
