-- Trigger ran with search_path = '' but referenced unqualified table names,
-- so accepting an invite failed with: relation "group_invitations" does not exist.
CREATE OR REPLACE FUNCTION public.update_chat_status_on_invitations()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  pending_count INTEGER;
  total_invitations INTEGER;
BEGIN
  SELECT COUNT(*) INTO pending_count
  FROM public.group_invitations
  WHERE chat_id = NEW.chat_id AND status = 'pending';

  SELECT COUNT(*) INTO total_invitations
  FROM public.group_invitations
  WHERE chat_id = NEW.chat_id;

  IF pending_count = 0 AND total_invitations > 0 THEN
    UPDATE public.chats
    SET invitation_status = 'active'
    WHERE id = NEW.chat_id AND invitation_status = 'inviting';
  END IF;

  RETURN NEW;
END;
$function$;
