-- Add safety and moderation fields to messages table
-- This migration adds fields for tracking flagged messages, auto-flagging, and moderation

-- Add safety fields to messages table
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flagged_reason TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS auto_flagged BOOLEAN DEFAULT FALSE;

-- Add index for efficient querying of flagged messages
CREATE INDEX IF NOT EXISTS idx_messages_is_flagged ON messages(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_messages_flagged_at ON messages(flagged_at) WHERE flagged_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN messages.is_flagged IS 'Whether the message has been flagged for review';
COMMENT ON COLUMN messages.flagged_reason IS 'Array of reasons why the message was flagged (e.g., spam, profanity, suspicious_content)';
COMMENT ON COLUMN messages.flagged_at IS 'Timestamp when the message was flagged';
COMMENT ON COLUMN messages.auto_flagged IS 'Whether the message was automatically flagged by the system (vs manually reported by a user)';
