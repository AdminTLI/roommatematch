-- Migration: Add audit logging for service role questionnaire cooldown bypasses
-- This ensures all service role bypasses are logged for security auditing

-- Update the cooldown function to log service role bypasses
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
      -- Allow service role (used for onboarding submission) to bypass cooldown
      -- Service role is used when submitting complete onboarding, which should always be allowed
      IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
        -- Log the bypass for audit purposes
        -- Use the user being updated as admin_user_id (required field)
        -- Note in metadata that this was done via service role
        BEGIN
          INSERT INTO admin_actions (admin_user_id, action, entity_type, entity_id, metadata)
          VALUES (
            NEW.user_id,
            'questionnaire_cooldown_bypass',
            'user',
            NEW.user_id,
            jsonb_build_object(
              'reason', 'onboarding_submission',
              'bypass_method', 'service_role',
              'changed_fields', jsonb_build_object(
                'degree_level', OLD.degree_level IS DISTINCT FROM NEW.degree_level,
                'program', OLD.program IS DISTINCT FROM NEW.program,
                'campus', OLD.campus IS DISTINCT FROM NEW.campus,
                'languages', OLD.languages IS DISTINCT FROM NEW.languages
              ),
              'previous_last_changed', OLD.last_answers_changed_at,
              'timestamp', NOW()
            )
          );
        EXCEPTION WHEN OTHERS THEN
          -- Log error but don't fail the update
          -- This ensures the bypass still works even if audit logging fails
          RAISE WARNING 'Failed to log service role bypass: %', SQLERRM;
        END;
        
        -- Service role can always update (used for onboarding submissions)
        NEW.last_answers_changed_at = NOW();
      ELSIF OLD.last_answers_changed_at IS NOT NULL AND 
         (NOW() - OLD.last_answers_changed_at) < INTERVAL '30 days' THEN
        -- Enforce cooldown for regular users
        RAISE EXCEPTION 'Questionnaire answers cannot be changed within 30 days. Last changed: %', OLD.last_answers_changed_at;
      ELSE
        -- First time or cooldown expired, allow update
        NEW.last_answers_changed_at = NOW();
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'responses' THEN
    -- For responses table, check if value is changing
    IF OLD.value IS DISTINCT FROM NEW.value THEN
      -- Allow service role (used for onboarding submission) to bypass cooldown
      IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
        -- Log the bypass for audit purposes
        BEGIN
          INSERT INTO admin_actions (admin_user_id, action, entity_type, entity_id, metadata)
          VALUES (
            NEW.user_id,
            'questionnaire_cooldown_bypass',
            'response',
            NEW.id,
            jsonb_build_object(
              'reason', 'onboarding_submission',
              'bypass_method', 'service_role',
              'question_key', NEW.question_key,
              'previous_value', OLD.value,
              'new_value', NEW.value,
              'timestamp', NOW()
            )
          );
        EXCEPTION WHEN OTHERS THEN
          -- Log error but don't fail the update
          RAISE WARNING 'Failed to log service role bypass: %', SQLERRM;
        END;
        
        -- Service role can always update (used for onboarding submissions)
        UPDATE profiles 
        SET last_answers_changed_at = NOW()
        WHERE user_id = NEW.user_id;
      ELSE
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
