-- Fix one-sided match accept notifications.
-- Previously both users got "Match Accepted!" which implied a mutual match.
-- Only the non-acceptor should be notified, with "Someone wants to match with you".
-- The matches-table trigger cannot identify who accepted, so one-sided notifies
-- are owned by the respond API. This trigger only fires on mutual confirmation.

CREATE OR REPLACE FUNCTION public.trigger_notify_match_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_a_name TEXT;
  user_b_name TEXT;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get user names
  SELECT p1.first_name, p2.first_name
  INTO user_a_name, user_b_name
  FROM profiles p1, profiles p2
  WHERE p1.user_id = NEW.a_user AND p2.user_id = NEW.b_user;

  -- Only notify on mutual confirmation. One-sided accepts are handled in the API
  -- so the recipient gets "Someone wants to match with you" (not the acceptor).
  IF NEW.status = 'confirmed' THEN
    PERFORM create_notification(
      NEW.a_user,
      'match_confirmed',
      'Match Confirmed!',
      'It''s official! You and ' || COALESCE(user_b_name, 'your match') || ' are now matched.',
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.b_user)
    );

    PERFORM create_notification(
      NEW.b_user,
      'match_confirmed',
      'Match Confirmed!',
      'It''s official! You and ' || COALESCE(user_a_name, 'your match') || ' are now matched.',
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.a_user)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rewrite misleading one-sided accept copy for recipients still waiting to respond.
UPDATE public.notifications
SET
  title = 'Someone wants to match',
  message = 'Someone wants to match with you. Check your matches to respond.'
WHERE type = 'match_accepted'
  AND (
    title = 'Match Accepted!'
    OR message ILIKE '%accepted your match request%'
    OR message ILIKE '%you have matched with someone%'
  );

-- Suggestion notifications should not imply a mutual match.
UPDATE public.notifications
SET message = 'We found a potential roommate for you. Check your matches to see who.'
WHERE type = 'match_created'
  AND message ILIKE '%you have matched with someone%';

-- Drop duplicate match_accepted rows sent to the acceptor (both users were notified).
-- Keep the notification for users who have NOT accepted the suggestion yet.
DELETE FROM public.notifications n
USING public.match_suggestions ms
WHERE n.type = 'match_accepted'
  AND n.metadata->>'match_id' = ms.id::text
  AND n.user_id = ANY (COALESCE(ms.accepted_by, '{}'::uuid[]))
  AND cardinality(COALESCE(ms.accepted_by, '{}'::uuid[])) = 1
  AND ms.status = 'accepted';
