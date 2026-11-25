-- Linter 0008 (rls_enabled_no_policy): these tables are service-role-only.
-- Explicit deny for PostgREST client roles documents intent and clears the advisor.
-- service_role bypasses RLS; app code already uses createAdminClient for these tables.
-- Policy names stay ≤63 chars (Postgres identifier limit).

ALTER TABLE IF EXISTS public.heigit_usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.host_protected_org_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registration_funnel_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registration_funnel_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny client access to heigit_usage_counters"
  ON public.heigit_usage_counters;
CREATE POLICY "Deny client access to heigit_usage_counters"
  ON public.heigit_usage_counters
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to host_protected_org_names"
  ON public.host_protected_org_names;
CREATE POLICY "Deny client access to host_protected_org_names"
  ON public.host_protected_org_names
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to registration_funnel_milestones"
  ON public.registration_funnel_milestones;
CREATE POLICY "Deny client access to registration_funnel_milestones"
  ON public.registration_funnel_milestones
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to registration_funnel_progress"
  ON public.registration_funnel_progress;
CREATE POLICY "Deny client access to registration_funnel_progress"
  ON public.registration_funnel_progress
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
