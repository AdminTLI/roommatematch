-- GDPR / DPIA Compliance Fix: Chat-level message retention
-- =============================================================================
-- Root cause:
--   The `set_message_retention` trigger sets
--     retention_expires_at = CURRENT_TIMESTAMP + 365 days
--   on each individual message at insert time.  `purge_expired_messages()` then
--   deletes messages whose per-message `retention_expires_at` has passed.
--
--   This violates the DPIA Section 1.1.4 retention commitment:
--     "Retention: 1 year after last message"
--   which specifies *chat-level* retention: **all** messages in a conversation must
--   be preserved for one year after the *most recent* message in that chat.
--
-- Concrete failure scenario:
--   User A and User B exchange messages in Jan 2025 (per-message expires Jan 2026)
--   and then exchange more messages in Jun 2026.  The daily cron would have already
--   deleted the Jan 2025 messages in early 2026, even though the chat is still
--   active — a premature erasure that violates both the DPIA and a user's Art. 15
--   right of access (incomplete GDPR export).
--
-- Fix:
--   Replace `purge_expired_messages()` with a chat-level retention implementation:
--   a chat is eligible for full deletion only when its most recent message is older
--   than 365 days.  The per-message `retention_expires_at` trigger is preserved for
--   forward compatibility but is no longer the sole gate for deletion.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.purge_expired_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- DPIA §1.1.4 "1 year after last message" = chat-level retention.
  -- Find chats whose most recent message is older than 365 days,
  -- then delete ALL their messages (those with and without retention_expires_at).
  -- The per-message retention_expires_at trigger is kept for observability but
  -- the authoritative deletion gate is now the chat's last activity timestamp.
  WITH inactive_chats AS (
    SELECT chat_id
    FROM public.messages
    GROUP BY chat_id
    HAVING MAX(created_at) < pg_catalog.now() - INTERVAL '365 days'
  )
  DELETE FROM public.messages m
  USING inactive_chats ic
  WHERE m.chat_id = ic.chat_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Preserve existing grant: only service_role may call this function.
REVOKE ALL ON FUNCTION public.purge_expired_messages() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_messages() TO service_role;
