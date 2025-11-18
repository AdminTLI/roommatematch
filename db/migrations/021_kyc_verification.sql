-- Migration: KYC Verification System
-- Creates tables for KYC provider integration (Veriff/Persona/Onfido)

-- Create provider enum type
CREATE TYPE kyc_provider AS ENUM ('veriff', 'persona', 'onfido');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- Verifications table
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider kyc_provider NOT NULL,
  provider_session_id VARCHAR(255) NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  review_reason TEXT,
  provider_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_session_id)
);

-- Verification webhooks audit table
CREATE TABLE verification_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider kyc_provider NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verifications_user_id ON verifications (user_id);
CREATE INDEX idx_verifications_provider_session_id ON verifications (provider_session_id);
CREATE INDEX idx_verifications_status ON verifications (status);
CREATE INDEX idx_verification_webhooks_processed ON verification_webhooks (processed);

-- Enable RLS
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verifications
-- Users can read their own verifications
CREATE POLICY "Users can read their own verifications" ON verifications
  FOR SELECT USING (user_id = auth.uid());

-- Service role can do everything (for webhooks)
CREATE POLICY "Service role can manage verifications" ON verifications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Admins can read verifications for users in their university
CREATE POLICY "Admins can read verifications in their university" ON verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN admins a ON a.university_id = p.university_id
      WHERE p.user_id = verifications.user_id
      AND a.user_id = auth.uid()
    )
  );

-- RLS Policies for verification_webhooks
-- Only service role can insert/update webhooks
CREATE POLICY "Service role can manage webhooks" ON verification_webhooks
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Admins can read webhooks
CREATE POLICY "Admins can read webhooks" ON verification_webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Function to update profile verification_status when verification is approved/rejected
CREATE OR REPLACE FUNCTION update_profile_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE profiles
    SET verification_status = 'verified',
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE profiles
    SET verification_status = 'failed',
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile status
CREATE TRIGGER trigger_update_profile_verification_status
  AFTER UPDATE OF status ON verifications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_profile_verification_status();

-- Grant permissions
GRANT SELECT ON verifications TO authenticated;
GRANT SELECT ON verification_webhooks TO authenticated;







