-- Onboarding sections storage for multi-step questionnaire

CREATE TABLE IF NOT EXISTS onboarding_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (
    section IN (
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

CREATE TABLE IF NOT EXISTS onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE onboarding_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upsert their onboarding sections" ON onboarding_sections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their onboarding submissions" ON onboarding_submissions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_onboarding_sections_updated_at ON onboarding_sections;
CREATE TRIGGER set_onboarding_sections_updated_at
BEFORE UPDATE ON onboarding_sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


