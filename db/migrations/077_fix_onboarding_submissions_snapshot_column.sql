-- Migration: Add snapshot column to onboarding_submissions table
-- Fixes: Could not find the 'snapshot' column of 'onboarding_submissions' in the schema cache
-- The 999_comprehensive_reconciliation.sql migration dropped and recreated the table without snapshot column

-- Add snapshot column if it doesn't exist
ALTER TABLE onboarding_submissions 
ADD COLUMN IF NOT EXISTS snapshot JSONB;

-- Add submitted_at column if it doesn't exist (used instead of completed_at)
ALTER TABLE onboarding_submissions 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- If snapshot column was just added, set NOT NULL constraint (but only if table is empty or we can backfill)
-- We'll make it nullable first, then update existing records, then make it NOT NULL if needed
-- For now, keep it nullable to avoid breaking existing records

-- Backfill submitted_at from completed_at if submitted_at is NULL
UPDATE onboarding_submissions
SET submitted_at = completed_at
WHERE submitted_at IS NULL AND completed_at IS NOT NULL;

-- Create index for snapshot queries (if needed)
CREATE INDEX IF NOT EXISTS idx_onboarding_submissions_submitted_at 
ON onboarding_submissions(submitted_at);

-- Add comment for clarity
COMMENT ON COLUMN onboarding_submissions.snapshot IS 'JSONB snapshot containing raw_sections and transformed_responses for audit trail and analysis';
COMMENT ON COLUMN onboarding_submissions.submitted_at IS 'Timestamp when the questionnaire was submitted (preferred over completed_at)';











