-- Migration: Safe Group Chat with Compatibility Layer
-- Date: 2025-01-21
-- Description: Add group invitations, compatibility scoring, and feedback system for safe group chat formation

-- ============================================
-- 1. GROUP INVITATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS group_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  context_message TEXT, -- Optional message from inviter
  UNIQUE(chat_id, invitee_id)
);

-- ============================================
-- 2. GROUP COMPATIBILITY SCORES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS group_compatibility_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  overall_score DECIMAL(4,3) NOT NULL,
  personality_score DECIMAL(4,3) NOT NULL,
  schedule_score DECIMAL(4,3) NOT NULL,
  lifestyle_score DECIMAL(4,3) NOT NULL,
  social_score DECIMAL(4,3) NOT NULL,
  academic_score DECIMAL(4,3) NOT NULL,
  category_weights JSONB DEFAULT '{}', -- Custom weights per group intent
  member_deviations JSONB DEFAULT '{}', -- Per-member distance from centroid per category (includes explanation)
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id)
);

-- ============================================
-- 3. GROUP FEEDBACK TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS group_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('left', 'reassigned', 'discomfort')),
  reason TEXT,
  category_issues JSONB, -- Which compatibility categories caused issues
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id, feedback_type)
);

-- ============================================
-- 4. UPDATE CHATS TABLE
-- ============================================

ALTER TABLE chats ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE chats ADD COLUMN IF NOT EXISTS group_intent VARCHAR(50) CHECK (group_intent IN ('housing', 'study', 'social', 'general'));
ALTER TABLE chats ADD COLUMN IF NOT EXISTS invitation_status VARCHAR(20) DEFAULT 'active' CHECK (invitation_status IN ('inviting', 'active', 'archived'));

-- ============================================
-- 5. UPDATE CHAT MEMBERS TABLE
-- ============================================

ALTER TABLE chat_members ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES group_invitations(id);
ALTER TABLE chat_members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('invited', 'active', 'left'));
ALTER TABLE chat_members ADD COLUMN IF NOT EXISTS left_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 6. UPDATE NOTIFICATION TYPE ENUM
-- ============================================

-- Add group_invitation to notification_type enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'notification_type' 
    AND EXISTS (
      SELECT 1 FROM pg_enum WHERE enumlabel = 'group_invitation' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
    )
  ) THEN
    ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'group_invitation';
  END IF;
END $$;

-- ============================================
-- 7. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_group_invitations_chat_id ON group_invitations(chat_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee_id ON group_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_at ON group_invitations(invited_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_compatibility_scores_chat_id ON group_compatibility_scores(chat_id);
CREATE INDEX IF NOT EXISTS idx_group_feedback_chat_id ON group_feedback(chat_id);
CREATE INDEX IF NOT EXISTS idx_group_feedback_user_id ON group_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_invitation_status ON chats(invitation_status);
CREATE INDEX IF NOT EXISTS idx_chat_members_status ON chat_members(status);

-- ============================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. RLS POLICIES FOR GROUP_INVITATIONS
-- ============================================

-- Users can view invitations sent to them
CREATE POLICY "group_invitations_view_own" ON group_invitations
  FOR SELECT USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

-- Inviters can create invitations
CREATE POLICY "group_invitations_create" ON group_invitations
  FOR INSERT WITH CHECK (inviter_id = auth.uid());

-- Invitees can update their own invitations (accept/reject)
CREATE POLICY "group_invitations_update_own" ON group_invitations
  FOR UPDATE USING (invitee_id = auth.uid());

-- ============================================
-- 10. RLS POLICIES FOR GROUP_COMPATIBILITY_SCORES
-- ============================================

-- Users can view compatibility scores for chats they're members of
CREATE POLICY "group_compatibility_scores_view" ON group_compatibility_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = group_compatibility_scores.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

-- System can insert/update compatibility scores (via service role)
CREATE POLICY "group_compatibility_scores_modify" ON group_compatibility_scores
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 11. RLS POLICIES FOR GROUP_FEEDBACK
-- ============================================

-- Users can insert their own feedback
CREATE POLICY "group_feedback_insert_own" ON group_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own feedback
CREATE POLICY "group_feedback_view_own" ON group_feedback
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all feedback for monitoring
CREATE POLICY "group_feedback_view_admin" ON group_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 12. FUNCTION TO RECALCULATE GROUP COMPATIBILITY
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_group_compatibility(p_chat_id UUID)
RETURNS VOID AS $$
BEGIN
  -- This will be implemented in the application layer
  -- Placeholder for now
  NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 13. TRIGGER TO UPDATE CHAT STATUS WHEN ALL INVITATIONS ACCEPTED
-- ============================================

CREATE OR REPLACE FUNCTION update_chat_status_on_invitations()
RETURNS TRIGGER AS $$
DECLARE
  pending_count INTEGER;
  total_invitations INTEGER;
BEGIN
  -- Count pending invitations for this chat
  SELECT COUNT(*) INTO pending_count
  FROM group_invitations
  WHERE chat_id = NEW.chat_id AND status = 'pending';
  
  -- Count total invitations (excluding creator)
  SELECT COUNT(*) INTO total_invitations
  FROM group_invitations
  WHERE chat_id = NEW.chat_id;
  
  -- If no pending invitations and at least one invitation exists, activate chat
  IF pending_count = 0 AND total_invitations > 0 THEN
    UPDATE chats
    SET invitation_status = 'active'
    WHERE id = NEW.chat_id AND invitation_status = 'inviting';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_status_on_invitation
  AFTER UPDATE ON group_invitations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_chat_status_on_invitations();

-- ============================================
-- 14. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE group_invitations IS 'Tracks group chat invitations with opt-in consent workflow';
COMMENT ON TABLE group_compatibility_scores IS 'Stores calculated group compatibility scores using centroid-based metrics';
COMMENT ON TABLE group_feedback IS 'Anonymized feedback from users who leave groups or report discomfort';
COMMENT ON COLUMN chats.invitation_status IS 'Status of group chat invitations: inviting (pending), active (all accepted), archived';
COMMENT ON COLUMN chats.group_intent IS 'Purpose of the group: housing, study, social, or general';
COMMENT ON COLUMN chat_members.status IS 'Member status: invited (pending), active (joined), left (departed)';

