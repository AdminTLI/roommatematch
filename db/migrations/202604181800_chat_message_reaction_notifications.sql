-- Add notification type for emoji reactions on the recipient's own messages
DO $$
BEGIN
  ALTER TYPE notification_type ADD VALUE 'chat_message_reaction';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Latest reaction from someone else on messages authored by p_user_id, per chat (for sidebar preview + sort)
CREATE OR REPLACE FUNCTION public.latest_reaction_on_my_messages_per_chat(
  p_user_id uuid,
  p_chat_ids uuid[]
)
RETURNS TABLE (
  chat_id uuid,
  reaction_at timestamptz,
  emoji text,
  reactor_id uuid
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT ON (m.chat_id)
    m.chat_id,
    mr.created_at AS reaction_at,
    mr.emoji,
    mr.user_id AS reactor_id
  FROM message_reactions mr
  INNER JOIN messages m ON m.id = mr.message_id
  WHERE m.chat_id = ANY(p_chat_ids)
    AND m.user_id = p_user_id
    AND mr.user_id IS DISTINCT FROM p_user_id
  ORDER BY m.chat_id, mr.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.latest_reaction_on_my_messages_per_chat(uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.latest_reaction_on_my_messages_per_chat(uuid, uuid[]) TO authenticated;
