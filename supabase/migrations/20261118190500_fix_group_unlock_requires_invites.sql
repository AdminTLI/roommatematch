-- Unlock only when invites + pairwise are clear; qualify names for empty search_path.
CREATE OR REPLACE FUNCTION public.can_group_unlock(p_chat_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  pending_pairs INTEGER;
  rejected_pairs INTEGER;
  pending_invites INTEGER;
  active_members INTEGER;
BEGIN
  SELECT COUNT(*) INTO pending_pairs
  FROM public.group_pairwise_matches
  WHERE chat_id = p_chat_id AND status = 'pending';

  SELECT COUNT(*) INTO rejected_pairs
  FROM public.group_pairwise_matches
  WHERE chat_id = p_chat_id AND status = 'rejected';

  SELECT COUNT(*) INTO pending_invites
  FROM public.group_invitations
  WHERE chat_id = p_chat_id AND status = 'pending';

  SELECT COUNT(*) INTO active_members
  FROM public.chat_members
  WHERE chat_id = p_chat_id AND status = 'active';

  RETURN pending_invites = 0
    AND pending_pairs = 0
    AND rejected_pairs = 0
    AND active_members >= 2;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_lock_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  can_unlock BOOLEAN;
  has_rejection BOOLEAN;
BEGIN
  can_unlock := public.can_group_unlock(NEW.chat_id);

  SELECT EXISTS (
    SELECT 1 FROM public.group_pairwise_matches
    WHERE chat_id = NEW.chat_id AND status = 'rejected'
  ) INTO has_rejection;

  IF can_unlock THEN
    UPDATE public.chats
    SET
      is_locked = false,
      invitation_status = 'active',
      lock_reason = NULL
    WHERE id = NEW.chat_id;
  ELSIF has_rejection THEN
    UPDATE public.chats
    SET
      is_locked = true,
      lock_reason = 'A user has chosen not to match with another user'
    WHERE id = NEW.chat_id;
  ELSE
    UPDATE public.chats
    SET
      is_locked = true,
      lock_reason = NULL
    WHERE id = NEW.chat_id;
  END IF;

  RETURN NEW;
END;
$$;
