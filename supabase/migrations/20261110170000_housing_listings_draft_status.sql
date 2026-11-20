-- Allow draft listings and persist in-progress wizard state
ALTER TABLE public.housing_listings DROP CONSTRAINT IF EXISTS housing_listings_status_check;
ALTER TABLE public.housing_listings
  ADD CONSTRAINT housing_listings_status_check
  CHECK (status IN ('active', 'pending', 'suspended', 'rented', 'expired', 'draft'));

ALTER TABLE public.housing_listings
  ADD COLUMN IF NOT EXISTS wizard_draft JSONB,
  ADD COLUMN IF NOT EXISTS wizard_step TEXT;

COMMENT ON COLUMN public.housing_listings.wizard_draft IS
  'Exact listing wizard form state for draft/resume; preferred over columns when present.';
COMMENT ON COLUMN public.housing_listings.wizard_step IS
  'Last completed or current wizard section id (basics, location, ...).';
