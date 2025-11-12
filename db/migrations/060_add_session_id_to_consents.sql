-- Migration: Add Session ID Hash to Consent Tracking
-- This migration adds session_id_hash column to track anonymous visitor consents
-- Session IDs are hashed (SHA-256) for privacy while allowing consent tracking

-- Add session_id_hash column to user_consents table
ALTER TABLE user_consents 
ADD COLUMN session_id_hash VARCHAR(64);

-- Add index for efficient queries by session_id_hash
CREATE INDEX idx_user_consents_session_id_hash ON user_consents(session_id_hash);

-- Update the partial unique index to include session_id_hash for anonymous users
-- Drop the old unique index
DROP INDEX IF EXISTS idx_user_consents_unique_active;

-- Create new unique index that handles both authenticated and anonymous users
CREATE UNIQUE INDEX idx_user_consents_unique_active 
  ON user_consents(
    COALESCE(user_id::text, '') || '|' || COALESCE(session_id_hash, ''),
    consent_type
  ) 
  WHERE status = 'granted' AND withdrawn_at IS NULL;

-- Update RLS policies to allow anonymous users to query by session_id_hash
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can create own consents" ON user_consents;
DROP POLICY IF EXISTS "Users can update own consents" ON user_consents;

-- Users can read their own consents (by user_id or session_id_hash)
CREATE POLICY "Users can read own consents" ON user_consents
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (user_id IS NULL AND session_id_hash IS NOT NULL)
  );

-- Users can create their own consents (by user_id or session_id_hash)
CREATE POLICY "Users can create own consents" ON user_consents
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR (user_id IS NULL AND session_id_hash IS NOT NULL)
  );

-- Users can update their own consents (by user_id or session_id_hash)
CREATE POLICY "Users can update own consents" ON user_consents
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (user_id IS NULL AND session_id_hash IS NOT NULL)
  );

-- Update get_user_active_consents function to use session_id_hash
CREATE OR REPLACE FUNCTION get_user_active_consents(
  p_user_id UUID, 
  p_session_id_hash VARCHAR(64)
)
RETURNS TABLE (
  consent_type consent_type,
  granted BOOLEAN,
  granted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.consent_type,
    TRUE as granted,
    uc.granted_at
  FROM user_consents uc
  WHERE (
    (p_user_id IS NOT NULL AND uc.user_id = p_user_id)
    OR (p_user_id IS NULL AND p_session_id_hash IS NOT NULL AND uc.session_id_hash = p_session_id_hash)
  )
    AND uc.status = 'granted'
    AND uc.withdrawn_at IS NULL
  ORDER BY uc.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

