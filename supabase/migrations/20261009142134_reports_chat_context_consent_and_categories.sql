-- Extend report categories and store user consent + last-messages snapshot for moderation.
-- Applied to production 2026-10-09 (replaces unshipped 202604041400_*).

DO $$ BEGIN
  ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'swearing';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'account_misuse';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'impersonation';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'threats';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'scam_or_fraud';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE report_category ADD VALUE IF NOT EXISTS 'hate_or_discrimination';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS consent_read_recent_messages BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_read_recent_messages_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS chat_context_snapshot JSONB;

COMMENT ON COLUMN reports.consent_read_recent_messages IS 'Reporter agreed moderators may read recent chat messages for this report';
COMMENT ON COLUMN reports.consent_read_recent_messages_at IS 'Server timestamp when consent was recorded';
COMMENT ON COLUMN reports.chat_context_snapshot IS 'Up to 10 recent messages from the chat at report time (JSON array)';
