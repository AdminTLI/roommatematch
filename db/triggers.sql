-- Database Triggers and Functions for Roommate Match

-- Function to enforce 30-day cooldown on questionnaire changes
CREATE OR REPLACE FUNCTION enforce_questionnaire_cooldown()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if questionnaire-related fields are being updated
  IF TG_TABLE_NAME = 'profiles' THEN
    -- Check if any questionnaire-related fields are changing
    IF (
      OLD.degree_level IS DISTINCT FROM NEW.degree_level OR
      OLD.program IS DISTINCT FROM NEW.program OR
      OLD.campus IS DISTINCT FROM NEW.campus OR
      OLD.languages IS DISTINCT FROM NEW.languages
    ) THEN
      -- Enforce cooldown
      IF OLD.last_answers_changed_at IS NOT NULL AND 
         (NOW() - OLD.last_answers_changed_at) < INTERVAL '30 days' THEN
        RAISE EXCEPTION 'Questionnaire answers cannot be changed within 30 days. Last changed: %', OLD.last_answers_changed_at;
      END IF;
      -- Update timestamp
      NEW.last_answers_changed_at = NOW();
    END IF;
  ELSIF TG_TABLE_NAME = 'responses' THEN
    -- For responses table, check if value is changing
    IF OLD.value IS DISTINCT FROM NEW.value THEN
      -- Get the user's last answers changed time
      DECLARE
        last_changed TIMESTAMP WITH TIME ZONE;
      BEGIN
        SELECT last_answers_changed_at INTO last_changed
        FROM profiles
        WHERE user_id = NEW.user_id;
        
        IF last_changed IS NOT NULL AND 
           (NOW() - last_changed) < INTERVAL '30 days' THEN
          RAISE EXCEPTION 'Questionnaire answers cannot be changed within 30 days. Last changed: %', last_changed;
        END IF;
        
        -- Update the profile's last_answers_changed_at
        UPDATE profiles 
        SET last_answers_changed_at = NOW()
        WHERE user_id = NEW.user_id;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply cooldown trigger to profiles
CREATE TRIGGER enforce_questionnaire_cooldown_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_questionnaire_cooldown();

-- Apply cooldown trigger to responses
CREATE TRIGGER enforce_questionnaire_cooldown_responses
  BEFORE UPDATE ON responses
  FOR EACH ROW
  EXECUTE FUNCTION enforce_questionnaire_cooldown();

