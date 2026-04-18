-- Private Supabase Storage bucket for post-reveal profile photos (object path stored on profiles.profile_picture_url).
-- Apply this on the Supabase Postgres instance if you use db/migrations without supabase/migrations push.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secure_profile_pics',
  'secure_profile_pics',
  FALSE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS secure_profile_pics_insert_own ON storage.objects;
CREATE POLICY secure_profile_pics_insert_own
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS secure_profile_pics_update_own ON storage.objects;
CREATE POLICY secure_profile_pics_update_own
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS secure_profile_pics_delete_own ON storage.objects;
CREATE POLICY secure_profile_pics_delete_own
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS secure_profile_pics_select_own ON storage.objects;
CREATE POLICY secure_profile_pics_select_own
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'secure_profile_pics'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
