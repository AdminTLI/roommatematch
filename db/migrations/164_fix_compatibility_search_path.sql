-- Migration: Fix "function resolve_user_preferences(uuid) does not exist" in compatibility chain
-- Date: 2026-02-06
-- Description: Migration 066 set search_path = '' on resolve_user_preferences, get_dimension_value,
--              check_hard_constraints, and dimension functions. With empty search_path they cannot
--              find each other when called without schema. This sets search_path = 'public' for the
--              compatibility chain so compute_compatibility_score works again.

-- check_hard_constraints(uuid, uuid) - called first by compute_compatibility_score, calls resolve_user_preferences
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'check_hard_constraints') THEN
    EXECUTE 'ALTER FUNCTION public.check_hard_constraints(uuid, uuid) SET search_path = ''public''';
  END IF;
END $$;

-- resolve_user_preferences(uuid)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'resolve_user_preferences') THEN
    EXECUTE 'ALTER FUNCTION public.resolve_user_preferences(uuid) SET search_path = ''public''';
  END IF;
END $$;

-- get_dimension_value (all overloads)
DO $$
DECLARE
  func_sig TEXT;
BEGIN
  FOR func_sig IN
    SELECT pg_get_function_identity_arguments(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_dimension_value'
  LOOP
    EXECUTE format('ALTER FUNCTION public.get_dimension_value(%s) SET search_path = ''public''', func_sig);
  END LOOP;
END $$;

-- Dimension functions (single uuid arg each)
DO $$
DECLARE
  f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'get_cleanliness_dimension', 'get_noise_dimension', 'get_guests_dimension',
    'get_sleep_dimension', 'get_shared_spaces_dimension', 'get_substances_dimension',
    'get_study_social_dimension', 'get_home_vibe_dimension'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = f) THEN
      EXECUTE format('ALTER FUNCTION public.%I(uuid) SET search_path = ''public''', f);
    END IF;
  END LOOP;
END $$;
