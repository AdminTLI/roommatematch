-- Notification email digest state (matches 72h, messages 24h)
-- Used to avoid sending duplicate digest emails every cron run.

CREATE TABLE IF NOT EXISTS notification_email_digest_state (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_matches_last_sent_at TIMESTAMPTZ,
  email_messages_last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_email_digest_state_email_matches_last_sent_at
  ON notification_email_digest_state (email_matches_last_sent_at);

CREATE INDEX IF NOT EXISTS idx_notification_email_digest_state_email_messages_last_sent_at
  ON notification_email_digest_state (email_messages_last_sent_at);

-- Backfill rows for existing users.
-- If a profile exists, we create a digest state row lazily for it.
INSERT INTO notification_email_digest_state (user_id)
SELECT p.user_id
FROM profiles p
ON CONFLICT (user_id) DO NOTHING;

-- Ensure updated_at moves forward when we update state.
CREATE OR REPLACE FUNCTION set_notification_email_digest_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notification_email_digest_state_updated_at ON notification_email_digest_state;
CREATE TRIGGER trg_notification_email_digest_state_updated_at
  BEFORE UPDATE ON notification_email_digest_state
  FOR EACH ROW
  EXECUTE FUNCTION set_notification_email_digest_state_updated_at();

