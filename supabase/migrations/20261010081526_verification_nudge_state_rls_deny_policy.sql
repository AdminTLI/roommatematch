-- Linter 0008 (rls_enabled_no_policy): verification_nudge_state is service-role-only
-- (see 20261010100143). Explicit deny for PostgREST client roles documents intent.

DROP POLICY IF EXISTS "Block anon and authenticated from verification_nudge_state"
  ON public.verification_nudge_state;

CREATE POLICY "Block anon and authenticated from verification_nudge_state"
  ON public.verification_nudge_state
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
