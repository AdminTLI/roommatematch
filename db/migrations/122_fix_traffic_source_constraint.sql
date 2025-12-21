-- Fix traffic_source CHECK constraint
-- The original constraint had NULL in the IN list which is invalid syntax
-- This migration fixes it to allow NULL values properly

-- Drop the existing constraint if it exists
ALTER TABLE user_journey_events 
DROP CONSTRAINT IF EXISTS user_journey_events_traffic_source_check;

-- Add the correct constraint that allows NULL
ALTER TABLE user_journey_events
ADD CONSTRAINT user_journey_events_traffic_source_check 
CHECK (traffic_source IS NULL OR traffic_source IN ('organic', 'direct', 'referral', 'social', 'email', 'paid'));

