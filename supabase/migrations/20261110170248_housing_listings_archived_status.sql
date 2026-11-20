-- Allow admins to archive listings so they leave the student marketplace
-- while remaining visible in admin history.
ALTER TABLE public.housing_listings DROP CONSTRAINT IF EXISTS housing_listings_status_check;
ALTER TABLE public.housing_listings
  ADD CONSTRAINT housing_listings_status_check
  CHECK (status IN ('active', 'pending', 'suspended', 'rented', 'expired', 'draft', 'archived'));

COMMENT ON COLUMN public.housing_listings.status IS
  'Listing lifecycle: active (student-visible when approved), pending, draft, suspended, rented, expired, archived (admin-hidden from students).';
