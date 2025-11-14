-- SKDB Programme Fields: Add Studiekeuzedatabase-specific fields to programmes table
-- This migration extends the programmes table with SKDB enrichment fields:
-- ECTS credits, duration, admission requirements, source tracking, and SKDB-only flag
-- Part of SKDB integration to enrich DUO programme data

-- Add SKDB-specific columns
ALTER TABLE programmes
  ADD COLUMN IF NOT EXISTS ects_credits INTEGER,
  ADD COLUMN IF NOT EXISTS duration_years DECIMAL(3,1),
  ADD COLUMN IF NOT EXISTS duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS admission_requirements TEXT,
  ADD COLUMN IF NOT EXISTS skdb_only BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skdb_updated_at TIMESTAMPTZ;

-- Create indexes for SKDB fields
CREATE INDEX IF NOT EXISTS idx_programmes_ects ON programmes(ects_credits) WHERE ects_credits IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programmes_skdb_only ON programmes(skdb_only) WHERE skdb_only = true;
CREATE INDEX IF NOT EXISTS idx_programmes_sources ON programmes USING gin(sources);
CREATE INDEX IF NOT EXISTS idx_programmes_skdb_updated_at ON programmes(skdb_updated_at) WHERE skdb_updated_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN programmes.ects_credits IS 'ECTS credit points from Studiekeuzedatabase';
COMMENT ON COLUMN programmes.duration_years IS 'Official programme duration in years (e.g., 3.0, 1.5) from Studiekeuzedatabase';
COMMENT ON COLUMN programmes.duration_months IS 'Alternative programme duration in months from Studiekeuzedatabase';
COMMENT ON COLUMN programmes.admission_requirements IS 'Admission requirements and notes from Studiekeuzedatabase';
COMMENT ON COLUMN programmes.skdb_only IS 'Flag indicating this programme exists only in SKDB (no DUO match found)';
COMMENT ON COLUMN programmes.sources IS 'JSONB object tracking data sources: { duo: boolean, skdb: boolean }';
COMMENT ON COLUMN programmes.skdb_updated_at IS 'Timestamp when programme was last synced from Studiekeuzedatabase';
COMMENT ON COLUMN programmes.metadata IS 'JSONB metadata field. Can store SKDB name variants (metadata.skdb_name) when SKDB name differs from DUO name';

