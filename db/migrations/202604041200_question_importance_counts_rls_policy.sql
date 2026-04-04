-- Supabase linter (0008): RLS was enabled on question_importance_counts with no policies.
-- Counts are updated only by SECURITY DEFINER triggers on question_importance_ticks; clients never touch this table.
-- Explicit service-role policy matches db/migrations/202603251230_add_missing_rls_policies.sql.

DROP POLICY IF EXISTS "Service role can manage question importance counts" ON public.question_importance_counts;

CREATE POLICY "Service role can manage question importance counts"
  ON public.question_importance_counts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
