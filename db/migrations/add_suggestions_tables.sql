-- Migration to add match suggestions and blocklist tables
-- Run this in Supabase SQL Editor to add the new tables

-- Match suggestions table for student double-consent flow
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

-- Match blocklist table to prevent re-suggesting declined pairs
CREATE TABLE IF NOT EXISTS match_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Enable RLS for match suggestions
ALTER TABLE match_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_blocklist ENABLE ROW LEVEL SECURITY;

-- RLS policies for match_suggestions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_suggestions' AND policyname = 'match_suggestions_own') THEN
    CREATE POLICY match_suggestions_own ON match_suggestions
      FOR ALL USING (
        auth.uid() = ANY(member_ids)
      );
  END IF;
END $$;

-- RLS policies for match_blocklist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_blocklist' AND policyname = 'match_blocklist_own') THEN
    CREATE POLICY match_blocklist_own ON match_blocklist
      FOR ALL USING (
        auth.uid() = user_id
      );
  END IF;
END $$;

-- Indexes for match_suggestions
CREATE INDEX IF NOT EXISTS idx_match_suggestions_user ON match_suggestions USING GIN (member_ids);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_run_id ON match_suggestions (run_id);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_status ON match_suggestions (status);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_expires_at ON match_suggestions (expires_at);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_fit_index ON match_suggestions (fit_index);

-- Indexes for match_blocklist
CREATE INDEX IF NOT EXISTS idx_match_blocklist_user_id ON match_blocklist (user_id);
CREATE INDEX IF NOT EXISTS idx_match_blocklist_blocked_user_id ON match_blocklist (blocked_user_id);

-- Trigger to update updated_at for match_suggestions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_match_suggestions_updated_at') THEN
    CREATE TRIGGER update_match_suggestions_updated_at
      BEFORE UPDATE ON match_suggestions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
