-- Comprehensive Schema Reconciliation Migration
-- This migration reconciles all schema differences and ensures consistency
-- Run this after all other migrations to fix any conflicts

-- ============================================
-- 1. FIX MISSING TABLES AND COLUMNS
-- ============================================

-- Ensure match_suggestions table exists with correct structure
CREATE TABLE IF NOT EXISTS match_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('pair', 'group')),
  member_ids UUID[] NOT NULL,
  fit_score DECIMAL(4,3) NOT NULL,
  fit_index INTEGER NOT NULL,
  section_scores JSONB,
  reasons TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'confirmed')),
  accepted_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure match_runs table exists
CREATE TABLE IF NOT EXISTS match_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT UNIQUE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('pairs', 'groups')),
  cohort_filter JSONB NOT NULL,
  match_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure match_records table exists
CREATE TABLE IF NOT EXISTS match_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL REFERENCES match_runs(run_id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('pair', 'group')),
  user_ids UUID[] NOT NULL,
  fit_score DECIMAL(4,3) NOT NULL,
  fit_index INTEGER NOT NULL,
  section_scores JSONB,
  reasons TEXT[],
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure match_blocklist table exists
CREATE TABLE IF NOT EXISTS match_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Ensure verifications table exists
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_document_path TEXT NOT NULL,
  selfie_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 2. FIX ONBOARDING_SUBMISSIONS TABLE
-- ============================================

-- Drop and recreate onboarding_submissions with correct structure
DROP TABLE IF EXISTS onboarding_submissions CASCADE;

CREATE TABLE onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 3. FIX CHAT TABLES STRUCTURE
-- ============================================

-- Ensure chats table has correct structure
ALTER TABLE chats DROP COLUMN IF EXISTS match_id;
ALTER TABLE chats DROP COLUMN IF EXISTS first_message_at;

-- Add missing columns if they don't exist
ALTER TABLE chats ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES group_suggestions(id) ON DELETE CASCADE;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure chat_members has last_read_at for unread tracking
ALTER TABLE chat_members ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- 4. FIX RESPONSES TABLE TO USE JSONB
-- ============================================

-- Ensure responses table uses JSONB for values (not text)
-- This is already correct in the schema, but let's verify
DO $$
BEGIN
  -- Check if value column is JSONB, if not, we need to convert
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'responses' 
    AND column_name = 'value' 
    AND data_type = 'text'
  ) THEN
    -- Convert text to JSONB
    ALTER TABLE responses ALTER COLUMN value TYPE JSONB USING value::JSONB;
  END IF;
END $$;

-- ============================================
-- 5. ADD MISSING INDEXES
-- ============================================

-- Match suggestions indexes
CREATE INDEX IF NOT EXISTS idx_match_suggestions_user ON match_suggestions USING GIN (member_ids);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_run_id ON match_suggestions (run_id);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_status ON match_suggestions (status);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_expires_at ON match_suggestions (expires_at);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_fit_index ON match_suggestions (fit_index);

-- Match runs indexes
CREATE INDEX IF NOT EXISTS idx_match_runs_run_id ON match_runs (run_id);
CREATE INDEX IF NOT EXISTS idx_match_runs_mode ON match_runs (mode);
CREATE INDEX IF NOT EXISTS idx_match_runs_created_at ON match_runs (created_at);

-- Match records indexes
CREATE INDEX IF NOT EXISTS idx_match_records_run_id ON match_records (run_id);
CREATE INDEX IF NOT EXISTS idx_match_records_kind ON match_records (kind);
CREATE INDEX IF NOT EXISTS idx_match_records_locked ON match_records (locked);
CREATE INDEX IF NOT EXISTS idx_match_records_fit_score ON match_records (fit_score);
CREATE INDEX IF NOT EXISTS idx_match_records_user_ids ON match_records USING GIN (user_ids);

-- Match blocklist indexes
CREATE INDEX IF NOT EXISTS idx_match_blocklist_user_id ON match_blocklist (user_id);
CREATE INDEX IF NOT EXISTS idx_match_blocklist_blocked_user_id ON match_blocklist (blocked_user_id);

-- Verifications indexes
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications (status);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON chats (created_by);
CREATE INDEX IF NOT EXISTS idx_chat_members_last_read_at ON chat_members (last_read_at);

