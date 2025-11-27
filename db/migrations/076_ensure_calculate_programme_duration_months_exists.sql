-- Migration: Ensure calculate_programme_duration_months function exists
-- This migration creates the function if it doesn't exist and sets proper search_path
-- Fixes: function calculate_programme_duration_months(integer, integer, integer, integer) does not exist

-- Ensure required columns exist in user_academic table
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS study_start_month INTEGER 
CHECK (study_start_month IS NULL OR (study_start_month >= 1 AND study_start_month <= 12));

ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS graduation_month INTEGER 
CHECK (graduation_month IS NULL OR (graduation_month >= 1 AND graduation_month <= 12));

ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS programme_duration_months INTEGER 
CHECK (programme_duration_months IS NULL OR (programme_duration_months >= 12 AND programme_duration_months <= 120));

-- Create or replace the function with proper search_path
CREATE OR REPLACE FUNCTION calculate_programme_duration_months(
  p_study_start_year INTEGER,
  p_study_start_month INTEGER,
  p_expected_graduation_year INTEGER,
  p_graduation_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  duration_months INTEGER;
BEGIN
  -- Validate inputs
  IF p_study_start_year IS NULL OR p_study_start_month IS NULL OR 
     p_expected_graduation_year IS NULL OR p_graduation_month IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Create date objects
  start_date := MAKE_DATE(p_study_start_year, p_study_start_month, 1);
  end_date := MAKE_DATE(p_expected_graduation_year, p_graduation_month, 1);
  
  -- Calculate duration in months
  duration_months := EXTRACT(YEAR FROM age(end_date, start_date))::INTEGER * 12 + 
                     EXTRACT(MONTH FROM age(end_date, start_date))::INTEGER;
  
  -- Clamp to reasonable range (12-120 months = 1-10 years)
  duration_months := GREATEST(12, LEAST(120, duration_months));
  
  RETURN duration_months;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = '';

-- Create or replace the trigger function with proper search_path
CREATE OR REPLACE FUNCTION update_programme_duration_months()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration if all required fields are present
  IF NEW.study_start_year IS NOT NULL AND NEW.study_start_month IS NOT NULL AND
     NEW.expected_graduation_year IS NOT NULL AND NEW.graduation_month IS NOT NULL THEN
    NEW.programme_duration_months := public.calculate_programme_duration_months(
      NEW.study_start_year,
      NEW.study_start_month,
      NEW.expected_graduation_year,
      NEW.graduation_month
    );
  ELSE
    NEW.programme_duration_months := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trigger_update_programme_duration ON user_academic;
CREATE TRIGGER trigger_update_programme_duration
  BEFORE INSERT OR UPDATE ON user_academic
  FOR EACH ROW
  EXECUTE FUNCTION update_programme_duration_months();

-- Grant execute permission to authenticated users (if needed)
GRANT EXECUTE ON FUNCTION calculate_programme_duration_months(INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_programme_duration_months(INTEGER, INTEGER, INTEGER, INTEGER) TO service_role;

