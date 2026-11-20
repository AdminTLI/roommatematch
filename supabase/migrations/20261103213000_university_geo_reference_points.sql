-- Add HBO/WO universities as curated geo reference points for housing distances.
-- Coords: prefer known main-campus pins; otherwise fall back to city_centre of the university city.

ALTER TABLE public.geo_reference_points
  DROP CONSTRAINT IF EXISTS geo_reference_points_category_check;

ALTER TABLE public.geo_reference_points
  ADD CONSTRAINT geo_reference_points_category_check
  CHECK (category IN ('city_centre', 'train_station', 'university'));

ALTER TABLE public.geo_reference_points
  ADD COLUMN IF NOT EXISTS kind text,
  ADD COLUMN IF NOT EXISTS university_slug text,
  ADD COLUMN IF NOT EXISTS university_id uuid REFERENCES public.universities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS geo_reference_points_university_slug_idx
  ON public.geo_reference_points (university_slug)
  WHERE university_slug IS NOT NULL;

-- Precise main-campus overrides (lat/lng). Slugs match public.universities.slug.
CREATE TEMP TABLE tmp_uni_coords (
  slug text PRIMARY KEY,
  kind text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL
);

INSERT INTO tmp_uni_coords (slug, kind, lat, lng) VALUES
  -- WO
  ('uva', 'wo', 52.363078, 4.912350),
  ('vu', 'wo', 52.333786, 4.865658),
  ('uu', 'wo', 52.085478, 5.172839),
  ('leiden', 'wo', 52.157912, 4.485012),
  ('rug', 'wo', 53.219383, 6.566502),
  ('eur', 'wo', 51.917278, 4.525978),
  ('tud', 'wo', 51.998455, 4.373905),
  ('tue', 'wo', 51.448180, 5.490510),
  ('utwente', 'wo', 52.239447, 6.856609),
  ('wur', 'wo', 51.985310, 5.663590),
  ('ru', 'wo', 51.823010, 5.865020),
  ('um', 'wo', 50.847020, 5.686010),
  ('tilburg', 'wo', 51.563980, 5.068970),
  ('ou', 'wo', 50.882980, 5.960210),
  ('uvh', 'wo_special', 52.091980, 5.123210),
  ('pthu', 'wo_special', 52.334210, 4.866540),
  ('tua', 'wo_special', 52.211120, 5.969450),
  ('tuu', 'wo_special', 52.090740, 5.121420),
  -- HBO (main campus / city pin)
  ('aeres', 'hbo', 51.985310, 5.663590),
  ('ahk', 'hbo', 52.367600, 4.904100),
  ('artez', 'hbo', 51.985100, 5.898700),
  ('avans', 'hbo', 51.584026, 4.797961), -- Hogeschoollaan 1, Breda
  ('buas', 'hbo', 51.585200, 4.795400),
  ('che', 'hbo', 52.043600, 5.668100),
  ('codarts', 'hbo', 51.917000, 4.472000),
  ('hhs', 'hbo', 52.067500, 4.324000),
  ('dekempel', 'hbo', 51.481000, 5.661000),
  ('dae', 'hbo', 51.447500, 5.456800),
  ('driestar', 'hbo', 52.011600, 4.710000),
  ('fontys', 'hbo', 51.451200, 5.481200),
  ('gerritrietveld', 'hbo', 52.343800, 4.858200),
  ('han', 'hbo', 51.842600, 5.859300),
  ('hanze', 'hbo', 53.219383, 6.566502),
  ('has', 'hbo', 51.697800, 5.303700),
  ('hdk-denhaag', 'hbo', 52.078663, 4.288788),
  ('inholland', 'hbo', 52.336500, 4.917800),
  ('ipabo', 'hbo', 52.355800, 4.918900),
  ('kpz', 'hbo', 52.512500, 6.094400),
  ('hsleiden', 'hbo', 52.160100, 4.497000),
  ('hr', 'hbo', 51.917200, 4.484500),
  ('hu', 'hbo', 52.085500, 5.175000),
  ('hva', 'hbo', 52.359000, 4.908500),
  ('viaa', 'hbo', 52.512500, 6.094400),
  ('hku', 'hbo', 52.090700, 5.121400),
  ('hotelschool', 'hbo', 52.093000, 4.282000),
  ('hz', 'hbo', 51.456000, 3.570000),
  ('iselinge', 'hbo', 51.965000, 6.288000),
  ('marnix', 'hbo', 52.090700, 5.121400),
  ('nhlstenden', 'hbo', 53.201200, 5.799900),
  ('saxion', 'hbo', 52.221500, 6.893700),
  ('thomasmore', 'hbo', 51.922500, 4.479170),
  ('vhl', 'hbo', 53.201200, 5.799900),
  ('windesheim', 'hbo', 52.512500, 6.094400),
  ('zuyd', 'hbo', 50.851400, 5.690900);

INSERT INTO public.geo_reference_points (
  category, name, city, lat, lng, kind, university_slug, university_id, is_active
)
SELECT
  'university',
  u.name,
  u.city,
  COALESCE(tc.lat, cc.lat),
  COALESCE(tc.lng, cc.lng),
  COALESCE(tc.kind, CASE WHEN u.name ILIKE '%hogeschool%' OR u.name ILIKE '%UAS%' OR u.name ILIKE '%Academy%' THEN 'hbo' ELSE 'wo' END),
  u.slug,
  u.id,
  true
FROM public.universities u
LEFT JOIN tmp_uni_coords tc ON tc.slug = u.slug
LEFT JOIN LATERAL (
  SELECT c.lat, c.lng
  FROM public.geo_reference_points c
  WHERE c.category = 'city_centre'
    AND c.is_active = true
    AND lower(c.city) = lower(u.city)
  LIMIT 1
) cc ON true
WHERE COALESCE(u.is_active, true) = true
  AND COALESCE(tc.lat, cc.lat) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.geo_reference_points g
    WHERE g.category = 'university'
      AND g.university_slug = u.slug
  );

DROP TABLE tmp_uni_coords;
