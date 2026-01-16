-- Migration: Add Message Reactions
-- Date: 2025-01-23
-- Description: Adds message reactions table to support emoji reactions on messages

BEGIN;

-- ============================================
-- 1. CREATE MESSAGE_REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji ON message_reactions(emoji);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================
-- Users can view reactions on messages in chats they're part of
CREATE POLICY "message_reactions_select"
  ON message_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can insert their own reactions
CREATE POLICY "message_reactions_insert"
  ON message_reactions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

-- Users can delete their own reactions
CREATE POLICY "message_reactions_delete"
  ON message_reactions
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 5. ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

COMMENT ON TABLE message_reactions IS 'Stores emoji reactions on messages. Multiple reactions per message per user are allowed.';

COMMIT;
