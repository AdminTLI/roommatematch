-- Host profile photo shown on student listing pages
ALTER TABLE public.host_profiles
  ADD COLUMN IF NOT EXISTS avatar_path TEXT;

COMMENT ON COLUMN public.host_profiles.avatar_path IS
  'Storage path in listing-photos bucket for the host profile photo (host-avatars/{user_id}/...).';
