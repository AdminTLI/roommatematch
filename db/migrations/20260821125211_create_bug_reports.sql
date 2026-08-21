-- Bug reports: product/error reports from authenticated users with diagnostic snapshots

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (
    category IN (
      'ui_display',
      'loading',
      'matching',
      'chat',
      'account',
      'performance',
      'other'
    )
  ),
  description TEXT NOT NULL,
  diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'triaged', 'resolved', 'dismissed')
  ),
  admin_notes TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_category ON public.bug_reports(category);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

COMMENT ON TABLE public.bug_reports IS
  'User-submitted product bug reports with client diagnostic snapshots for triage and future AI analysis.';
COMMENT ON COLUMN public.bug_reports.diagnostics IS
  'JSON snapshot: URL, device/browser, viewport, console/network errors, server metadata. No screenshots.';

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bug_reports_insert_own ON public.bug_reports;
CREATE POLICY bug_reports_insert_own
  ON public.bug_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS bug_reports_select_own ON public.bug_reports;
CREATE POLICY bug_reports_select_own
  ON public.bug_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger (reuse pattern if function exists; else create)
CREATE OR REPLACE FUNCTION public.set_bug_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bug_reports_updated_at ON public.bug_reports;
CREATE TRIGGER trg_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_bug_reports_updated_at();
