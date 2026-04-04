-- Extend report categories and store user consent + last-messages snapshot for moderation.

ALTER TYPE report_category ADD VALUE 'swearing';
ALTER TYPE report_category ADD VALUE 'account_misuse';
ALTER TYPE report_category ADD VALUE 'impersonation';
ALTER TYPE report_category ADD VALUE 'threats';
ALTER TYPE report_category ADD VALUE 'scam_or_fraud';
ALTER TYPE report_category ADD VALUE 'hate_or_discrimination';

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS consent_read_recent_messages BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_read_recent_messages_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS chat_context_snapshot JSONB;

COMMENT ON COLUMN reports.consent_read_recent_messages IS 'Reporter agreed moderators may read recent chat messages for this report';
COMMENT ON COLUMN reports.consent_read_recent_messages_at IS 'Server timestamp when consent was recorded';
COMMENT ON COLUMN reports.chat_context_snapshot IS 'Up to 10 recent messages from the chat at report time (JSON array)';
