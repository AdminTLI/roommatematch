-- Migration: Add preferred_cities columns for soft location preferences
-- Date: 2026-02-25
-- Description:
--   - Adds preferred_cities text[] column to profiles to store roommate location preferences
--   - Adds preferred_cities text[] column to onboarding_submissions snapshot for analytics/debugging
--   - Location is a soft preference used in the matching engine, not a hard filter

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_cities TEXT[] DEFAULT '{}'::TEXT[];

ALTER TABLE onboarding_submissions
  ADD COLUMN IF NOT EXISTS preferred_cities TEXT[] DEFAULT '{}'::TEXT[];

COMMENT ON COLUMN profiles.preferred_cities IS
  'Array of up to 5 preferred cities for roommate matching (soft location preference).';

COMMENT ON COLUMN onboarding_submissions.preferred_cities IS
  'Denormalized copy of preferred_cities captured at onboarding submission time for analysis.';

