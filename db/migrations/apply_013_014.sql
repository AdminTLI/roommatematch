-- Apply migrations 013 and 014: Add onboarding tables
-- Run this in Supabase SQL Editor to fix the missing onboarding_sections table error

-- Onboarding sections storage for multi-step questionnaire
CREATE TABLE IF NOT EXISTS onboarding_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (
    section IN (
      'intro',
      'location-commute',
      'personality-values',
      'sleep-circadian',
      'noise-sensory',
      'home-operations',
      'social-hosting-language',
      'communication-conflict',
      'privacy-territoriality',
      'reliability-logistics'
    )
  ),
  answers JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT 'rmq-v1',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, section)
);

-- Onboarding submissions for final questionnaire snapshots
CREATE TABLE IF NOT EXISTS onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add unique constraint to existing onboarding_submissions table if it exists
ALTER TABLE onboarding_submissions ADD CONSTRAINT IF NOT EXISTS onboarding_submissions_user_id_unique UNIQUE (user_id);

-- Enable RLS
ALTER TABLE onboarding_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "onboarding_sections_own" ON onboarding_sections
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "onboarding_submissions_own" ON onboarding_submissions
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_sections_user_id ON onboarding_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sections_section ON onboarding_sections(section);
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_user_id ON onboarding_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_submitted_at ON onboarding_submissions(submitted_at);

-- Create trigger for updated_at
CREATE TRIGGER update_onboarding_sections_updated_at
  BEFORE UPDATE ON onboarding_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('onboarding_sections', 'onboarding_submissions')
  AND schemaname = 'public';
