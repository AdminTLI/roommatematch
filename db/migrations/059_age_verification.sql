-- Migration: Age Verification
-- This migration adds age verification fields to profiles table

-- Add date_of_birth to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add age_verified_at to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMP WITH TIME ZONE;

-- Add index for age verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth) 
  WHERE date_of_birth IS NOT NULL;

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user meets minimum age requirement (17 years)
CREATE OR REPLACE FUNCTION meets_minimum_age(birth_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  IF birth_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN calculate_age(birth_date) >= 17;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to verify age during profile creation/update
CREATE OR REPLACE FUNCTION verify_user_age()
RETURNS TRIGGER AS $$
BEGIN
  -- If date_of_birth is provided, verify age
  IF NEW.date_of_birth IS NOT NULL THEN
    IF NOT meets_minimum_age(NEW.date_of_birth) THEN
      RAISE EXCEPTION 'User must be at least 17 years old to use this platform';
    END IF;
    
    -- Set age_verified_at timestamp
    IF NEW.age_verified_at IS NULL THEN
      NEW.age_verified_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to verify age on profile insert/update
DROP TRIGGER IF EXISTS trigger_verify_user_age ON profiles;
CREATE TRIGGER trigger_verify_user_age
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION verify_user_age();

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_age(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION meets_minimum_age(DATE) TO authenticated;

