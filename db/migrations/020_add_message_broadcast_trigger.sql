-- Create trigger function to broadcast messages to realtime channels
-- This function broadcasts new messages to the broadcast channel: room:{chat_id}:messages
-- Uses Supabase's realtime.send() function to broadcast to channels

CREATE OR REPLACE FUNCTION broadcast_message_to_realtime()
RETURNS TRIGGER AS $$
DECLARE
  channel_name TEXT;
  payload JSONB;
BEGIN
  -- Construct the channel name: room:{chat_id}:messages
  channel_name := 'room:' || NEW.chat_id::TEXT || ':messages';
  
  -- Build the payload with the message data (matching what client expects)
  payload := jsonb_build_object(
    'id', NEW.id,
    'chat_id', NEW.chat_id,
    'user_id', NEW.user_id,
    'content', NEW.content,
    'created_at', NEW.created_at
  );
  
  -- Use Supabase realtime.send() to broadcast to the channel
  -- This sends a broadcast event with event name 'INSERT' and the payload
  PERFORM realtime.send(
    jsonb_build_object(
      'channel', channel_name,
      'event', 'INSERT',
      'payload', payload
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to broadcast message to realtime: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to broadcast messages after insert
CREATE TRIGGER trigger_broadcast_message_to_realtime
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_message_to_realtime();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION broadcast_message_to_realtime() TO authenticated;
GRANT EXECUTE ON FUNCTION broadcast_message_to_realtime() TO service_role;

