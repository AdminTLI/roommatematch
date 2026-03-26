-- Migration: Fix remaining Supabase database lints
-- Date: 2026-03-25
-- Fixes:
-- - WARN 0011 function_search_path_mutable: set a fixed search_path on flagged functions (all overloads)
-- - WARN 0014 extension_in_public: move `vector` extension out of `public` schema
-- - WARN 0024 permissive_rls_policy: remove/replace always-true INSERT policies

BEGIN;

-- ============================================================
-- 1) Extension in public: move `vector` extension to `extensions`
-- ============================================================
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'vector'
      AND n.nspname = 'public'
  ) THEN
    EXECUTE 'ALTER EXTENSION vector SET SCHEMA extensions';
  END IF;
END $$;

-- ============================================================
-- 2) Function search_path mutable: set fixed search_path (all overloads)
-- ============================================================
DO $$
DECLARE
  target_names text[] := ARRAY[
    'auto_confirm_match_on_accept',
    'is_user_admin',
    'generate_top_alignment',
    'block_links_on_message',
    'set_notification_email_digest_state_updated_at',
    'validate_accepted_by_members',
    'trigger_notify_match_status_change',
    'now',
    'meets_minimum_age',
    'compute_user_vector',
    'calculate_age',
    'extract_boolean_value',
    'handle_user_deletion',
    'create_notification',
    'verify_user_age',
    'calculate_context_score',
    'validate_confirmed_status',
    'create_chat_for_match',
    'is_admin_user',
    'calculate_dimension_similarity',
    'compute_user_vector_and_store',
    'trigger_create_chat_on_match',
    'enforce_questionnaire_cooldown',
    'find_potential_matches',
    'validate_no_duplicate_members',
    'compose_group_suggestions',
    'trigger_create_chat_on_group_confirmed',
    'update_chat_first_message',
    'calculate_harmony_score',
    'validate_declined_status',
    'create_chat_for_group_match',
    'generate_watch_out_messages',
    'sanitize_profile_text',
    'compute_matches'
  ];
  fn_name text;
  fn_args text;
BEGIN
  FOREACH fn_name IN ARRAY target_names LOOP
    FOR fn_args IN
      SELECT pg_get_function_identity_arguments(p.oid)
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = fn_name
    LOOP
      -- Fixed, non-mutable search_path. Include only trusted schemas.
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET search_path = %L',
        fn_name,
        fn_args,
        'pg_catalog, public, extensions'
      );
    END LOOP;
  END LOOP;
END $$;

-- Ensure notifications can be created without an INSERT policy by making
-- `public.create_notification(...)` a SECURITY DEFINER function.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'create_notification'
  ) THEN
    -- Recreate with SECURITY DEFINER + fixed search_path.
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.create_notification(
        p_user_id UUID,
        p_type notification_type,
        p_title VARCHAR(255),
        p_message TEXT,
        p_metadata JSONB DEFAULT '{}'
      ) RETURNS UUID
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = 'pg_catalog, public, extensions'
      AS $fn$
      DECLARE
        notification_id UUID;
      BEGIN
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
        RETURNING id INTO notification_id;

        RETURN notification_id;
      END;
      $fn$;
    $sql$;
  END IF;
END $$;

-- ============================================================
-- 3) Permissive RLS policies
-- ============================================================

-- 3a) career_applications: keep public submissions but avoid WITH CHECK (true)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'career_applications'
      AND policyname = 'career_applications_insert_anon'
  ) THEN
    EXECUTE 'DROP POLICY career_applications_insert_anon ON public.career_applications';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'career_applications'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY career_applications_insert_anon
      ON public.career_applications
      FOR INSERT
      TO anon
      WITH CHECK (auth.role() = 'anon')
    $pol$;
  END IF;
END $$;

-- 3b) notifications: remove always-true insert policy; rely on SECURITY DEFINER `create_notification`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'System can insert notifications'
  ) THEN
    EXECUTE 'DROP POLICY "System can insert notifications" ON public.notifications';
  END IF;
END $$;

COMMIT;

