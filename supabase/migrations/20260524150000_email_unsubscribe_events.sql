-- Audit trail for email unsubscribe / preference changes made via signed
-- one-click links (the /unsubscribe page). We keep this separate from the
-- live preference JSONB on `profiles.notification_preferences` so we can
-- distinguish "user changed in settings" from "user clicked unsubscribe in
-- an email" — useful for deliverability investigations.

CREATE TABLE IF NOT EXISTS public.email_unsubscribe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changes JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'email_link',
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribe_events_user_id
  ON public.email_unsubscribe_events (user_id);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribe_events_created_at
  ON public.email_unsubscribe_events (created_at DESC);

ALTER TABLE public.email_unsubscribe_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit rows; nobody can write except the service
-- role (the unsubscribe API runs with service role to support unauthenticated
-- token-based access).
DROP POLICY IF EXISTS email_unsubscribe_events_own_read ON public.email_unsubscribe_events;
CREATE POLICY email_unsubscribe_events_own_read
  ON public.email_unsubscribe_events
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.email_unsubscribe_events IS
  'Audit log of preference changes made via signed one-click unsubscribe links.';
