-- Add GIN indexes for array and JSONB columns to improve query performance

-- Enable btree_gin extension if not already enabled (useful for combined indexes, though pure GIN works for arrays)
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Profiles: languages (TEXT[])
CREATE INDEX IF NOT EXISTS idx_profiles_languages_gin ON profiles USING GIN (languages);

-- Universities: eligibility_domains (TEXT[])
CREATE INDEX IF NOT EXISTS idx_universities_eligibility_domains_gin ON universities USING GIN (eligibility_domains);

-- Responses: value (JSONB)
-- This allows fast searching within the JSON structure
CREATE INDEX IF NOT EXISTS idx_responses_value_gin ON responses USING GIN (value);

-- Eligibility Rules: domain_allowlist (TEXT[])
CREATE INDEX IF NOT EXISTS idx_eligibility_rules_domain_allowlist_gin ON eligibility_rules USING GIN (domain_allowlist);

-- Notification metadata (JSONB)
CREATE INDEX IF NOT EXISTS idx_notifications_metadata_gin ON notifications USING GIN (metadata);
