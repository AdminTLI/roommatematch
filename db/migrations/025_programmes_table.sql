-- Programme Data Migration: Create programmes table for DUO-backed programme data
-- This table stores programme data synced from DUO's "Overzicht Erkenningen ho" dataset
-- Separate from the existing 'programs' table to maintain legacy compatibility

-- Create custom types if they don't exist
DO $$ BEGIN
  CREATE TYPE programme_level AS ENUM ('bachelor', 'premaster', 'master');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE programme_sector AS ENUM ('hbo', 'wo', 'wo_special');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create programmes table
CREATE TABLE IF NOT EXISTS programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_slug VARCHAR(100) NOT NULL,
  brin_code VARCHAR(10),
  rio_code VARCHAR(50) UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  level programme_level NOT NULL,
  sector programme_sector NOT NULL,
  modes TEXT[] DEFAULT '{}',
  is_variant BOOLEAN DEFAULT false,
  discipline TEXT,
  sub_discipline TEXT,
  city TEXT,
  isat_code VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT programmes_rio_or_name_level CHECK (
    rio_code IS NOT NULL OR (institution_slug IS NOT NULL AND name IS NOT NULL AND level IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_programmes_institution_slug ON programmes(institution_slug);
CREATE INDEX IF NOT EXISTS idx_programmes_brin_code ON programmes(brin_code) WHERE brin_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programmes_rio_code ON programmes(rio_code) WHERE rio_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programmes_institution_level ON programmes(institution_slug, level);
CREATE INDEX IF NOT EXISTS idx_programmes_brin_level ON programmes(brin_code, level) WHERE brin_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programmes_level ON programmes(level);
CREATE INDEX IF NOT EXISTS idx_programmes_sector ON programmes(sector);
CREATE INDEX IF NOT EXISTS idx_programmes_name_search ON programmes USING gin(to_tsvector('english', name));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_programmes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_programmes_updated_at
  BEFORE UPDATE ON programmes
  FOR EACH ROW
  EXECUTE FUNCTION update_programmes_updated_at();

-- Enable RLS
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access, service_role write access
CREATE POLICY "programmes_read_public" ON programmes
  FOR SELECT
  USING (true);

-- Service role can do everything (for sync script)
CREATE POLICY "programmes_service_role" ON programmes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON programmes TO authenticated;
GRANT SELECT ON programmes TO anon;
GRANT ALL ON programmes TO service_role;

-- Add comment
COMMENT ON TABLE programmes IS 'DUO-backed programme data synced from "Overzicht Erkenningen ho" dataset';
COMMENT ON COLUMN programmes.rio_code IS 'DUO RIO OPLEIDINGSEENHEIDCODE - unique programme identifier';
COMMENT ON COLUMN programmes.brin_code IS 'DUO BRIN INSTELLINGSCODE - institution identifier';
COMMENT ON COLUMN programmes.institution_slug IS 'Internal institution slug matching universities.slug';
COMMENT ON COLUMN programmes.isat_code IS 'DUO ERKENDEOPLEIDINGSCODE (ISAT code) if available';