-- ============================================
-- 6. ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE match_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. CREATE RLS POLICIES
-- ============================================

-- Match suggestions policies
DROP POLICY IF EXISTS match_suggestions_own ON match_suggestions;
CREATE POLICY match_suggestions_own ON match_suggestions
  FOR ALL USING (
    auth.uid() = ANY(member_ids)
  );

-- Match runs policies (admin only)
DROP POLICY IF EXISTS match_runs_admin ON match_runs;
CREATE POLICY match_runs_admin ON match_runs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Match records policies (admin only)
DROP POLICY IF EXISTS match_records_admin ON match_records;
CREATE POLICY match_records_admin ON match_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Match blocklist policies
DROP POLICY IF EXISTS match_blocklist_own ON match_blocklist;
CREATE POLICY match_blocklist_own ON match_blocklist
  FOR ALL USING (
    auth.uid() = user_id
  );

-- Verifications policies
DROP POLICY IF EXISTS verifications_own ON verifications;
CREATE POLICY verifications_own ON verifications
  FOR ALL USING (user_id = auth.uid());

-- Onboarding submissions policies
DROP POLICY IF EXISTS onboarding_submissions_own ON onboarding_submissions;
CREATE POLICY onboarding_submissions_own ON onboarding_submissions
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- 8. CREATE COMPUTE_USER_VECTOR_AND_STORE FUNCTION
-- ============================================

-- Function to compute and store user vector
CREATE OR REPLACE FUNCTION compute_user_vector_and_store(p_user_id UUID)
RETURNS void AS $$
DECLARE
  computed_vector vector(50);
BEGIN
  -- Compute the vector using the existing function
  computed_vector := compute_user_vector(p_user_id);
  
  -- Store or update the vector
  INSERT INTO user_vectors (user_id, vector)
  VALUES (p_user_id, computed_vector)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    vector = EXCLUDED.vector,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION compute_user_vector_and_store(UUID) TO authenticated;

-- ============================================
-- 9. FIX COMPUTE_USER_VECTOR FUNCTION
-- ============================================

-- Update the compute_user_vector function to work with responses table
CREATE OR REPLACE FUNCTION compute_user_vector(user_id UUID)
RETURNS vector AS $$
DECLARE
  result_vector vector(50) := array_fill(0.0, ARRAY[50])::vector;
  question_record RECORD;
  vector_index INTEGER;
  normalized_value DECIMAL;
BEGIN
  -- Map questionnaire responses to normalized vector positions
  FOR question_record IN 
    SELECT r.question_key, r.value, qi.weight
    FROM responses r
    JOIN question_items qi ON qi.key = r.question_key
    WHERE r.user_id = compute_user_vector.user_id
  LOOP
    -- Map specific questions to vector positions
    CASE question_record.question_key
      -- Lifestyle dimensions (positions 0-9)
      WHEN 'sleep_start' THEN
        vector_index := 0;
        normalized_value := (question_record.value::DECIMAL - 20) / 12.0; -- 20-32 (8PM-8AM)
      WHEN 'sleep_end' THEN
        vector_index := 1;
        normalized_value := (question_record.value::DECIMAL - 5) / 12.0; -- 5-17 (5AM-5PM)
      WHEN 'study_intensity' THEN
        vector_index := 2;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'cleanliness_room' THEN
        vector_index := 3;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'cleanliness_kitchen' THEN
        vector_index := 4;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'noise_tolerance' THEN
        vector_index := 5;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'guests_frequency' THEN
        vector_index := 6;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'parties_frequency' THEN
        vector_index := 7;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'chores_preference' THEN
        vector_index := 8;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'alcohol_at_home' THEN
        vector_index := 9;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
        
      -- Social dimensions (positions 10-19)
      WHEN 'social_level' THEN
        vector_index := 10;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'food_sharing' THEN
        vector_index := 11;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'utensils_sharing' THEN
        vector_index := 12;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Personality dimensions (positions 20-39) - Big Five
      WHEN 'extraversion' THEN
        vector_index := 20;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'agreeableness' THEN
        vector_index := 21;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'conscientiousness' THEN
        vector_index := 22;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'neuroticism' THEN
        vector_index := 23;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'openness' THEN
        vector_index := 24;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Communication style (positions 40-49)
      WHEN 'conflict_style' THEN
        vector_index := 40;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'communication_preference' THEN
        vector_index := 41;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Deal breakers (positions 50-59)
      WHEN 'smoking' THEN
        vector_index := 50;
        normalized_value := CASE WHEN question_record.value::BOOLEAN THEN 1.0 ELSE 0.0 END;
      WHEN 'pets_allowed' THEN
        vector_index := 51;
        normalized_value := CASE WHEN question_record.value::BOOLEAN THEN 1.0 ELSE 0.0 END;
      WHEN 'parties_max' THEN
        vector_index := 52;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'guests_max' THEN
        vector_index := 53;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      ELSE
        -- Skip unknown question keys
        CONTINUE;
    END CASE;
    
    -- Ensure vector_index is within bounds
    IF vector_index >= 0 AND vector_index < 50 THEN
      result_vector[vector_index + 1] := normalized_value; -- PostgreSQL arrays are 1-indexed
    END IF;
  END LOOP;
  
  RETURN result_vector;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. CREATE STORAGE BUCKET FOR VERIFICATION
