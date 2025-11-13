-- Programme Enrichment: Add Studiekeuzedatabase fields to programmes table
-- This migration extends the programmes table with enrichment fields from Studiekeuzedatabase
-- to provide complete programme information combining DUO and Studiekeuzedatabase data sources

-- Add enrichment columns
ALTER TABLE programmes
  ADD COLUMN IF NOT EXISTS croho_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS language_codes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(20) DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'enriched', 'failed', 'not_found')),
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

-- Create indexes for enrichment fields
CREATE INDEX IF NOT EXISTS idx_programmes_croho_code ON programmes(croho_code) WHERE croho_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programmes_active ON programmes(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_programmes_enrichment_status ON programmes(enrichment_status);

-- Add unique constraint on croho_code (if not null)
-- Note: PostgreSQL allows multiple NULLs in unique constraints, so this works correctly
CREATE UNIQUE INDEX IF NOT EXISTS idx_programmes_croho_unique ON programmes(croho_code) WHERE croho_code IS NOT NULL;

-- Add comments
COMMENT ON COLUMN programmes.croho_code IS 'CROHO code from Studiekeuzedatabase (Central Register of Higher Education Programmes)';
COMMENT ON COLUMN programmes.language_codes IS 'Array of language codes (e.g., ["nl", "en"]) indicating programme languages';
COMMENT ON COLUMN programmes.faculty IS 'Faculty or department name from Studiekeuzedatabase';
COMMENT ON COLUMN programmes.active IS 'Whether the programme is currently active/offered';
COMMENT ON COLUMN programmes.enrichment_status IS 'Status of enrichment: pending (not yet enriched), enriched (successfully enriched), failed (enrichment failed), not_found (no match found in Studiekeuzedatabase)';
COMMENT ON COLUMN programmes.enriched_at IS 'Timestamp when enrichment was last performed';



