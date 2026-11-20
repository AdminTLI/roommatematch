-- WWS (Woningwaarderingsstelsel) certification for housing listings.
-- Hosts upload proof; admins set certified / not_certified / under_review.

DO $$ BEGIN
  CREATE TYPE public.wws_certification_status AS ENUM (
    'under_review',
    'certified',
    'not_certified'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.housing_listings
  ADD COLUMN IF NOT EXISTS wws_status public.wws_certification_status NOT NULL DEFAULT 'under_review',
  ADD COLUMN IF NOT EXISTS wws_documents TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS wws_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS wws_review_notes TEXT;

COMMENT ON COLUMN public.housing_listings.wws_status IS
  'Admin decision on WWS rent-points certification: under_review until reviewed.';
COMMENT ON COLUMN public.housing_listings.wws_documents IS
  'Signed URLs or storage paths for host-uploaded WWS proof (images/PDF).';

CREATE INDEX IF NOT EXISTS idx_housing_listings_wws_status
  ON public.housing_listings (wws_status);
