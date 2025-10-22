-- Migration: Add expected_graduation_year field and update view
-- This migration adds the new expected_graduation_year field while keeping study_start_year for backward compatibility

-- Add the new expected_graduation_year field
ALTER TABLE user_academic 
ADD COLUMN expected_graduation_year int CHECK (expected_graduation_year >= EXTRACT(YEAR FROM now()) AND expected_graduation_year <= EXTRACT(YEAR FROM now()) + 10);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_academic_graduation_year ON user_academic(expected_graduation_year);

-- Update the view to calculate current year based on institution type and degree level
CREATE OR REPLACE VIEW user_study_year_v AS
SELECT 
    ua.user_id,
    ua.expected_graduation_year,
    ua.degree_level,
    ua.institution_slug,
    CASE 
        -- For pre-master and master students
        WHEN ua.degree_level IN ('premaster', 'master') THEN 
            CASE 
                WHEN ua.degree_level = 'premaster' THEN 'premaster_student'
                WHEN ua.degree_level = 'master' THEN 'master_student'
                ELSE ua.degree_level
            END
        -- For bachelor students at WO institutions (3 years)
        WHEN ua.degree_level = 'bachelor' AND (
            ua.institution_slug IN (
                'uva', 'vu', 'uu', 'ru', 'rug', 'tud', 'tue', 'ut', 'ou', 'wur', 
                'um', 'tilburg', 'eur', 'tiu', 'leiden', 'utwente', 'pthu', 'tua', 'tuu'
            )
        ) THEN 
            CASE 
                WHEN ua.expected_graduation_year = EXTRACT(YEAR FROM now()) THEN 'year_3'
                WHEN ua.expected_graduation_year = EXTRACT(YEAR FROM now()) + 1 THEN 'year_2'
                WHEN ua.expected_graduation_year >= EXTRACT(YEAR FROM now()) + 2 THEN 'year_1'
                ELSE 'graduated'
            END
        -- For bachelor students at HBO institutions (4 years) - all others default to HBO
        WHEN ua.degree_level = 'bachelor' THEN 
            CASE 
                WHEN ua.expected_graduation_year = EXTRACT(YEAR FROM now()) THEN 'year_4'
                WHEN ua.expected_graduation_year = EXTRACT(YEAR FROM now()) + 1 THEN 'year_3'
                WHEN ua.expected_graduation_year = EXTRACT(YEAR FROM now()) + 2 THEN 'year_2'
                WHEN ua.expected_graduation_year >= EXTRACT(YEAR FROM now()) + 3 THEN 'year_1'
                ELSE 'graduated'
            END
        ELSE 'unknown'
    END AS current_year_status
FROM user_academic ua;

-- Add comment for clarity
COMMENT ON COLUMN user_academic.expected_graduation_year IS 'Expected year of graduation - used to calculate current academic year based on programme duration';
COMMENT ON VIEW user_study_year_v IS 'View to calculate current academic year status based on expected graduation year and institution type';
