-- Allow multiple universities (and other same-category POIs) per listing.
-- Enrichment deletes+reinserts per listing, so uniqueness is defensive only.

ALTER TABLE public.listing_nearby_pois
  DROP CONSTRAINT IF EXISTS listing_nearby_pois_listing_id_category_key;

CREATE UNIQUE INDEX IF NOT EXISTS listing_nearby_pois_listing_category_name_uidx
  ON public.listing_nearby_pois (listing_id, category, name);
