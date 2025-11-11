-- Migration: Add city column to universities table
-- Description: Adds city field to universities for city-based filtering and display

-- Add city column to universities table
ALTER TABLE universities 
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add index on city column for performance
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city) WHERE city IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN universities.city IS 'City where the university is located, used for filtering and grouping universities by location';

-- Fix the update_updated_at_column function to ensure it uses the correct now() function
-- This fixes issues where the function might try to call public.now() which doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

