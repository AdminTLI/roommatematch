-- Remove DUO Data Migration
-- This migration removes all DUO-only programmes and converts programmes with both sources to SKDB-only
-- After this migration, all programmes will be sourced exclusively from SKDB

-- Step 1: Delete programmes that are DUO-only (have DUO source but no SKDB source)
-- These are programmes that were synced from DUO but never matched/enriched with SKDB data
DELETE FROM programmes
WHERE (sources->>'duo' = 'true')
  AND (sources->>'skdb' IS NULL OR sources->>'skdb' = 'false')
  AND (skdb_only IS NULL OR skdb_only = false);

-- Step 2: Update programmes that have both DUO and SKDB sources to be SKDB-only
-- Remove DUO flag from sources, keep SKDB flag, and set skdb_only = true (all are SKDB-only now)
UPDATE programmes
SET 
  sources = jsonb_set(
    COALESCE(sources, '{}'::jsonb),
    '{duo}',
    'false'::jsonb
  ),
  skdb_only = true
WHERE (sources->>'duo' = 'true')
  AND (sources->>'skdb' = 'true');

-- Step 3: Delete programmes that have rio_code but no SKDB data (DUO-only programmes)
-- These are programmes that were created from DUO but have no SKDB enrichment
DELETE FROM programmes
WHERE rio_code IS NOT NULL
  AND (sources->>'skdb' IS NULL OR sources->>'skdb' = 'false')
  AND (skdb_only IS NULL OR skdb_only = false)
  AND (croho_code IS NULL OR enrichment_status IS NULL OR enrichment_status = 'pending');

-- Step 4: Update remaining programmes to ensure they're marked as SKDB-only
-- Set skdb_only = true for programmes that don't have a rio_code (SKDB-only programmes)
UPDATE programmes
SET 
  skdb_only = true,
  sources = jsonb_set(
    COALESCE(sources, '{}'::jsonb),
    '{skdb}',
    'true'::jsonb
  )
WHERE rio_code IS NULL
  AND (skdb_only IS NULL OR skdb_only = false);

-- Step 5: Ensure all remaining programmes have SKDB source flag
UPDATE programmes
SET sources = jsonb_set(
  COALESCE(sources, '{}'::jsonb),
  '{skdb}',
  'true'::jsonb
)
WHERE sources->>'skdb' IS NULL OR sources->>'skdb' = 'false';

-- Add comment to table
COMMENT ON TABLE programmes IS 'SKDB-backed programme data synced from Studiekeuzedatabase. DUO data has been removed.';

