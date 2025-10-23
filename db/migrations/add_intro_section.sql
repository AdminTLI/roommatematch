-- Add 'intro' section to onboarding_sections CHECK constraint
-- Run this in Supabase SQL Editor to allow intro page saving

-- Drop the existing check constraint
ALTER TABLE onboarding_sections DROP CONSTRAINT IF EXISTS onboarding_sections_section_check;

-- Add the new check constraint with 'intro' included
ALTER TABLE onboarding_sections ADD CONSTRAINT onboarding_sections_section_check 
CHECK (
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
);

-- Verify the constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'onboarding_sections_section_check';
