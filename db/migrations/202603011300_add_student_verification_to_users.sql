-- Store student verification on users so we can persist before a profile row exists.
-- Profiles get these via sync when profile is created/updated (e.g. intro save).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_verified_student BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS university_email VARCHAR(255) NULL;

COMMENT ON COLUMN users.is_verified_student IS 'True when user verified via university email OTP (student path).';
COMMENT ON COLUMN users.university_email IS 'University email used for student verification.';
