-- Fix verifications table structure
-- Ensures the table has the correct schema for KYC providers (Persona/Veriff/Onfido)

-- Create types if they don't exist
DO $$ BEGIN
  CREATE TYPE kyc_provider AS ENUM ('veriff', 'persona', 'onfido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop the old verifications table if it has the wrong structure
-- (Only if it has id_document_path and selfie_path columns)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'verifications' 
    AND column_name = 'id_document_path'
  ) THEN
    DROP TABLE IF EXISTS verifications CASCADE;
  END IF;
END $$;

-- Create verifications table with correct structure
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider kyc_provider NOT NULL,
  provider_session_id VARCHAR(255) NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  review_reason TEXT,
  provider_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_session_id)
);

-- Add missing columns if table exists but is missing them
ALTER TABLE verifications 
  ADD COLUMN IF NOT EXISTS provider kyc_provider,
  ADD COLUMN IF NOT EXISTS provider_session_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS provider_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS review_reason TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix foreign key if it references users instead of auth.users
DO $$ 
BEGIN
  -- Check if foreign key exists and points to wrong table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'verifications'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
      AND kcu.table_schema = 'public'
  ) THEN
    -- Drop the old foreign key
    ALTER TABLE verifications DROP CONSTRAINT IF EXISTS verifications_user_id_fkey;
    -- Add correct foreign key
    ALTER TABLE verifications 
      ADD CONSTRAINT verifications_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_provider_session_id ON verifications (provider_session_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications (status);

-- Enable RLS
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can read their own verifications" ON verifications;
DROP POLICY IF EXISTS "Service role can manage verifications" ON verifications;
DROP POLICY IF EXISTS "Admins can read verifications in their university" ON verifications;

-- RLS Policies for verifications
-- Users can read their own verifications
CREATE POLICY "Users can read their own verifications" ON verifications
  FOR SELECT USING (user_id = auth.uid());

-- Service role can do everything (for webhooks and API)
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

-- Grant permissions
GRANT SELECT ON verifications TO authenticated;

