-- Migration: Data Retention Policies
-- This migration adds retention tracking columns and cleanup functions

-- Add retention_expires_at to verifications table
ALTER TABLE verifications
ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMP WITH TIME ZONE;

-- Add retention_expires_at to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMP WITH TIME ZONE;

-- Add retention_expires_at to match_suggestions (if table exists)
-- Note: This assumes match_suggestions table exists, adjust if needed
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'match_suggestions') THEN
    ALTER TABLE match_suggestions
    ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add retention_expires_at to reports table
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMP WITH TIME ZONE;

-- Add retention_expires_at to app_events table
ALTER TABLE app_events
ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for efficient retention queries
CREATE INDEX IF NOT EXISTS idx_verifications_retention_expires ON verifications(retention_expires_at) 
  WHERE retention_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_retention_expires ON messages(retention_expires_at) 
  WHERE retention_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_retention_expires ON reports(retention_expires_at) 
  WHERE retention_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_events_retention_expires ON app_events(retention_expires_at) 
  WHERE retention_expires_at IS NOT NULL;

-- Function to set retention expiry for verification documents (4 weeks per Dutch law)
CREATE OR REPLACE FUNCTION set_verification_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 4 weeks (28 days) after verification update
  IF NEW.status = 'approved' AND NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := NOW() + INTERVAL '28 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention expiry on verification approval
DROP TRIGGER IF EXISTS trigger_set_verification_retention ON verifications;
CREATE TRIGGER trigger_set_verification_retention
  BEFORE INSERT OR UPDATE ON verifications
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_retention();

-- Function to set retention expiry for messages (1 year after last message in chat)
CREATE OR REPLACE FUNCTION set_message_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 1 year (365 days) after message creation
  IF NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := NOW() + INTERVAL '365 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention expiry on message creation
DROP TRIGGER IF EXISTS trigger_set_message_retention ON messages;
CREATE TRIGGER trigger_set_message_retention
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_retention();

-- Function to set retention expiry for reports (1 year after resolution)
CREATE OR REPLACE FUNCTION set_report_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 1 year (365 days) after report is resolved
  IF NEW.status IN ('actioned', 'dismissed') AND NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := NOW() + INTERVAL '365 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention expiry on report resolution
DROP TRIGGER IF EXISTS trigger_set_report_retention ON reports;
CREATE TRIGGER trigger_set_report_retention
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION set_report_retention();

-- Function to set retention expiry for app_events (90 days)
CREATE OR REPLACE FUNCTION set_app_event_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 90 days after event creation
  IF NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := NOW() + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention expiry on app event creation
DROP TRIGGER IF EXISTS trigger_set_app_event_retention ON app_events;
CREATE TRIGGER trigger_set_app_event_retention
  BEFORE INSERT ON app_events
  FOR EACH ROW
  EXECUTE FUNCTION set_app_event_retention();

-- Function to purge expired verification documents (after 4 weeks)
CREATE OR REPLACE FUNCTION purge_expired_verifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete verification records that have passed retention period
  -- Note: Actual document files in storage should be deleted separately
  DELETE FROM verifications
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purge expired messages (after 1 year)
CREATE OR REPLACE FUNCTION purge_expired_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM messages
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purge expired reports (after 1 year)
CREATE OR REPLACE FUNCTION purge_expired_reports()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM reports
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < NOW()
    AND status IN ('actioned', 'dismissed');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purge expired app events (after 90 days)
CREATE OR REPLACE FUNCTION purge_expired_app_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM app_events
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize inactive accounts (after 2 years)
CREATE OR REPLACE FUNCTION anonymize_inactive_accounts()
RETURNS INTEGER AS $$
DECLARE
  anonymized_count INTEGER;
  two_years_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  two_years_ago := NOW() - INTERVAL '2 years';
  
  -- Anonymize user data (set to generic values)
  UPDATE profiles
  SET 
    first_name = 'Deleted',
    last_name = 'User',
    phone = NULL,
    bio = NULL,
    updated_at = NOW()
  WHERE user_id IN (
    SELECT id FROM users
    WHERE updated_at < two_years_ago
      AND is_active = false
  );
  
  GET DIAGNOSTICS anonymized_count = ROW_COUNT;
  RETURN anonymized_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION purge_expired_verifications() TO service_role;
GRANT EXECUTE ON FUNCTION purge_expired_messages() TO service_role;
GRANT EXECUTE ON FUNCTION purge_expired_reports() TO service_role;
GRANT EXECUTE ON FUNCTION purge_expired_app_events() TO service_role;
GRANT EXECUTE ON FUNCTION anonymize_inactive_accounts() TO service_role;

