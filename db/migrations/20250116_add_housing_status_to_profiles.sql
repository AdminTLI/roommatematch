-- Migration: Add Housing Status to Profiles
-- Date: 2025-01-16
-- Description: Adds housing_status array column to profiles table to store user housing status selections

BEGIN;

-- ============================================
-- 1. ADD HOUSING_STATUS COLUMN
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS housing_status TEXT[] DEFAULT '{}';

-- ============================================
-- 2. CREATE INDEX FOR ARRAY QUERIES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_housing_status ON profiles USING GIN (housing_status);

-- ============================================
-- 3. ADD COMMENT
-- ============================================
COMMENT ON COLUMN profiles.housing_status IS 'Array of housing status values: seeking_room, offering_room, team_up, exploring';

COMMIT;
