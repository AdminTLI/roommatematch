-- Migration: Group Pairwise Matching System
-- Date: 2025-01-22
-- Description: Add pairwise matching requirement for group chats to unlock

-- ============================================
-- 1. GROUP PAIRWISE MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS group_pairwise_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  accepted_by UUID REFERENCES users(id), -- Who made the decision (user_a or user_b)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id) -- Ensure consistent ordering
);

-- ============================================
-- 2. UPDATE CHATS TABLE FOR LOCK STATUS
-- ============================================

ALTER TABLE chats ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS lock_reason TEXT; -- Reason why group is locked (e.g., "A user has chosen not to match with another user")

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_group_pairwise_matches_chat_id ON group_pairwise_matches(chat_id);
CREATE INDEX IF NOT EXISTS idx_group_pairwise_matches_user_a ON group_pairwise_matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_group_pairwise_matches_user_b ON group_pairwise_matches(user_b_id);
CREATE INDEX IF NOT EXISTS idx_group_pairwise_matches_status ON group_pairwise_matches(status);
CREATE INDEX IF NOT EXISTS idx_chats_is_locked ON chats(is_locked);
CREATE INDEX IF NOT EXISTS idx_chats_lock_expires_at ON chats(lock_expires_at);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE group_pairwise_matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES FOR GROUP_PAIRWISE_MATCHES
-- ============================================

-- Users can view pairwise matches for chats they're members of
CREATE POLICY "group_pairwise_matches_view" ON group_pairwise_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = group_pairwise_matches.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

-- Users can update their own pairwise matches (accept/reject)
CREATE POLICY "group_pairwise_matches_update_own" ON group_pairwise_matches
  FOR UPDATE USING (
    (user_a_id = auth.uid() OR user_b_id = auth.uid())
    AND status = 'pending'
  );

-- System can insert pairwise matches (via service role)
CREATE POLICY "group_pairwise_matches_insert" ON group_pairwise_matches
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 6. FUNCTION TO CHECK IF GROUP CAN UNLOCK
-- ============================================

CREATE OR REPLACE FUNCTION can_group_unlock(p_chat_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  pending_count INTEGER;
  rejected_count INTEGER;
BEGIN
  -- Count pending pairwise matches
  SELECT COUNT(*) INTO pending_count
  FROM group_pairwise_matches
  WHERE chat_id = p_chat_id AND status = 'pending';
  
  -- Count rejected pairwise matches
  SELECT COUNT(*) INTO rejected_count
  FROM group_pairwise_matches
  WHERE chat_id = p_chat_id AND status = 'rejected';
  
  -- Group can unlock if no pending and no rejected matches
  RETURN pending_count = 0 AND rejected_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. FUNCTION TO GET PAIRWISE MATCH PROGRESS
-- ============================================

CREATE OR REPLACE FUNCTION get_pairwise_match_progress(p_chat_id UUID)
RETURNS TABLE (
  total_pairs INTEGER,
  accepted_pairs INTEGER,
  pending_pairs INTEGER,
  rejected_pairs INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_pairs,
    COUNT(*) FILTER (WHERE status = 'accepted')::INTEGER as accepted_pairs,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_pairs,
    COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER as rejected_pairs
  FROM group_pairwise_matches
  WHERE chat_id = p_chat_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGER TO UPDATE CHAT LOCK STATUS
-- ============================================

CREATE OR REPLACE FUNCTION update_chat_lock_status()
RETURNS TRIGGER AS $$
DECLARE
  can_unlock BOOLEAN;
  has_rejection BOOLEAN;
BEGIN
  -- Check if group can unlock
  can_unlock := can_group_unlock(NEW.chat_id);
  
  -- Check if there are any rejections
  SELECT EXISTS (
    SELECT 1 FROM group_pairwise_matches
    WHERE chat_id = NEW.chat_id AND status = 'rejected'
  ) INTO has_rejection;
  
  -- Update chat lock status
  IF can_unlock THEN
    UPDATE chats
    SET 
      is_locked = false,
      invitation_status = 'active',
      lock_reason = NULL
    WHERE id = NEW.chat_id;
  ELSIF has_rejection THEN
    UPDATE chats
    SET 
      is_locked = true,
      lock_reason = 'A user has chosen not to match with another user'
    WHERE id = NEW.chat_id;
  ELSE
    UPDATE chats
    SET 
      is_locked = true,
      lock_reason = NULL
    WHERE id = NEW.chat_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create separate triggers for INSERT and UPDATE
-- INSERT trigger: Always fire (no WHEN condition needed)
CREATE TRIGGER trigger_update_chat_lock_status_insert
  AFTER INSERT ON group_pairwise_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_lock_status();

-- UPDATE trigger: Only fire when status changes
CREATE TRIGGER trigger_update_chat_lock_status_update
  AFTER UPDATE ON group_pairwise_matches
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_chat_lock_status();

-- ============================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE group_pairwise_matches IS 'Tracks pairwise match acceptance/rejection status for group chat members';
COMMENT ON COLUMN group_pairwise_matches.status IS 'Match status: pending (not yet decided), accepted (user accepted), rejected (user rejected)';
COMMENT ON COLUMN group_pairwise_matches.accepted_by IS 'User who made the decision (either user_a or user_b)';
COMMENT ON COLUMN chats.is_locked IS 'Whether the group chat is locked until all pairwise matches are accepted';
COMMENT ON COLUMN chats.lock_expires_at IS 'When the lock expires (72 hours from creation)';
COMMENT ON COLUMN chats.lock_reason IS 'Reason why the group is locked (e.g., rejection message)';

