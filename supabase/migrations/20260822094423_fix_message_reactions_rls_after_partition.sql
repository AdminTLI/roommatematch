-- Fix RLS policies on message_reactions and message_reads that still reference
-- messages_unpartitioned_old after the messages table was partitioned.
-- New messages live in public.messages; reactions/read receipts on those rows
-- were invisible to clients because the policies joined the stale table name.

DROP POLICY IF EXISTS "message_reactions_select" ON public.message_reactions;
CREATE POLICY "message_reactions_select"
  ON public.message_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.messages m
      JOIN public.chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message_reactions_insert" ON public.message_reactions;
CREATE POLICY "message_reactions_insert"
  ON public.message_reactions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.messages m
      JOIN public.chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chat members can read read receipts" ON public.message_reads;
CREATE POLICY "Chat members can read read receipts"
  ON public.message_reads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.messages m
      JOIN public.chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reads.message_id
        AND cm.user_id = auth.uid()
    )
  );
