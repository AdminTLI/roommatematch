-- Instant chat delivery:
-- 1) Ensure partitioned public.messages is in supabase_realtime (postgres_changes backup)
-- 2) Fix broadcast_message_to_realtime to use realtime.send(payload, event, topic, private)
-- 3) Align broadcast topic with existing realtime.messages RLS: chat:{chat_id}:messages

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages_unpartitioned_old'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.messages_unpartitioned_old;
  END IF;
END;
$$;

DO $$
BEGIN
  -- Partitioned parents may already be in pg_publication_rel even when
  -- pg_publication_tables only lists leaf partitions.
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END;
$$;

ALTER TABLE public.messages REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.broadcast_message_to_realtime()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  channel_name text;
  payload jsonb;
BEGIN
  -- Must match realtime.messages RLS policies: chat:%:messages
  channel_name := 'chat:' || NEW.chat_id::text || ':messages';

  payload := jsonb_build_object(
    'id', NEW.id,
    'chat_id', NEW.chat_id,
    'user_id', NEW.user_id,
    'content', NEW.content,
    'created_at', NEW.created_at,
    'reply_to_id', NEW.reply_to_id,
    'metadata', NEW.metadata
  );

  -- Signature: realtime.send(payload jsonb, event text, topic text, private boolean)
  PERFORM realtime.send(
    payload,
    'INSERT',
    channel_name,
    true
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to broadcast message to realtime: %', SQLERRM;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_broadcast_message_to_realtime ON public.messages;
CREATE TRIGGER trigger_broadcast_message_to_realtime
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_message_to_realtime();

REVOKE ALL ON FUNCTION public.broadcast_message_to_realtime() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.broadcast_message_to_realtime() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_message_to_realtime() TO service_role;
