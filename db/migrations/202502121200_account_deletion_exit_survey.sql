-- Migration: Account Deletion with Exit Survey & Retention Flow
-- Supports GDPR Right to Erasure with retention step, exit survey capture,
-- and anonymization for business intelligence (matching algorithm training).
--
-- Tables: exit_surveys (GDPR-compliant: no user_id link)
-- Columns: profiles.is_visible (for "Hide Profile" snooze option)
-- Schema: Allow NULL user_id in responses/messages for anonymization

-- 1. Exit surveys table - stores churn reasons WITHOUT linking to user_id (GDPR compliant)
-- We capture reason + optional comment + anonymized demographics for analytics only
CREATE TABLE IF NOT EXISTS exit_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Survey data - intentionally no user_id to comply with erasure
  survey_reason VARCHAR(100) NOT NULL,
  survey_comment TEXT,
  is_win BOOLEAN DEFAULT false, -- True when reason = "I found a room!" for success analytics
  -- Anonymized demographics (optional, for aggregate stats - e.g. "2nd year students leave because X")
  demographics JSONB DEFAULT '{}', -- e.g. {"degree_level":"bachelor","study_year":2}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exit_surveys_reason ON exit_surveys(survey_reason);
CREATE INDEX IF NOT EXISTS idx_exit_surveys_is_win ON exit_surveys(is_win);
CREATE INDEX IF NOT EXISTS idx_exit_surveys_created_at ON exit_surveys(created_at);

COMMENT ON TABLE exit_surveys IS 'GDPR-compliant exit survey data. No user_id to avoid linking deleted users. Used for churn analytics and product improvement.';

-- 2. Add is_visible to profiles for "Hide Profile" (snooze) retention option
-- When false: user is hidden from search, gets no notifications, but keeps data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

COMMENT ON COLUMN profiles.is_visible IS 'When false, profile is hidden from search and matching. User keeps data but is effectively snoozed (retention flow).';

-- 3. Allow anonymization of questionnaire responses (GDPR + Business Intelligence)
-- We retain anonymized answers for matching algorithm training after user deletion
ALTER TABLE responses ALTER COLUMN user_id DROP NOT NULL;

-- Drop unique constraint if it prevents multiple NULL user_ids (PostgreSQL allows multiple NULLs in unique)
-- The existing UNIQUE(user_id, question_key) works: multiple (NULL, 'M1_Q1') are allowed (NULL != NULL in SQL)
-- No change needed for responses unique constraint

COMMENT ON COLUMN responses.user_id IS 'NULL when anonymized after account deletion. Data retained for matching algorithm training (GDPR Art. 17 allows anonymization).';

-- 4. Allow anonymization of message senders (chat context preservation)
-- Messages from deleted users show "Deleted User" when user_id is NULL
ALTER TABLE messages ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN messages.user_id IS 'NULL when sender deleted their account. Message content preserved for recipient context.';

-- 5. Update profiles RLS / search logic: minimal_public policy should also check is_visible
-- Policies are in policies.sql / 01_complete_schema; add is_visible check via a new policy or function
-- For now, application layer (search API) will filter is_visible = true
