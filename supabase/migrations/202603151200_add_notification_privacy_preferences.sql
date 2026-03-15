-- Add notification and privacy preference columns to profiles.
-- Used by Settings > Account (notifications) and Settings > Privacy.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"emailMatches":true,"emailMessages":true,"emailUpdates":true,"pushMatches":true,"pushMessages":true}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"showInMatches":true,"allowMessages":true,"dataSharing":true}'::jsonb;

COMMENT ON COLUMN profiles.notification_preferences IS 'User preferences for email/push notifications: emailMatches, emailMessages, emailUpdates, pushMatches, pushMessages';
COMMENT ON COLUMN profiles.privacy_settings IS 'User privacy toggles: showInMatches, allowMessages, dataSharing (profileVisible uses is_visible)';
