-- Restore a fixed search_path after the one-sided match notification rewrite
-- recreated this trigger without one (Supabase lint 0011).

CREATE OR REPLACE FUNCTION public.trigger_notify_match_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public, extensions
AS $$
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
$$;
