-- Migration: Cookie Consent Tracking System
-- This migration creates tables for GDPR-compliant cookie and tracking consent management

-- Consent Types
CREATE TYPE consent_type AS ENUM (
  'essential',
  'analytics',
  'error_tracking',
  'session_replay',
  'marketing'
);

-- Consent Status
CREATE TYPE consent_status AS ENUM ('granted', 'withdrawn', 'pending');

-- User Consents table
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Consent details
  consent_type consent_type NOT NULL,
  status consent_status NOT NULL DEFAULT 'granted',
  
  -- Audit trail
  ip_address VARCHAR(45),
  user_agent TEXT,
  consent_method VARCHAR(50) DEFAULT 'banner', -- 'banner', 'preference_center', 'api'
  
  -- Timestamps
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one active consent per type per user
  UNIQUE(user_id, consent_type, status) WHERE status = 'granted'
);

-- Indexes for efficient queries
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX idx_user_consents_status ON user_consents(status);
CREATE INDEX idx_user_consents_granted_at ON user_consents(granted_at);

-- Enable RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own consents
CREATE POLICY "Users can read own consents" ON user_consents
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can create their own consents
CREATE POLICY "Users can create own consents" ON user_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own consents
CREATE POLICY "Users can update own consents" ON user_consents
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Service role can manage all consents
CREATE POLICY "Service role can manage consents" ON user_consents
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_consents_updated_at();

-- Function to get user's active consents (including anonymous)
CREATE OR REPLACE FUNCTION get_user_active_consents(p_user_id UUID, p_session_id TEXT)
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
  WHERE (uc.user_id = p_user_id OR (uc.user_id IS NULL AND p_session_id IS NOT NULL))
    AND uc.status = 'granted'
    AND uc.withdrawn_at IS NULL
  ORDER BY uc.granted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_consents TO authenticated;
GRANT ALL ON user_consents TO service_role;