-- ============================================

-- Create verification documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 11. GRANT PERMISSIONS
-- ============================================

-- Grant permissions for new tables
GRANT SELECT ON match_suggestions TO authenticated;
GRANT INSERT ON match_suggestions TO authenticated;
GRANT UPDATE ON match_suggestions TO authenticated;
GRANT SELECT ON match_runs TO authenticated;
GRANT SELECT ON match_records TO authenticated;
GRANT ALL ON match_blocklist TO authenticated;
GRANT ALL ON verifications TO authenticated;
GRANT ALL ON onboarding_submissions TO authenticated;

-- ============================================
-- 12. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

-- Add updated_at triggers to new tables
CREATE TRIGGER update_match_suggestions_updated_at
  BEFORE UPDATE ON match_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_runs_updated_at
  BEFORE UPDATE ON match_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_records_updated_at
  BEFORE UPDATE ON match_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. MIGRATE DATA FROM ONBOARDING_SECTIONS TO RESPONSES
-- ============================================

-- Migrate any existing onboarding_sections data to responses table
INSERT INTO responses (user_id, question_key, value)
SELECT 
  os.user_id,
  key,
  value
FROM onboarding_sections os,
LATERAL jsonb_each(os.answers) AS kv(key, value)
WHERE NOT EXISTS (
  SELECT 1 FROM responses r 
  WHERE r.user_id = os.user_id 
  AND r.question_key = kv.key
)
ON CONFLICT (user_id, question_key) DO NOTHING;

-- ============================================
-- 14. CREATE DEMO USER DATA IF NOT EXISTS
-- ============================================

-- This will be handled by the seed script, but we ensure the structure is ready
-- The actual demo user data will be inserted by the seed script after user creation

-- ============================================
-- 15. VERIFICATION QUERIES
-- ============================================

-- Verify all tables exist
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  table_name TEXT;
  required_tables TEXT[] := ARRAY[
    'match_suggestions', 'match_runs', 'match_records', 'match_blocklist',
    'verifications', 'onboarding_submissions', 'responses', 'user_vectors',
    'chats', 'chat_members', 'messages', 'message_reads'
  ];
BEGIN
  FOREACH table_name IN ARRAY required_tables
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) THEN
      missing_tables := array_append(missing_tables, table_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All required tables exist';
  END IF;
END $$;

-- Verify functions exist
DO $$
DECLARE
  missing_functions TEXT[] := ARRAY[]::TEXT[];
  func_name TEXT;
  required_functions TEXT[] := ARRAY[
    'compute_user_vector', 'compute_user_vector_and_store'
  ];
BEGIN
  FOREACH func_name IN ARRAY required_functions
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = func_name
    ) THEN
      missing_functions := array_append(missing_functions, func_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_functions, 1) > 0 THEN
    RAISE EXCEPTION 'Missing functions: %', array_to_string(missing_functions, ', ');
  ELSE
    RAISE NOTICE 'All required functions exist';
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log completion
INSERT INTO app_events (name, props) 
VALUES ('migration_completed', '{"migration": "999_comprehensive_reconciliation", "timestamp": "' || NOW() || '"}')
ON CONFLICT DO NOTHING;
