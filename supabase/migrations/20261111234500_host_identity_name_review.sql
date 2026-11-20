-- Protected housing org names that require admin approval when claimed
CREATE TABLE IF NOT EXISTS public.host_protected_org_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_host_protected_org_names_active
  ON public.host_protected_org_names (active);

ALTER TABLE public.host_protected_org_names ENABLE ROW LEVEL SECURITY;

-- Host identity review fields
ALTER TABLE public.host_profiles
  ADD COLUMN IF NOT EXISTS identity_review_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS identity_review_display_name TEXT,
  ADD COLUMN IF NOT EXISTS identity_review_company_name TEXT,
  ADD COLUMN IF NOT EXISTS identity_review_matched_org TEXT,
  ADD COLUMN IF NOT EXISTS identity_review_message TEXT,
  ADD COLUMN IF NOT EXISTS identity_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_review_notes TEXT;

ALTER TABLE public.host_profiles
  DROP CONSTRAINT IF EXISTS host_profiles_identity_review_status_check;

ALTER TABLE public.host_profiles
  ADD CONSTRAINT host_profiles_identity_review_status_check
  CHECK (identity_review_status IN ('none', 'pending', 'approved', 'rejected'));

COMMENT ON COLUMN public.host_profiles.identity_review_status IS
  'none | pending | approved | rejected — org/agency name claims needing admin review';

INSERT INTO public.host_protected_org_names (name, normalized_name, notes)
VALUES
  ('Kamernet', 'kamernet', 'NL room platform'),
  ('Kamer.nl', 'kamernl', 'NL room platform'),
  ('HousingAnywhere', 'housinganywhere', 'International housing platform'),
  ('Housing Anywhere', 'housinganywhere2', 'Variant spelling'),
  ('Roomspot', 'roomspot', 'NL student housing'),
  ('Holland2Stay', 'holland2stay', 'NL furnished apartments'),
  ('The Student Hotel', 'thestudenthotel', 'Student hotel brand'),
  ('SSH', 'ssh', 'Dutch student housing foundation'),
  ('DUWO', 'duwo', 'Dutch student housing'),
  ('Idealis', 'idealis', 'Student housing Wageningen area'),
  ('Vestide', 'vestide', 'Student housing Eindhoven'),
  ('Our Domus', 'ourdomus', 'Student housing'),
  ('Sparrow', 'sparrow', 'Housing platform'),
  ('Spotahome', 'spotahome', 'Mid-term rentals'),
  ('Uniplaces', 'uniplaces', 'Student housing platform'),
  ('Nestpick', 'nestpick', 'Housing platform'),
  ('Pararius', 'pararius', 'NL rental platform'),
  ('Funda', 'funda', 'NL property platform'),
  ('Direct Wonen', 'directwonen', 'NL rentals'),
  ('Rentola', 'rentola', 'Rental aggregator'),
  ('Student Experience', 'studentexperience', 'Student housing'),
  ('Xior', 'xior', 'Student housing'),
  ('The Social Hub', 'thesocialhub', 'Student/hybrid hotel'),
  ('Camelot', 'camelot', 'Student housing'),
  ('Greystar', 'greystar', 'Purpose-built student accommodation')
ON CONFLICT (normalized_name) DO NOTHING;
