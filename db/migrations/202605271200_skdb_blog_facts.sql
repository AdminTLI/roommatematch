-- Aggregated Studiekeuzedatabase facts for blog automation and internal tooling

CREATE TABLE IF NOT EXISTS public.skdb_blog_facts (
  fact_key TEXT NOT NULL,
  skdb_release TEXT NOT NULL,
  peildatum DATE NOT NULL,
  fact_value JSONB NOT NULL,
  label TEXT,
  scope TEXT DEFAULT 'nl',
  source_table TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (fact_key, skdb_release, peildatum)
);

CREATE INDEX IF NOT EXISTS idx_skdb_blog_facts_release ON public.skdb_blog_facts (skdb_release);
CREATE INDEX IF NOT EXISTS idx_skdb_blog_facts_imported ON public.skdb_blog_facts (imported_at DESC);

ALTER TABLE public.skdb_blog_facts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.skdb_blog_facts IS 'Aggregated SKDB statistics for editorial use; not exposed to end users directly.';

-- Service role only (cron / admin scripts)
CREATE POLICY skdb_blog_facts_service_all ON public.skdb_blog_facts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
