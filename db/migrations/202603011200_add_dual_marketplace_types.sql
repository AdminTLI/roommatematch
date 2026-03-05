-- Migration: Add dual marketplace user type and student verification fields
-- Date: 2026-03-01
-- Description:
--   - Adds user_type, is_verified_student, university_email to profiles for cohort segregation
--     (Students vs Young Professionals must never match each other).
--   - Adds user_type to users so we can persist selection before a profile row exists.
--   - Do NOT alter RLS policies in this migration.

-- 1. profiles: cohort and verification columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS is_verified_student BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS university_email VARCHAR(255) NULL;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IS NULL OR user_type IN ('student', 'professional'));

COMMENT ON COLUMN profiles.user_type IS 'Cohort for dual marketplace: student or professional. Used to strictly segregate matching.';
COMMENT ON COLUMN profiles.is_verified_student IS 'True when student has verified via university email (future use).';
COMMENT ON COLUMN profiles.university_email IS 'University/institution email used for student verification (future use).';

-- 2. users: user_type only (persist at path selection before profile exists)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NULL;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE users
  ADD CONSTRAINT users_user_type_check
  CHECK (user_type IS NULL OR user_type IN ('student', 'professional'));

COMMENT ON COLUMN users.user_type IS 'Cohort selected at onboarding path step; synced to profiles when profile is created.';
