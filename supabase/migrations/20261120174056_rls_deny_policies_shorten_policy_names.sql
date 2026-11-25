-- Follow-up: replace longer policy names (one hit the 63-char Postgres limit
-- and was truncated) with stable short names. Idempotent.

DROP POLICY IF EXISTS "Deny client access to heigit_usage_counters"
  ON public.heigit_usage_counters;
DROP POLICY IF EXISTS "Block anon and authenticated from heigit_usage_counters"
  ON public.heigit_usage_counters;
CREATE POLICY "Deny client access to heigit_usage_counters"
  ON public.heigit_usage_counters
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to host_protected_org_names"
  ON public.host_protected_org_names;
DROP POLICY IF EXISTS "Block anon and authenticated from host_protected_org_names"
  ON public.host_protected_org_names;
CREATE POLICY "Deny client access to host_protected_org_names"
  ON public.host_protected_org_names
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to registration_funnel_milestones"
  ON public.registration_funnel_milestones;
DROP POLICY IF EXISTS "Block anon and authenticated from registration_funnel_milestones"
  ON public.registration_funnel_milestones;
DROP POLICY IF EXISTS "Block anon and authenticated from registration_funnel_milestone"
  ON public.registration_funnel_milestones;
CREATE POLICY "Deny client access to registration_funnel_milestones"
  ON public.registration_funnel_milestones
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client access to registration_funnel_progress"
  ON public.registration_funnel_progress;
DROP POLICY IF EXISTS "Block anon and authenticated from registration_funnel_progress"
  ON public.registration_funnel_progress;
CREATE POLICY "Deny client access to registration_funnel_progress"
  ON public.registration_funnel_progress
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
