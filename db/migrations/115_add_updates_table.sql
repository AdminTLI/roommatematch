-- Updates/Changelog Table
-- This migration adds a table for storing platform updates and release notes

-- Create enum type for change_type (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE update_change_type AS ENUM ('major', 'minor', 'patch');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table for platform updates
CREATE TABLE IF NOT EXISTS updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Version information
    version VARCHAR(20) NOT NULL UNIQUE, -- e.g., "V1.2.3"
    release_date DATE NOT NULL,
    change_type update_change_type NOT NULL DEFAULT 'patch',
    
    -- Update content
    changes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of strings (bullet points)
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries (create if not exists)
CREATE INDEX IF NOT EXISTS idx_updates_release_date ON updates(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_updates_version ON updates(version DESC);
CREATE INDEX IF NOT EXISTS idx_updates_change_type ON updates(change_type);

-- RLS Policies
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if user is admin (avoids RLS recursion)
-- This function runs with elevated privileges to bypass RLS and prevent recursion
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- SECURITY DEFINER allows this function to bypass RLS
  -- This prevents infinite recursion when checking admin status
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- All authenticated users can view updates (drop and recreate to avoid conflicts)
-- Using true is safe because Supabase REST API requires authentication tokens
DROP POLICY IF EXISTS "Users can view updates" ON updates;
CREATE POLICY "Users can view updates" ON updates
    FOR SELECT
    USING (true);

-- Admins can manage all updates (drop and recreate to avoid conflicts)
-- Use security definer function to avoid recursion
DROP POLICY IF EXISTS "Admins can manage updates" ON updates;
CREATE POLICY "Admins can manage updates" ON updates
    FOR ALL
    USING (is_admin_user());

-- Comments
COMMENT ON TABLE updates IS 'Platform updates and release notes displayed on user dashboard';
COMMENT ON COLUMN updates.version IS 'Semantic version string (e.g., V1.2.3)';
COMMENT ON COLUMN updates.release_date IS 'Date when the update was released';
COMMENT ON COLUMN updates.change_type IS 'Type of change: major, minor, or patch';
COMMENT ON COLUMN updates.changes IS 'JSONB array of change descriptions (bullet points)';

