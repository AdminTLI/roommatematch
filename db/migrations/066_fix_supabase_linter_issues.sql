-- Migration: Fix Supabase Security Advisor Issues
-- Date: 2025-01-XX
-- Description: Addresses all errors and warnings from Supabase Security Advisor
--
-- Issues Fixed:
-- 1. ERROR: Remove SECURITY DEFINER from user_study_year_v view (if exists)
-- 2. WARNINGS: Add SET search_path = '' to all functions with mutable search_path
-- 3. WARNING: Move vector extension from public schema to extensions schema
-- 4. NOTE: Leaked password protection must be enabled in Supabase Dashboard (Auth settings)

BEGIN;

-- ============================================
-- 1. FIX VIEW: Remove SECURITY DEFINER (if exists)
-- ============================================

-- Check if view exists with SECURITY DEFINER and recreate without it
-- Views should use SECURITY INVOKER by default (the user's permissions)
DO $$
BEGIN
  -- Drop and recreate the view to ensure it doesn't have SECURITY DEFINER
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'user_study_year_v') THEN
    DROP VIEW IF EXISTS public.user_study_year_v CASCADE;
    
    -- Recreate the view using the latest definition from migration 046
    CREATE VIEW public.user_study_year_v AS
    SELECT 
        ua.user_id,
        -- Calculate study year using month-aware academic year logic
        CASE 
            -- Month-aware calculation when both months and expected_graduation_year are provided
            WHEN ua.study_start_month IS NOT NULL 
                 AND ua.graduation_month IS NOT NULL 
                 AND ua.expected_graduation_year IS NOT NULL THEN
                GREATEST(1, LEAST(
                    -- Current academic year (starts in September, month 9)
                    -- Academic year offset: if current month >= 9, add 1 to year
                    (EXTRACT(YEAR FROM now())::int + CASE WHEN EXTRACT(MONTH FROM now()) >= 9 THEN 1 ELSE 0 END) -
                    -- Start academic year (if start month >= 9, add 1 to year)
                    (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1,
                    -- Maximum possible year (programme duration)
                    -- Graduation academic year (if grad month >= 9, add 1 to year)
                    (ua.expected_graduation_year + CASE WHEN ua.graduation_month >= 9 THEN 1 ELSE 0 END) -
                    (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1
                ))
            -- Fallback to old calculation for backward compatibility (when months are NULL)
            ELSE
                GREATEST(1, EXTRACT(YEAR FROM now())::int - ua.study_start_year + 1)
        END AS study_year
    FROM public.user_academic ua;
  END IF;
END $$;

-- ============================================
-- 2. FIX FUNCTIONS: Add SET search_path = ''
-- ============================================

-- Function: get_noise_dimension
CREATE OR REPLACE FUNCTION public.get_noise_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_resolved JSONB;
  v_sensitivity JSONB;
  v_background JSONB;
  v_volume JSONB;
  v_sensitivity_norm NUMERIC;
  v_background_norm NUMERIC;
  v_volume_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := public.resolve_user_preferences(p_user_id);
  
  v_sensitivity := public.get_dimension_value(p_user_id, 'M3_Q1', v_resolved);
  v_background := public.get_dimension_value(p_user_id, 'M3_Q2', v_resolved);
  v_volume := public.get_dimension_value(p_user_id, 'M3_Q4', v_resolved);
  
  -- Higher sensitivity/agreement = lower noise tolerance (invert for normalization)
  v_sensitivity_norm := 1.0 - public.normalize_likert_value(v_sensitivity);
  v_background_norm := 1.0 - public.normalize_likert_value(v_background);
  -- Volume: low volume = high quiet preference (invert)
  v_volume_norm := 1.0 - public.normalize_bipolar_value(v_volume);
  
  -- Average (higher = prefers quieter)
  RETURN COALESCE((v_sensitivity_norm + v_background_norm + v_volume_norm) / 3.0, 0.5);
END;
$$;

-- Function: set_message_retention
CREATE OR REPLACE FUNCTION public.set_message_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 1 year (365 days) after message creation
  IF NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := public.now() + INTERVAL '365 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function: purge_expired_verifications
CREATE OR REPLACE FUNCTION public.purge_expired_verifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete verification records that have passed retention period
  DELETE FROM public.verifications
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < public.now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: log_compatibility_debug
-- Note: This function may not exist, but we'll try to update it if it does
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_compatibility_debug' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.log_compatibility_debug SET search_path = ''''';
  END IF;
END $$;

-- Function: has_recent_export_request
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_recent_export_request' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.has_recent_export_request SET search_path = ''''';
  END IF;
END $$;

-- Function: is_user_admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use SECURITY DEFINER to bypass RLS when checking admin status
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Function: generate_top_alignment
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_top_alignment' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.generate_top_alignment SET search_path = ''''';
  END IF;
END $$;

-- Function: block_links_on_message
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'block_links_on_message' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.block_links_on_message SET search_path = ''''';
  END IF;
END $$;

-- Function: get_substances_dimension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_substances_dimension' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_substances_dimension SET search_path = ''''';
  END IF;
END $$;

-- Function: trigger_notify_match_status_change
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_notify_match_status_change' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.trigger_notify_match_status_change SET search_path = ''''';
  END IF;
END $$;

-- Function: normalize_mcq_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'normalize_mcq_value' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.normalize_mcq_value SET search_path = ''''';
  END IF;
END $$;

-- Function: meets_minimum_age
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'meets_minimum_age' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.meets_minimum_age SET search_path = ''''';
  END IF;
END $$;

-- Function: update_dsar_requests_updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_dsar_requests_updated_at' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_dsar_requests_updated_at SET search_path = ''''';
  END IF;
END $$;

-- Function: get_home_vibe_dimension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_home_vibe_dimension' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_home_vibe_dimension SET search_path = ''''';
  END IF;
END $$;

-- Function: recalculate_group_compatibility
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'recalculate_group_compatibility' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.recalculate_group_compatibility SET search_path = ''''';
  END IF;
END $$;

-- Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin, using SECURITY DEFINER to avoid RLS recursion
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Function: generate_referral_code
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_referral_code' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.generate_referral_code SET search_path = ''''';
  END IF;
END $$;

-- Function: check_hard_constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_hard_constraints' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.check_hard_constraints SET search_path = ''''';
  END IF;
END $$;

-- Function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = public.now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function: compute_user_vector
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'compute_user_vector' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.compute_user_vector SET search_path = ''''';
  END IF;
END $$;

-- Function: get_user_active_consents (handle multiple overloads)
DO $$
DECLARE
  func_signature TEXT;
BEGIN
  -- Update all overloads of get_user_active_consents
  FOR func_signature IN
    SELECT pg_get_function_identity_arguments(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_user_active_consents'
  LOOP
    EXECUTE format('ALTER FUNCTION public.get_user_active_consents(%s) SET search_path = ''''', func_signature);
  END LOOP;
END $$;

-- Function: calculate_age
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_age' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.calculate_age SET search_path = ''''';
  END IF;
END $$;

-- Function: generate_ticket_number
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_ticket_number' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.generate_ticket_number SET search_path = ''''';
  END IF;
END $$;

-- Function: get_sleep_dimension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_sleep_dimension' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_sleep_dimension SET search_path = ''''';
  END IF;
END $$;

-- Function: extract_boolean_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'extract_boolean_value' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.extract_boolean_value SET search_path = ''''';
  END IF;
END $$;

-- Function: handle_user_deletion
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_user_deletion' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.handle_user_deletion SET search_path = ''''';
  END IF;
END $$;

-- Function: room_messages_broadcast_trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'room_messages_broadcast_trigger' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.room_messages_broadcast_trigger SET search_path = ''''';
  END IF;
END $$;

-- Function: get_shared_spaces_dimension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_shared_spaces_dimension' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_shared_spaces_dimension SET search_path = ''''';
  END IF;
END $$;

-- Function: verify_user_age
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'verify_user_age' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.verify_user_age SET search_path = ''''';
  END IF;
END $$;

-- Function: get_study_social_dimension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_study_social_dimension' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_study_social_dimension SET search_path = ''''';
  END IF;
END $$;

-- Function: set_report_retention
CREATE OR REPLACE FUNCTION public.set_report_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 1 year (365 days) after report is resolved
  IF NEW.status IN ('actioned', 'dismissed') AND NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := public.now() + INTERVAL '365 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function: calculate_programme_duration_months
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_programme_duration_months' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.calculate_programme_duration_months SET search_path = ''''';
  END IF;
END $$;

-- Function: update_chat_lock_status
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_chat_lock_status' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_chat_lock_status SET search_path = ''''';
  END IF;
END $$;

-- Function: create_chat_for_match
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_chat_for_match' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.create_chat_for_match SET search_path = ''''';
  END IF;
END $$;

-- Function: get_pairwise_match_progress
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_pairwise_match_progress' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_pairwise_match_progress SET search_path = ''''';
  END IF;
END $$;

-- Function: normalize_likert_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'normalize_likert_value' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.normalize_likert_value SET search_path = ''''';
  END IF;
END $$;

-- Function: get_guests_dimension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_guests_dimension' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_guests_dimension SET search_path = ''''';
  END IF;
END $$;

-- Function: update_programmes_updated_at
CREATE OR REPLACE FUNCTION public.update_programmes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = public.now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function: calculate_dimension_similarity
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_dimension_similarity' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.calculate_dimension_similarity SET search_path = ''''';
  END IF;
END $$;

-- Function: extract_actual_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'extract_actual_value' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.extract_actual_value SET search_path = ''''';
  END IF;
END $$;

-- Function: set_ticket_number
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_ticket_number' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.set_ticket_number SET search_path = ''''';
  END IF;
END $$;

-- Function: find_potential_matches
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'find_potential_matches' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.find_potential_matches SET search_path = ''''';
  END IF;
END $$;

-- Function: get_cleanliness_dimension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_cleanliness_dimension' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.get_cleanliness_dimension SET search_path = ''''';
  END IF;
END $$;

-- Function: trigger_create_chat_on_match
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_create_chat_on_match' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.trigger_create_chat_on_match SET search_path = ''''';
  END IF;
END $$;

-- Function: set_dsar_sla_deadline
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_dsar_sla_deadline' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.set_dsar_sla_deadline SET search_path = ''''';
  END IF;
END $$;

-- Function: enforce_questionnaire_cooldown
CREATE OR REPLACE FUNCTION public.enforce_questionnaire_cooldown()
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
      IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
        -- Service role can always update (used for onboarding submissions)
        NEW.last_answers_changed_at = public.now();
      ELSIF OLD.last_answers_changed_at IS NOT NULL AND 
         (public.now() - OLD.last_answers_changed_at) < INTERVAL '30 days' THEN
        -- Enforce cooldown for regular users
        RAISE EXCEPTION 'Questionnaire answers cannot be changed within 30 days. Last changed: %', OLD.last_answers_changed_at;
      ELSE
        -- First time or cooldown expired, allow update
        NEW.last_answers_changed_at = public.now();
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'responses' THEN
    -- For responses table, check if value is changing
    IF OLD.value IS DISTINCT FROM NEW.value THEN
      -- Allow service role (used for onboarding submission) to bypass cooldown
      IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
        -- Service role can always update (used for onboarding submissions)
        UPDATE public.profiles 
        SET last_answers_changed_at = public.now()
        WHERE user_id = NEW.user_id;
      ELSE
        -- Get the user's last answers changed time
        DECLARE
          last_changed TIMESTAMP WITH TIME ZONE;
        BEGIN
          SELECT last_answers_changed_at INTO last_changed
          FROM public.profiles
          WHERE user_id = NEW.user_id;
          
          IF last_changed IS NOT NULL AND 
             (public.now() - last_changed) < INTERVAL '30 days' THEN
            RAISE EXCEPTION 'Questionnaire answers cannot be changed within 30 days. Last changed: %', last_changed;
          END IF;
          
          -- Update the profile's last_answers_changed_at
          UPDATE public.profiles 
          SET last_answers_changed_at = public.now()
          WHERE user_id = NEW.user_id;
        END;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function: update_chat_status_on_invitations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_chat_status_on_invitations' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_chat_status_on_invitations SET search_path = ''''';
  END IF;
END $$;

-- Function: update_programme_duration_months
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_programme_duration_months' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_programme_duration_months SET search_path = ''''';
  END IF;
END $$;

-- Function: update_user_consents_updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_consents_updated_at' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_user_consents_updated_at SET search_path = ''''';
  END IF;
END $$;

-- Function: can_group_unlock
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_group_unlock' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.can_group_unlock SET search_path = ''''';
  END IF;
END $$;

-- Function: purge_expired_reports
CREATE OR REPLACE FUNCTION public.purge_expired_reports()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.reports
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < public.now()
    AND status IN ('actioned', 'dismissed');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_dimension_value (handle multiple overloads)
DO $$
DECLARE
  func_signature TEXT;
BEGIN
  -- Update all overloads of get_dimension_value
  FOR func_signature IN
    SELECT pg_get_function_identity_arguments(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_dimension_value'
  LOOP
    EXECUTE format('ALTER FUNCTION public.get_dimension_value(%s) SET search_path = ''''', func_signature);
  END LOOP;
END $$;

-- Function: anonymize_inactive_accounts
CREATE OR REPLACE FUNCTION public.anonymize_inactive_accounts()
RETURNS INTEGER AS $$
DECLARE
  anonymized_count INTEGER;
  two_years_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  two_years_ago := public.now() - INTERVAL '2 years';
  
  -- Anonymize user data (set to generic values)
  UPDATE public.profiles
  SET 
    first_name = 'Deleted',
    last_name = 'User',
    phone = NULL,
    bio = NULL,
    updated_at = public.now()
  WHERE user_id IN (
    SELECT id FROM public.users
    WHERE updated_at < two_years_ago
      AND is_active = false
  );
  
  GET DIAGNOSTICS anonymized_count = ROW_COUNT;
  RETURN anonymized_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: compose_group_suggestions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'compose_group_suggestions' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.compose_group_suggestions SET search_path = ''''';
  END IF;
END $$;

-- Function: trigger_create_chat_on_group_confirmed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_create_chat_on_group_confirmed' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.trigger_create_chat_on_group_confirmed SET search_path = ''''';
  END IF;
END $$;

-- Function: purge_expired_app_events
CREATE OR REPLACE FUNCTION public.purge_expired_app_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.app_events
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < public.now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: update_chat_first_message
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_chat_first_message' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_chat_first_message SET search_path = ''''';
  END IF;
END $$;

-- Function: can_view_minimal_profile
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_view_minimal_profile' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.can_view_minimal_profile SET search_path = ''''';
  END IF;
END $$;

-- Function: purge_expired_messages
CREATE OR REPLACE FUNCTION public.purge_expired_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.messages
  WHERE retention_expires_at IS NOT NULL
    AND retention_expires_at < public.now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: set_verification_retention
CREATE OR REPLACE FUNCTION public.set_verification_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 4 weeks (28 days) after verification update
  IF NEW.status = 'approved' AND NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := public.now() + INTERVAL '28 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function: calculate_harmony_score
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_harmony_score' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.calculate_harmony_score SET search_path = ''''';
  END IF;
END $$;

-- Function: set_app_event_retention
CREATE OR REPLACE FUNCTION public.set_app_event_retention()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention expiry to 90 days after event creation
  IF NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := public.now() + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function: create_chat_for_group_match
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_chat_for_group_match' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.create_chat_for_group_match SET search_path = ''''';
  END IF;
END $$;

-- Function: generate_watch_out_messages
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_watch_out_messages' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.generate_watch_out_messages SET search_path = ''''';
  END IF;
END $$;

-- Function: sanitize_profile_text
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'sanitize_profile_text' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.sanitize_profile_text SET search_path = ''''';
  END IF;
END $$;

-- Function: compute_matches
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'compute_matches' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.compute_matches SET search_path = ''''';
  END IF;
END $$;

-- Function: compute_compatibility_score
-- This is already fixed in migration 048, but ensuring it's correct
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'compute_compatibility_score' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.compute_compatibility_score SET search_path = ''''';
  END IF;
END $$;

-- Function: calculate_context_score
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_context_score' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.calculate_context_score SET search_path = ''''';
  END IF;
END $$;

-- Function: normalize_bipolar_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'normalize_bipolar_value' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.normalize_bipolar_value SET search_path = ''''';
  END IF;
END $$;

-- Function: resolve_user_preferences
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'resolve_user_preferences' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.resolve_user_preferences SET search_path = ''''';
  END IF;
END $$;

-- ============================================
-- 3. FIX EXTENSION: Move vector extension from public schema
-- ============================================

-- Note: Moving extensions is complex and may break existing code
-- The recommended approach is to create the extension in a dedicated schema
-- However, this requires careful migration as existing code may reference vector types
-- For now, we'll document this and provide a manual migration path

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Attempt to move vector extension (this may fail if there are dependencies)
-- Note: This is a complex operation that may require manual intervention
DO $$
BEGIN
  -- Check if vector extension exists in public schema
  IF EXISTS (
    SELECT 1 FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'vector' AND n.nspname = 'public'
  ) THEN
    -- Try to move it (this may require dropping and recreating)
    -- WARNING: This is a destructive operation that may break existing code
    -- Commented out for safety - uncomment only after thorough testing
    /*
    DROP EXTENSION IF EXISTS vector CASCADE;
    CREATE EXTENSION vector SCHEMA extensions;
    */
    
    -- For now, just log a warning
    RAISE NOTICE 'Vector extension is in public schema. Manual migration required.';
    RAISE NOTICE 'To fix: 1) Drop extension CASCADE, 2) Create in extensions schema, 3) Update all vector type references';
  END IF;
END $$;

COMMIT;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Leaked Password Protection: This must be enabled in Supabase Dashboard
--    Go to: Authentication > Settings > Password Security
--    Enable "Leaked Password Protection"
--
-- 2. Vector Extension: Moving the extension requires careful migration
--    as it may break existing code that references vector types.
--    Consider this a manual task that requires testing.

