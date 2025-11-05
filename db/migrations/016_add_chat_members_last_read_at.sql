-- Add last_read_at column to chat_members for unread tracking
ALTER TABLE chat_members 
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient unread queries
CREATE INDEX IF NOT EXISTS idx_chat_members_last_read_at 
ON chat_members(last_read_at);

-- Add comment for documentation
COMMENT ON COLUMN chat_members.last_read_at IS 'Timestamp when user last read messages in this chat';



