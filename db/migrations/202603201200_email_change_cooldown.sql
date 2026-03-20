-- Email change support: store last confirmed email-change timestamp
-- so we can enforce "once every 30 days" cooldown.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_email_change_at timestamptz;

COMMENT ON COLUMN users.last_email_change_at IS
  'When the user last confirmed an email change (used for 30-day cooldown on future email changes).';

