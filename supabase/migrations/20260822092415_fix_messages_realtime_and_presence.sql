-- Restore Supabase Realtime for the partitioned public.messages table.
-- The partition migration (20260430185739) recreated messages without publication,
-- REPLICA IDENTITY, or the broadcast trigger — breaking postgres_changes subscriptions.

-- Drop stale publication entry for the old unpartitioned table if present.
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

-- Add the partitioned parent to the realtime publication (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END;
$$;

-- Required for postgres_changes to include full row data.
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Recreate broadcast trigger on the partitioned parent (fires for all partitions).
DROP TRIGGER IF EXISTS trigger_broadcast_message_to_realtime ON public.messages;
CREATE TRIGGER trigger_broadcast_message_to_realtime
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_message_to_realtime();
