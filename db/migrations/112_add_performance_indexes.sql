-- Performance Indexes for Critical Queries
-- Migration: 112_add_performance_indexes.sql
-- Description: Adds indexes to improve query performance for match suggestions, messages, and chat members

-- Match suggestions indexes
-- Note: match_suggestions uses member_ids (UUID array), not user_id
-- This GIN index helps with the contains query on member_ids (used in listSuggestionsForUser)
CREATE INDEX IF NOT EXISTS idx_match_suggestions_member_ids_gin 
  ON match_suggestions USING GIN (member_ids)
  WHERE member_ids IS NOT NULL;

-- Index for status and created_at (for filtering and sorting)
CREATE INDEX IF NOT EXISTS idx_match_suggestions_status_created 
  ON match_suggestions(status, created_at DESC)
  WHERE status IS NOT NULL;

-- Composite index for common query pattern: status + created_at + fit_index
CREATE INDEX IF NOT EXISTS idx_match_suggestions_status_created_fit 
  ON match_suggestions(status, created_at DESC, fit_index DESC)
  WHERE status IS NOT NULL;

-- Messages indexes
-- Used for: Loading messages in chat, pagination
CREATE INDEX IF NOT EXISTS idx_messages_chat_created 
  ON messages(chat_id, created_at DESC)
  WHERE chat_id IS NOT NULL;

-- Index for user_id in messages (for finding user's messages)
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
  ON messages(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Chat members indexes
-- Used for: Checking membership, loading chat list
CREATE INDEX IF NOT EXISTS idx_chat_members_user_chat 
  ON chat_members(user_id, chat_id)
  WHERE user_id IS NOT NULL AND chat_id IS NOT NULL;

-- Index for chat_id (for loading all members of a chat)
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id 
  ON chat_members(chat_id)
  WHERE chat_id IS NOT NULL;

-- Profiles indexes (if missing)
-- Used for: User profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
  ON profiles(user_id)
  WHERE user_id IS NOT NULL;

-- Index for university_id (for filtering by university)
CREATE INDEX IF NOT EXISTS idx_profiles_university_id 
  ON profiles(university_id)
  WHERE university_id IS NOT NULL;

-- Message reads indexes
-- Used for: Read receipts queries
CREATE INDEX IF NOT EXISTS idx_message_reads_message_user 
  ON message_reads(message_id, user_id)
  WHERE message_id IS NOT NULL AND user_id IS NOT NULL;

-- Index for user_id (for finding all read messages by a user)
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id 
  ON message_reads(user_id)
  WHERE user_id IS NOT NULL;

-- Comments on indexes for documentation
COMMENT ON INDEX idx_match_suggestions_member_ids_gin IS 'GIN index for filtering match suggestions by member_ids array (used in listSuggestionsForUser)';
COMMENT ON INDEX idx_match_suggestions_status_created IS 'Index for filtering and sorting match suggestions by status and creation date';
COMMENT ON INDEX idx_messages_chat_created IS 'Index for loading messages in a chat, ordered by creation date (descending)';
COMMENT ON INDEX idx_chat_members_user_chat IS 'Index for checking chat membership and loading user chats';

