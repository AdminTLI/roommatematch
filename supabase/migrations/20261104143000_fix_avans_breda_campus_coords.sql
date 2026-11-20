-- Avans Breda main campus is Hogeschoollaan 1, not the western Lovensdijkstraat pin.
-- Old coords (51.588611, 4.776111) made Avans look closer than BUas for north-Breda listings.

UPDATE public.geo_reference_points
SET lat = 51.584026,
    lng = 4.797961
WHERE category = 'university'
  AND university_slug = 'avans';

-- Drop cached university distances so listings recompute against the corrected pin.
DELETE FROM public.listing_poi_routes
WHERE listing_id IN (
  SELECT listing_id
  FROM public.listing_nearby_pois
  WHERE category = 'university'
    AND (
      name ILIKE '%avans%'
      OR name ILIKE '%buas%'
      OR name ILIKE '%breda university%'
    )
);

DELETE FROM public.listing_nearby_pois
WHERE category = 'university'
  AND (
    name ILIKE '%avans%'
    OR name ILIKE '%buas%'
    OR name ILIKE '%breda university%'
  );
