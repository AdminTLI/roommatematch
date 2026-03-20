-- Tracks which users already received which platform-update announcement emails.

CREATE TABLE IF NOT EXISTS announcement_email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_email_log_announcement_id
  ON announcement_email_log (announcement_id);

CREATE INDEX IF NOT EXISTS idx_announcement_email_log_user_id
  ON announcement_email_log (user_id);

