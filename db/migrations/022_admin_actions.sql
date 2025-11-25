-- Migration: Admin Actions Audit Logging
-- Creates table to audit all admin actions

CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_admin_actions_admin_user_id ON admin_actions (admin_user_id);
CREATE INDEX idx_admin_actions_entity_type ON admin_actions (entity_type);
CREATE INDEX idx_admin_actions_created_at ON admin_actions (created_at DESC);
CREATE INDEX idx_admin_actions_entity ON admin_actions (entity_type, entity_id) WHERE entity_type IS NOT NULL AND entity_id IS NOT NULL;

-- Enable RLS
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can read all admin actions
CREATE POLICY "Admins can read admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Service role can insert admin actions (for API routes)
CREATE POLICY "Service role can insert admin actions" ON admin_actions
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT SELECT ON admin_actions TO authenticated;








