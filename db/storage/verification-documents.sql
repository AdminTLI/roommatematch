-- Storage bucket for verification documents
-- This creates the bucket and sets up RLS policies for secure document storage

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to upload their own verification documents
CREATE POLICY "verification_documents_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow users to view their own verification documents
CREATE POLICY "verification_documents_view_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy to allow admins to view all verification documents
CREATE POLICY "verification_documents_admin_view" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- Policy to allow service role full access (for processing)
CREATE POLICY "verification_documents_service_role" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role');
