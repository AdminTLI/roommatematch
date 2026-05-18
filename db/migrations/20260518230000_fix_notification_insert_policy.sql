-- Migration: Harden notifications INSERT RLS policy
-- Date: 2026-05-18
-- Security fix: The open "System can insert notifications" policy used WITH CHECK (true),
-- allowing any authenticated user to INSERT notifications for arbitrary user_ids via the
-- PostgREST REST API.  This enables notification spam and phishing against other users.
--
-- Correct model: notifications are inserted exclusively via the SECURITY DEFINER function
-- public.create_notification() (which runs as the table owner and bypasses RLS), or via
-- the service_role key used by server-side admin clients.  No permissive INSERT policy is
-- needed for the `authenticated` role.
--
-- This migration is idempotent: it drops the old permissive policy (if it still exists
-- after an earlier lint-fix migration) and replaces it with a service_role-only guard.

BEGIN;

-- Drop the old permissive INSERT policy if it is still present
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Add a replacement policy that only allows inserts from the service_role.
-- Regular authenticated inserts must go through public.create_notification().
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'Service role can insert notifications'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "Service role can insert notifications" ON public.notifications
        FOR INSERT
        WITH CHECK (auth.jwt()->>'role' = 'service_role')
    $pol$;
  END IF;
END $$;

COMMIT;
