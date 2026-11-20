-- Unit / entrance details students care about when browsing listings
ALTER TABLE public.housing_listings
  ADD COLUMN IF NOT EXISTS house_number TEXT,
  ADD COLUMN IF NOT EXISTS house_letter TEXT,
  ADD COLUMN IF NOT EXISTS house_number_addition TEXT,
  ADD COLUMN IF NOT EXISTS floor_level TEXT,
  ADD COLUMN IF NOT EXISTS unit_label TEXT;

COMMENT ON COLUMN public.housing_listings.house_number IS 'Street number from address lookup';
COMMENT ON COLUMN public.housing_listings.house_letter IS 'Dutch huisletter e.g. A in 23A';
COMMENT ON COLUMN public.housing_listings.house_number_addition IS 'Dutch toevoeging e.g. 2 in 23-2';
COMMENT ON COLUMN public.housing_listings.floor_level IS 'Floor / level label for apartments (ground, 1, 2, attic, …)';
COMMENT ON COLUMN public.housing_listings.unit_label IS 'Apartment / unit identifier within the building';
