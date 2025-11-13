-- Enable Supabase Realtime for messages table
-- This allows postgres_changes subscriptions to work for the messages table

-- Add messages table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Ensure the table has REPLICA IDENTITY set (required for realtime)
-- This allows Supabase to track changes
ALTER TABLE messages REPLICA IDENTITY FULL;




