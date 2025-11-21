-- Complete DUO Removal Migration
-- This migration ensures ALL DUO data is removed and all programmes are SKDB-only
-- Run this if you still see DUO data after the initial migration

-- Step 1: Delete ALL programmes that have DUO source (even if they also have SKDB)
DELETE FROM programmes
WHERE sources->>'duo' = 'true';

-- Step 2: Delete ALL programmes with rio_code (DUO identifier)
-- Keep only programmes that are truly SKDB-only (no rio_code)
DELETE FROM programmes
WHERE rio_code IS NOT NULL;

-- Step 3: Ensure all remaining programmes are marked as SKDB-only
UPDATE programmes
SET 
  skdb_only = true,
  sources = jsonb_build_object('duo', false, 'skdb', true),
  rio_code = NULL
WHERE skdb_only IS NOT true 
   OR sources->>'skdb' IS NULL 
   OR sources->>'skdb' = 'false'
   OR sources->>'duo' = 'true';

-- Step 4: Verify no DUO data remains
-- This will show you if there are any remaining issues
DO $$
DECLARE
  duo_count INTEGER;
  rio_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duo_count
  FROM programmes
  WHERE sources->>'duo' = 'true';
  
  SELECT COUNT(*) INTO rio_count
  FROM programmes
  WHERE rio_code IS NOT NULL;
  
  IF duo_count > 0 OR rio_count > 0 THEN
    RAISE WARNING 'Found % programmes with DUO source and % programmes with rio_code. Manual cleanup may be needed.', duo_count, rio_count;
  ELSE
    RAISE NOTICE 'All DUO data has been removed successfully.';
  END IF;
END $$;

-- Add comment
COMMENT ON TABLE programmes IS 'SKDB-only programme data. All DUO data has been removed.';

