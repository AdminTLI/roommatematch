-- Fix compute_compatibility_score function
-- This script ensures the correct version from migration 049 is active
-- and removes any placeholder version

-- First, drop the old function if it exists (with old signature)
DROP FUNCTION IF EXISTS compute_compatibility_score(UUID, UUID);

-- The migration 049_compatibility_algorithm_v1.sql should be run after this
-- to create the correct function with the new signature

-- Verify which function exists (this will show an error if none exists, which is fine)
-- You can run this to check: SELECT proname, proargtypes FROM pg_proc WHERE proname = 'compute_compatibility_score';

