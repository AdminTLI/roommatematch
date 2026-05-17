-- Platform-wide settings (singleton row) editable from /admin/settings

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.platform_settings (id, settings)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.platform_settings IS
  'Singleton platform configuration (SEO, maintenance mode, registration, matching limits, notifications).';
