-- Curated NL reference points for housing "Around this place" durations.
-- Prefer these over synthetic city-centre averages / opportunistic Overpass hits.

CREATE TABLE IF NOT EXISTS public.geo_reference_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('city_centre', 'train_station')),
  name text NOT NULL,
  city text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  osm_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS geo_reference_points_category_active_idx
  ON public.geo_reference_points (category, is_active);

CREATE INDEX IF NOT EXISTS geo_reference_points_lat_lng_idx
  ON public.geo_reference_points (lat, lng);

ALTER TABLE public.geo_reference_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read geo reference points" ON public.geo_reference_points;
CREATE POLICY "Authenticated read geo reference points"
  ON public.geo_reference_points
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Seed: major city centres + main stations (expand over time / admin tooling)
INSERT INTO public.geo_reference_points (category, name, city, lat, lng) VALUES
  -- City centres
  ('city_centre', 'Amsterdam Centrum', 'Amsterdam', 52.373079, 4.892362),
  ('city_centre', 'Rotterdam Centrum', 'Rotterdam', 51.9225, 4.47917),
  ('city_centre', 'Den Haag Centrum', 'Den Haag', 52.078663, 4.288788),
  ('city_centre', 'Utrecht Centrum', 'Utrecht', 52.090737, 5.121420),
  ('city_centre', 'Eindhoven Centrum', 'Eindhoven', 51.441642, 5.469722),
  ('city_centre', 'Groningen Centrum', 'Groningen', 53.219383, 6.566502),
  ('city_centre', 'Tilburg Centrum', 'Tilburg', 51.555510, 5.090278),
  ('city_centre', 'Breda Centrum', 'Breda', 51.588611, 4.776111),
  ('city_centre', 'Nijmegen Centrum', 'Nijmegen', 51.842600, 5.859300),
  ('city_centre', 'Haarlem Centrum', 'Haarlem', 52.381300, 4.635600),
  ('city_centre', 'Arnhem Centrum', 'Arnhem', 51.985100, 5.898700),
  ('city_centre', 'Maastricht Centrum', 'Maastricht', 50.851400, 5.690900),
  ('city_centre', 'Leiden Centrum', 'Leiden', 52.160100, 4.497000),
  ('city_centre', 'Delft Centrum', 'Delft', 52.011600, 4.357100),
  ('city_centre', 'Enschede Centrum', 'Enschede', 52.221500, 6.893700),
  ('city_centre', 'Zwolle Centrum', 'Zwolle', 52.512500, 6.094400),
  -- Main train stations
  ('train_station', 'Amsterdam Centraal', 'Amsterdam', 52.379128, 4.900272),
  ('train_station', 'Amsterdam Amstel', 'Amsterdam', 52.346700, 4.917900),
  ('train_station', 'Amsterdam Zuid', 'Amsterdam', 52.338800, 4.872800),
  ('train_station', 'Rotterdam Centraal', 'Rotterdam', 51.925229, 4.469237),
  ('train_station', 'Den Haag Centraal', 'Den Haag', 52.080983, 4.323768),
  ('train_station', 'Utrecht Centraal', 'Utrecht', 52.089444, 5.109722),
  ('train_station', 'Eindhoven Centraal', 'Eindhoven', 51.442222, 5.479722),
  ('train_station', 'Groningen', 'Groningen', 53.210833, 6.564167),
  ('train_station', 'Tilburg', 'Tilburg', 51.560556, 5.083889),
  ('train_station', 'Breda', 'Breda', 51.595000, 4.780000),
  ('train_station', 'Nijmegen', 'Nijmegen', 51.843333, 5.852778),
  ('train_station', 'Haarlem', 'Haarlem', 52.387778, 4.638889),
  ('train_station', 'Arnhem Centraal', 'Arnhem', 51.984722, 5.900833),
  ('train_station', 'Maastricht', 'Maastricht', 50.849722, 5.705556),
  ('train_station', 'Leiden Centraal', 'Leiden', 52.166389, 4.482222),
  ('train_station', 'Delft', 'Delft', 52.006667, 4.356389),
  ('train_station', 'Enschede', 'Enschede', 52.222500, 6.889722),
  ('train_station', 'Zwolle', 'Zwolle', 52.505000, 6.090278);
