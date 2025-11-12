-- Migration: DSAR (Data Subject Access Request) System
-- This migration creates tables and functions for GDPR-compliant data export and deletion requests

-- DSAR Request Types
CREATE TYPE dsar_request_type AS ENUM ('export', 'deletion', 'rectification', 'portability', 'restriction', 'objection');
CREATE TYPE dsar_request_status AS ENUM ('pending', 'in_progress', 'completed', 'rejected', 'cancelled');

-- DSAR Requests table
CREATE TABLE dsar_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type dsar_request_type NOT NULL,
  status dsar_request_status NOT NULL DEFAULT 'pending',
  
  -- Request details
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL, -- 30 days from request for GDPR
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Processing information
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  processing_metadata JSONB DEFAULT '{}',
  
  -- Export-specific fields
  export_file_url TEXT, -- URL to exported data file
  export_format VARCHAR(20) DEFAULT 'json', -- 'json' or 'csv'
  
  -- Deletion-specific fields
  deletion_scheduled_at TIMESTAMP WITH TIME ZONE, -- Grace period start
  deletion_grace_period_days INTEGER DEFAULT 7,
  deletion_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_dsar_requests_user_id ON dsar_requests(user_id);
CREATE INDEX idx_dsar_requests_status ON dsar_requests(status);
CREATE INDEX idx_dsar_requests_type ON dsar_requests(request_type);
CREATE INDEX idx_dsar_requests_sla_deadline ON dsar_requests(sla_deadline);
CREATE INDEX idx_dsar_requests_created_at ON dsar_requests(created_at);

-- Enable RLS
ALTER TABLE dsar_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own DSAR requests
CREATE POLICY "Users can read own dsar requests" ON dsar_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own DSAR requests
CREATE POLICY "Users can create own dsar requests" ON dsar_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all DSAR requests
CREATE POLICY "Service role can manage dsar requests" ON dsar_requests
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Admins can read all DSAR requests
CREATE POLICY "Admins can read all dsar requests" ON dsar_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Function to automatically set SLA deadline (30 days from request)
CREATE OR REPLACE FUNCTION set_dsar_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sla_deadline IS NULL THEN
    NEW.sla_deadline := NEW.requested_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set SLA deadline on insert
CREATE TRIGGER trigger_set_dsar_sla_deadline
  BEFORE INSERT ON dsar_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_dsar_sla_deadline();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dsar_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_dsar_requests_updated_at
  BEFORE UPDATE ON dsar_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_dsar_requests_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON dsar_requests TO authenticated;
GRANT ALL ON dsar_requests TO service_role;

-- Function to check if user has pending export request (rate limiting: 1 per 24 hours)
CREATE OR REPLACE FUNCTION has_recent_export_request(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  recent_request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_request_count
  FROM dsar_requests
  WHERE user_id = p_user_id
    AND request_type = 'export'
    AND requested_at > NOW() - INTERVAL '24 hours'
    AND status IN ('pending', 'in_progress', 'completed');
  
  RETURN recent_request_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

