-- Migration: Update user_study_year_v view with month-aware calculation logic
-- This replaces the simple calendar year calculation with accurate academic year logic

-- Ensure expected_graduation_year column exists (from migration 004)
-- This makes the migration idempotent and safe to run even if migration 004 wasn't run
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS expected_graduation_year int 
CHECK (expected_graduation_year IS NULL OR (expected_graduation_year >= EXTRACT(YEAR FROM now()) AND expected_graduation_year <= EXTRACT(YEAR FROM now()) + 10));

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_academic_graduation_year ON user_academic(expected_graduation_year);

-- Update the view with month-aware calculation logic
CREATE OR REPLACE VIEW user_study_year_v AS
SELECT 
    ua.user_id,
    -- Calculate study year using month-aware academic year logic
    CASE 
        -- Month-aware calculation when both months and expected_graduation_year are provided
        WHEN ua.study_start_month IS NOT NULL 
             AND ua.graduation_month IS NOT NULL 
             AND ua.expected_graduation_year IS NOT NULL THEN
            GREATEST(1, LEAST(
                -- Current academic year (starts in September, month 9)
                -- Academic year offset: if current month >= 9, add 1 to year
                (EXTRACT(YEAR FROM now())::int + CASE WHEN EXTRACT(MONTH FROM now()) >= 9 THEN 1 ELSE 0 END) -
                -- Start academic year (if start month >= 9, add 1 to year)
                (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1,
                -- Maximum possible year (programme duration)
                -- Graduation academic year (if grad month >= 9, add 1 to year)
                (ua.expected_graduation_year + CASE WHEN ua.graduation_month >= 9 THEN 1 ELSE 0 END) -
                (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1
            ))
        -- Fallback to old calculation for backward compatibility (when months are NULL)
        ELSE
            GREATEST(1, EXTRACT(YEAR FROM now())::int - ua.study_start_year + 1)
    END AS study_year
FROM user_academic ua;

-- Update comment
COMMENT ON VIEW user_study_year_v IS 'View to calculate current academic year status using month-aware logic. Falls back to calendar year calculation when months or expected_graduation_year are NULL. Academic year starts in September (month 9).';

