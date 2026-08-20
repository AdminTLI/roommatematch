-- Add 5 new v2 section keys to onboarding_sections CHECK constraint
-- Keeps all 9 legacy keys so existing users' rows are not orphaned.

ALTER TABLE public.onboarding_sections
  DROP CONSTRAINT IF EXISTS onboarding_sections_section_check;

ALTER TABLE public.onboarding_sections
  ADD CONSTRAINT onboarding_sections_section_check
  CHECK (
    section IN (
      -- legacy v1 (all values currently in the table)
      'intro',
      'location-commute',
      'personality-values',
      'sleep-circadian',
      'noise-sensory',
      'home-operations',
      'social-hosting-language',
      'communication-conflict',
      'privacy-territoriality',
      'reliability-logistics',
      -- v2 (new 5-module questionnaire)
      'logistics-context',
      'environment-rhythms',
      'cleanliness-operations',
      'communication-resolution',
      'social-spaces'
    )
  );
