-- Admin institutional metrics: nationality for domestic/international split,
-- last_seen_at for activity-gated retention-style analytics (optional; falls back to users.updated_at in API).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.nationality IS 'Nationality or citizenship label/ISO from verification; used only in aggregated admin analytics (binary domestic vs international).';
COMMENT ON COLUMN profiles.last_seen_at IS 'Last client-reported presence/activity timestamp for analytics gating.';
