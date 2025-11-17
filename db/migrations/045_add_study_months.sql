-- Migration: Add study_start_month and graduation_month columns to user_academic table
-- This enables month-aware study year calculation for accurate academic year tracking

-- Add study_start_month column (1-12, nullable for backward compatibility)
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS study_start_month INTEGER 
CHECK (study_start_month IS NULL OR (study_start_month >= 1 AND study_start_month <= 12));

-- Add graduation_month column (1-12, nullable for backward compatibility)
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS graduation_month INTEGER 
CHECK (graduation_month IS NULL OR (graduation_month >= 1 AND graduation_month <= 12));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_academic_start_month ON user_academic(study_start_month);
CREATE INDEX IF NOT EXISTS idx_user_academic_graduation_month ON user_academic(graduation_month);

-- Add comments for clarity
COMMENT ON COLUMN user_academic.study_start_month IS 'Month when studies started (1-12). Used for accurate academic year calculation. NULL falls back to institution defaults.';
COMMENT ON COLUMN user_academic.graduation_month IS 'Expected month of graduation (1-12). Used for accurate academic year calculation. NULL defaults to June (6).';






