-- Clean up existing self matches and prevent future ones

DELETE FROM matches WHERE a_user = b_user;

ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_no_self_match,
  ADD CONSTRAINT matches_no_self_match CHECK (a_user <> b_user);

-- Remove pair suggestions that contain the same member twice
DELETE FROM match_suggestions
WHERE kind = 'pair'
  AND array_length(member_ids, 1) = 2
  AND member_ids[1] = member_ids[2];

ALTER TABLE match_suggestions
  DROP CONSTRAINT IF EXISTS match_suggestions_distinct_members,
  ADD CONSTRAINT match_suggestions_distinct_members
    CHECK (
      kind <> 'pair'
      OR array_length(member_ids, 1) IS DISTINCT FROM 2
      OR member_ids[1] <> member_ids[2]
    );

-- Remove any self-match notifications that slipped through
DELETE FROM notifications
WHERE metadata->>'other_user_id' = user_id::text;

-- Ensure trigger refuses to create chats for self matches
CREATE OR REPLACE FUNCTION trigger_create_chat_on_match()
RETURNS TRIGGER AS $$
DECLARE
  chat_id UUID;
  user_a_name TEXT;
  user_b_name TEXT;
BEGIN
  IF NEW.a_user = NEW.b_user THEN
    RAISE EXCEPTION 'Matches cannot reference the same user twice';
  END IF;

  chat_id := create_chat_for_match(NEW.id, NEW.a_user, NEW.b_user);
  
  SELECT p1.first_name, p2.first_name
  INTO user_a_name, user_b_name
  FROM profiles p1, profiles p2
  WHERE p1.user_id = NEW.a_user AND p2.user_id = NEW.b_user;
  
  PERFORM create_notification(
    NEW.a_user,
    'match_created',
    'New Match Found!',
    'You have a new match with ' || COALESCE(user_b_name, 'a potential roommate') || '! Check out their profile.',
    jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.b_user)
  );
  
  PERFORM create_notification(
    NEW.b_user,
    'match_created', 
    'New Match Found!',
    'You have a new match with ' || COALESCE(user_a_name, 'a potential roommate') || '! Check out their profile.',
    jsonb_build_object('match_id', NEW.id, 'chat_id', chat_id, 'other_user_id', NEW.a_user)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