-- Function to sanitize profile text (remove PII)
CREATE OR REPLACE FUNCTION sanitize_profile_text()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove email addresses
  NEW.first_name = REGEXP_REPLACE(NEW.first_name, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL REMOVED]', 'gi');
  
  -- Remove phone numbers (various formats)
  NEW.first_name = REGEXP_REPLACE(NEW.first_name, '(\+31|0)[0-9\s\-\(\)]{8,}', '[PHONE REMOVED]', 'gi');
  
  -- Remove URLs
  NEW.first_name = REGEXP_REPLACE(NEW.first_name, 'https?://[^\s]+', '[URL REMOVED]', 'gi');
  
  -- Also sanitize program field if it exists
  IF NEW.program IS NOT NULL THEN
    NEW.program = REGEXP_REPLACE(NEW.program, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[EMAIL REMOVED]', 'gi');
    NEW.program = REGEXP_REPLACE(NEW.program, '(\+31|0)[0-9\s\-\(\)]{8,}', '[PHONE REMOVED]', 'gi');
    NEW.program = REGEXP_REPLACE(NEW.program, 'https?://[^\s]+', '[URL REMOVED]', 'gi');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply sanitization trigger to profiles
CREATE TRIGGER sanitize_profile_text_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_profile_text();

-- Function to block links in messages
CREATE OR REPLACE FUNCTION block_links_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for URL patterns
  IF NEW.content ~* 'https?://[^\s]+' THEN
    RAISE EXCEPTION 'Messages cannot contain links for safety reasons';
  END IF;
  
  -- Check for email addresses
  IF NEW.content ~* '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' THEN
    RAISE EXCEPTION 'Messages cannot contain email addresses for privacy reasons';
  END IF;
  
  -- Check for phone numbers
  IF NEW.content ~* '(\+31|0)[0-9\s\-\(\)]{8,}' THEN
    RAISE EXCEPTION 'Messages cannot contain phone numbers for privacy reasons';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply link blocking trigger to messages
CREATE TRIGGER block_links_on_message_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION block_links_on_message();

-- Function to compute user vector from questionnaire responses
CREATE OR REPLACE FUNCTION compute_user_vector(user_id UUID)
RETURNS vector AS $$
DECLARE
  result_vector vector(50) := array_fill(0.0, ARRAY[50])::vector;
  question_record RECORD;
  vector_index INTEGER;
  normalized_value DECIMAL;
BEGIN
  -- Map questionnaire responses to normalized vector positions
  -- This is a simplified mapping - in production, you'd have a more sophisticated mapping
  
  FOR question_record IN 
    SELECT r.question_key, r.value, qi.weight
    FROM responses r
    JOIN question_items qi ON qi.key = r.question_key
    WHERE r.user_id = compute_user_vector.user_id
  LOOP
    -- Map specific questions to vector positions
    CASE question_record.question_key
      -- Lifestyle dimensions (positions 0-9)
      WHEN 'sleep_start' THEN
        vector_index := 0;
        normalized_value := (question_record.value::DECIMAL - 20) / 12.0; -- 20-32 (8PM-8AM)
      WHEN 'sleep_end' THEN
        vector_index := 1;
        normalized_value := (question_record.value::DECIMAL - 5) / 12.0; -- 5-17 (5AM-5PM)
      WHEN 'study_intensity' THEN
        vector_index := 2;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'cleanliness_room' THEN
        vector_index := 3;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'cleanliness_kitchen' THEN
        vector_index := 4;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'noise_tolerance' THEN
        vector_index := 5;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'guests_frequency' THEN
        vector_index := 6;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'parties_frequency' THEN
        vector_index := 7;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'chores_preference' THEN
        vector_index := 8;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'alcohol_at_home' THEN
        vector_index := 9;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
        
      -- Social dimensions (positions 10-19)
      WHEN 'social_level' THEN
        vector_index := 10;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'food_sharing' THEN
        vector_index := 11;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
      WHEN 'utensils_sharing' THEN
        vector_index := 12;
        normalized_value := question_record.value::DECIMAL / 10.0; -- 0-10 scale
        
      -- Personality dimensions (positions 20-39) - Big Five
      WHEN 'extraversion' THEN
        vector_index := 20;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'agreeableness' THEN
        vector_index := 21;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'conscientiousness' THEN
        vector_index := 22;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'neuroticism' THEN
        vector_index := 23;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'openness' THEN
        vector_index := 24;
        normalized_value := question_record.value::DECIMAL / 10.0;
        
      -- Communication style (positions 40-49)
      WHEN 'conflict_style' THEN
        vector_index := 40;
        normalized_value := question_record.value::DECIMAL / 10.0;
      WHEN 'communication_preference' THEN
        vector_index := 41;
        normalized_value := question_record.value::DECIMAL / 10.0;
      ELSE
        -- Skip unmapped questions
        CONTINUE;
    END CASE;
    
    -- Apply weight and clamp to [0,1] range
    normalized_value := GREATEST(0, LEAST(1, normalized_value * question_record.weight));
    
    -- Update vector position
    result_vector[vector_index + 1] := normalized_value; -- PostgreSQL arrays are 1-indexed
  END LOOP;
  
  -- Normalize the entire vector
  result_vector := result_vector / sqrt(result_vector <#> result_vector);
  
  RETURN result_vector;
END;
$$ LANGUAGE plpgsql;

-- Function to compute matches for a user
CREATE OR REPLACE FUNCTION compute_matches(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  target_vector vector(50);
  target_profile RECORD;
  candidate_record RECORD;
  similarity_score DECIMAL;
  schedule_overlap DECIMAL;
  cleanliness_align DECIMAL;
  guests_noise_align DECIMAL;
  final_score DECIMAL;
  explanation JSONB;
  penalty DECIMAL := 0;
BEGIN
  -- Get target user's profile and vector
  SELECT * INTO target_profile FROM profiles WHERE user_id = target_user_id;
  SELECT vector INTO target_vector FROM user_vectors WHERE user_id = target_user_id;
  
  IF target_profile IS NULL OR target_vector IS NULL THEN
    RAISE EXCEPTION 'Target user profile or vector not found';
  END IF;
  
  -- Clear existing matches for this user
  DELETE FROM matches WHERE a_user = target_user_id OR b_user = target_user_id;
  
  -- Find compatible candidates
  FOR candidate_record IN
    SELECT 
      u.id as user_id,
      uv.vector,
      p.degree_level,
      p.program,
      p.campus,
      r_sleep_start.value as sleep_start,
      r_sleep_end.value as sleep_end,
      r_cleanliness.value as cleanliness,
      r_guests.value as guests_freq,
      r_noise.value as noise_tol
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    JOIN user_vectors uv ON uv.user_id = u.id
    LEFT JOIN responses r_sleep_start ON r_sleep_start.user_id = u.id AND r_sleep_start.question_key = 'sleep_start'
    LEFT JOIN responses r_sleep_end ON r_sleep_end.user_id = u.id AND r_sleep_end.question_key = 'sleep_end'
    LEFT JOIN responses r_cleanliness ON r_cleanliness.user_id = u.id AND r_cleanliness.question_key = 'cleanliness_room'
    LEFT JOIN responses r_guests ON r_guests.user_id = u.id AND r_guests.question_key = 'guests_frequency'
    LEFT JOIN responses r_noise ON r_noise.user_id = u.id AND r_noise.question_key = 'noise_tolerance'
    WHERE u.id != target_user_id
    AND p.university_id = target_profile.university_id
    AND p.verification_status = 'verified'
    AND u.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM matches m 
      WHERE (m.a_user = target_user_id AND m.b_user = u.id) 
      OR (m.b_user = target_user_id AND m.a_user = u.id)
    )
  LOOP
    -- Compute cosine similarity
    similarity_score := 1 - (target_vector <#> candidate_record.vector);
    
    -- Compute schedule overlap (simplified)
    schedule_overlap := 0.5; -- Placeholder - would compute actual overlap
    
    -- Compute cleanliness alignment
    IF candidate_record.cleanliness IS NOT NULL THEN
      cleanliness_align := 1 - ABS(target_profile.cleanliness - candidate_record.cleanliness::DECIMAL) / 10.0;
    ELSE
      cleanliness_align := 0.5;
    END IF;
    
    -- Compute guests/noise alignment
    IF candidate_record.guests_freq IS NOT NULL AND candidate_record.noise_tol IS NOT NULL THEN
      guests_noise_align := 1 - ABS(candidate_record.guests_freq::DECIMAL - candidate_record.noise_tol::DECIMAL) / 10.0;
    ELSE
      guests_noise_align := 0.5;
    END IF;
    
    -- Apply penalties for hard constraints
    penalty := 0;
    IF target_profile.degree_level != candidate_record.degree_level THEN
      penalty := penalty + 0.1;
    END IF;
    
    -- Calculate final score
    final_score := (0.55 * similarity_score) + 
                   (0.25 * schedule_overlap) + 
                   (0.10 * cleanliness_align) + 
                   (0.10 * guests_noise_align) - 
                   penalty;
    
    -- Only store matches above threshold
    IF final_score > 0.3 THEN
      explanation := jsonb_build_object(
        'similarity_score', similarity_score,
        'schedule_overlap', schedule_overlap,
        'cleanliness_align', cleanliness_align,
        'guests_noise_align', guests_noise_align,
        'penalty', penalty,
        'top_alignment', CASE 
          WHEN similarity_score > schedule_overlap AND similarity_score > cleanliness_align THEN 'personality'
          WHEN schedule_overlap > cleanliness_align THEN 'schedule'
          ELSE 'lifestyle'
        END,
        'watch_out', CASE
          WHEN penalty > 0.1 THEN 'different_preferences'
          WHEN cleanliness_align < 0.3 THEN 'cleanliness_differences'
          ELSE 'none'
        END
      );
      
      INSERT INTO matches (a_user, b_user, score, explanation, status)
      VALUES (target_user_id, candidate_record.user_id, final_score, explanation, 'pending');
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to compose group suggestions
CREATE OR REPLACE FUNCTION compose_group_suggestions(university_id UUID, group_size INTEGER DEFAULT 2)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
  group_members UUID[] := '{}';
  current_group UUID[];
  group_score DECIMAL;
  explanation JSONB;
BEGIN
  -- Clear existing group suggestions for this university
  DELETE FROM group_suggestions WHERE university_id = compose_group_suggestions.university_id;
  
  -- Get all verified users in the university
  FOR user_record IN
    SELECT u.id, uv.vector
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    JOIN user_vectors uv ON uv.user_id = u.id
    WHERE p.university_id = compose_group_suggestions.university_id
    AND p.verification_status = 'verified'
    AND u.is_active = true
    AND u.id NOT IN (SELECT unnest(member_ids) FROM group_suggestions WHERE status = 'accepted')
    ORDER BY RANDOM()
  LOOP
    -- Add user to current group
    group_members := array_append(group_members, user_record.id);
    
    -- If group is full, create suggestion
    IF array_length(group_members, 1) = group_size THEN
      -- Calculate group score (average pairwise similarity)
      group_score := 0;
      FOR i IN 1..array_length(group_members, 1) LOOP
        FOR j IN (i+1)..array_length(group_members, 1) LOOP
          -- Get similarity between members i and j
          SELECT COALESCE(AVG(score), 0.5) INTO group_score
          FROM matches
          WHERE ((a_user = group_members[i] AND b_user = group_members[j])
             OR (b_user = group_members[i] AND a_user = group_members[j]))
          AND status = 'accepted';
        END LOOP;
      END LOOP;
      
      group_score := group_score / (group_size * (group_size - 1) / 2);
      
      explanation := jsonb_build_object(
        'group_size', group_size,
        'avg_compatibility', group_score,
        'members_count', array_length(group_members, 1),
        'suggestion_reason', CASE
          WHEN group_score > 0.7 THEN 'high_compatibility'
          WHEN group_score > 0.5 THEN 'good_compatibility'
          ELSE 'balanced_group'
        END
      );
      
      INSERT INTO group_suggestions (university_id, group_size, member_ids, avg_score, explanation, status)
      VALUES (university_id, group_size, group_members, group_score, explanation, 'pending');
      
      -- Reset for next group
      group_members := '{}';
    END IF;
  END LOOP;
  
  -- Handle remaining users (create smaller groups if needed)
  IF array_length(group_members, 1) > 1 THEN
    group_score := 0.5; -- Default score for incomplete groups
    explanation := jsonb_build_object(
      'group_size', array_length(group_members, 1),
      'avg_compatibility', group_score,
      'members_count', array_length(group_members, 1),
      'suggestion_reason', 'remaining_users'
    );
    
    INSERT INTO group_suggestions (university_id, group_size, member_ids, avg_score, explanation, status)
    VALUES (university_id, array_length(group_members, 1), group_members, group_score, explanation, 'pending');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to handle user deletion (cascade cleanup)
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete related records in proper order to avoid constraint violations
  DELETE FROM message_reads WHERE user_id = OLD.id;
  DELETE FROM messages WHERE user_id = OLD.id;
  DELETE FROM chat_members WHERE user_id = OLD.id;
  DELETE FROM chats WHERE created_by = OLD.id;
  DELETE FROM reports WHERE reporter_id = OLD.id OR target_user_id = OLD.id;
  DELETE FROM forum_comments WHERE author_id = OLD.id;
  DELETE FROM forum_posts WHERE author_id = OLD.id;
  DELETE FROM matches WHERE a_user = OLD.id OR b_user = OLD.id;
  DELETE FROM group_suggestions WHERE OLD.id = ANY(member_ids);
  DELETE FROM user_vectors WHERE user_id = OLD.id;
  DELETE FROM responses WHERE user_id = OLD.id;
  DELETE FROM profiles WHERE user_id = OLD.id;
  DELETE FROM admins WHERE user_id = OLD.id;
  DELETE FROM app_events WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply deletion trigger to users
CREATE TRIGGER handle_user_deletion_trigger
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_deletion();

-- Function to auto-create user profile after auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, is_active)
  VALUES (NEW.id, NEW.email, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
