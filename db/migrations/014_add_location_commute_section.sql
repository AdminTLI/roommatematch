-- Add location-commute section to onboarding_sections table

-- Drop the existing check constraint
ALTER TABLE onboarding_sections DROP CONSTRAINT IF EXISTS onboarding_sections_section_check;

-- Add the new check constraint with location-commute included
ALTER TABLE onboarding_sections ADD CONSTRAINT onboarding_sections_section_check 
CHECK (
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
);
