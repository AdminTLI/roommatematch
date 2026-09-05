-- Clear Supabase security advisor findings:
-- - 0028 anon_security_definer_function_executable (public.lab_user_university_id)
-- - 0029 authenticated_security_definer_function_executable (public.lab_user_university_id)
-- - 0008 rls_enabled_no_policy (public.answer_distribution_counts, public.university_email_claims,
--   public.university_email_reuse_flags)

-- ── 1) lab_user_university_id: SECURITY DEFINER helper, currently unused by any RLS
-- policy (lab_wishes moved to a global, non-university-scoped board — see
-- domu_lab_rls_policy_fix / lab_wishes_global_scope). It should not be callable via
-- PostgREST at all. Match the harden_* pattern used for other internal helpers.
REVOKE ALL ON FUNCTION public.lab_user_university_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lab_user_university_id() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lab_user_university_id() TO postgres, service_role;

-- ── 2) rls_enabled_no_policy: explicit deny policies for admin/service-only tables.
-- These tables are RLS-enabled with no policies today, which already blocks all
-- anon/authenticated access by default — add explicit "deny" policies (same pattern
-- as 20260502160000 / 20260516160045) so the linter sees the intent documented.

-- answer_distribution_counts: GDPR-safe aggregate, written only by the
-- sync_answer_distribution_counts trigger and read only via the admin API
-- (service_role, which bypasses RLS).
DROP POLICY IF EXISTS "Block anon and authenticated from answer_distribution_counts" ON public.answer_distribution_counts;
CREATE POLICY "Block anon and authenticated from answer_distribution_counts"
  ON public.answer_distribution_counts
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- university_email_claims: exclusive email-claim ledger managed by service-role-only
-- verification flows.
DROP POLICY IF EXISTS "Block anon and authenticated from university_email_claims" ON public.university_email_claims;
CREATE POLICY "Block anon and authenticated from university_email_claims"
  ON public.university_email_claims
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- university_email_reuse_flags: super-admin review queue managed by service-role-only
-- flows.
DROP POLICY IF EXISTS "Block anon and authenticated from university_email_reuse_flags" ON public.university_email_reuse_flags;
CREATE POLICY "Block anon and authenticated from university_email_reuse_flags"
  ON public.university_email_reuse_flags
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
