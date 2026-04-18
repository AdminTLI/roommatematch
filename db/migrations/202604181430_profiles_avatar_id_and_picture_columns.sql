-- Programmatic avatar seed and private photo path (kept in sync with supabase/migrations/202604181430_progressive_disclosure_and_secure_photos.sql).
-- Apply on Postgres if you ship schema via db/migrations; without this, profile avatar updates fail with PostgREST "schema cache" errors.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_id TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS share_details_by_default BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.avatar_id IS 'DiceBear / programmatic avatar seed shown to matches until reveal.';
COMMENT ON COLUMN profiles.profile_picture_url IS 'Storage object path inside secure_profile_pics (not a public URL).';
COMMENT ON COLUMN profiles.share_details_by_default IS 'Reserved: auto-reveal details to new matches (default off).';
