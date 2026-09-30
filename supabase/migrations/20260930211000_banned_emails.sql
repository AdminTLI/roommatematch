-- Banned email denylist for ban-evasion prevention (login + university emails).
-- No document numbers or identity hashes — email only.

CREATE TABLE IF NOT EXISTS public.banned_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized TEXT NOT NULL,
  source_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT banned_emails_email_normalized_key UNIQUE (email_normalized)
);

CREATE INDEX IF NOT EXISTS idx_banned_emails_source_user
  ON public.banned_emails (source_user_id)
  WHERE source_user_id IS NOT NULL;

COMMENT ON TABLE public.banned_emails IS
  'Normalized emails blocked from signup after ban/suspend. No identity hashes.';

ALTER TABLE public.banned_emails ENABLE ROW LEVEL SECURITY;

-- Service role / admin client only; no public policies.
DROP POLICY IF EXISTS banned_emails_no_public ON public.banned_emails;
CREATE POLICY banned_emails_no_public
  ON public.banned_emails
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
