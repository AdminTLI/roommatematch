-- Migration: Add programme_duration_months and enforce study months
-- This migration adds programme duration tracking and ensures study months are collected

-- Add programme_duration_months column to user_academic
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS programme_duration_months INTEGER 
CHECK (programme_duration_months IS NULL OR (programme_duration_months >= 12 AND programme_duration_months <= 120));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_academic_duration ON user_academic(programme_duration_months);

-- Add comment for clarity
COMMENT ON COLUMN user_academic.programme_duration_months IS 'Programme duration in months, calculated from study_start_month/graduation_month. Used for accurate study year calculation.';

-- Create function to calculate programme duration in months
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update user_study_year_v view to use duration for more accurate calculation
CREATE OR REPLACE VIEW user_study_year_v AS
SELECT 
    ua.user_id,
    ua.university_id,
    ua.degree_level,
    ua.program_id,
    ua.study_start_year,
    ua.study_start_month,
    ua.expected_graduation_year,
    ua.graduation_month,
    ua.programme_duration_months,
    -- Calculate study year using month-aware academic year logic
    CASE 
        -- Month-aware calculation when all required data is provided
        WHEN ua.study_start_month IS NOT NULL 
             AND ua.graduation_month IS NOT NULL 
             AND ua.expected_graduation_year IS NOT NULL 
             AND ua.study_start_year IS NOT NULL THEN
            GREATEST(1, LEAST(
                -- Current academic year (starts in September, month 9)
                -- Academic year offset: if current month >= 9, add 1 to year
                (EXTRACT(YEAR FROM now())::int + CASE WHEN EXTRACT(MONTH FROM now()) >= 9 THEN 1 ELSE 0 END) -
                -- Start academic year (if start month >= 9, add 1 to year)
                (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1,
                -- Maximum possible year (calculated from duration or fallback)
                COALESCE(
                    -- Use duration in months if available
                    CASE WHEN ua.programme_duration_months IS NOT NULL 
                         THEN (ua.programme_duration_months / 12)::INTEGER + 1
                         ELSE NULL
                    END,
                    -- Fallback to graduation year calculation
                    (ua.expected_graduation_year + CASE WHEN ua.graduation_month >= 9 THEN 1 ELSE 0 END) -
                    (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1
                )
            ))
        -- Fallback to old calculation for backward compatibility (when months are NULL)
        ELSE
            GREATEST(1, EXTRACT(YEAR FROM now())::int - ua.study_start_year + 1)
    END AS study_year
FROM user_academic ua;

-- Update comment
COMMENT ON VIEW user_study_year_v IS 'View to calculate current academic year status using month-aware logic and programme duration. Falls back to calendar year calculation when months or expected_graduation_year are NULL. Academic year starts in September (month 9).';

-- Create trigger function to automatically calculate programme_duration_months
CREATE OR REPLACE FUNCTION update_programme_duration_months()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration if all required fields are present
  IF NEW.study_start_year IS NOT NULL AND NEW.study_start_month IS NOT NULL AND
     NEW.expected_graduation_year IS NOT NULL AND NEW.graduation_month IS NOT NULL THEN
    NEW.programme_duration_months := calculate_programme_duration_months(
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update programme_duration_months
DROP TRIGGER IF EXISTS trigger_update_programme_duration ON user_academic;
CREATE TRIGGER trigger_update_programme_duration
  BEFORE INSERT OR UPDATE ON user_academic
  FOR EACH ROW
  EXECUTE FUNCTION update_programme_duration_months();

-- Backfill programme_duration_months for existing records
UPDATE user_academic
SET programme_duration_months = calculate_programme_duration_months(
  study_start_year,
  study_start_month,
  expected_graduation_year,
  graduation_month
)
WHERE study_start_year IS NOT NULL 
  AND study_start_month IS NOT NULL 
  AND expected_graduation_year IS NOT NULL 
  AND graduation_month IS NOT NULL
  AND programme_duration_months IS NULL;

