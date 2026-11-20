-- Landlord + Agency Housing Marketplace MVP
-- Host profiles, listing ownership, applications state machine, POIs, group pin/vote, consent RLS

-- ---------------------------------------------------------------------------
-- Host profiles
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.host_type AS ENUM ('private_landlord', 'agency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.host_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  host_type public.host_type NOT NULL DEFAULT 'private_landlord',
  display_name TEXT NOT NULL,
  company_name TEXT,
  kvk_number TEXT,
  agency_license TEXT,
  phone TEXT,
  bio TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_host_profiles_user ON public.host_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_host_profiles_type ON public.host_profiles(host_type);

ALTER TABLE public.host_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hosts can read own profile" ON public.host_profiles;
CREATE POLICY "Hosts can read own profile" ON public.host_profiles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Hosts can insert own profile" ON public.host_profiles;
CREATE POLICY "Hosts can insert own profile" ON public.host_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Hosts can update own profile" ON public.host_profiles;
CREATE POLICY "Hosts can update own profile" ON public.host_profiles
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Public can read host display fields" ON public.host_profiles;
CREATE POLICY "Public can read host display fields" ON public.host_profiles
  FOR SELECT TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Extend housing_listings
-- ---------------------------------------------------------------------------
ALTER TABLE public.housing_listings
  ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES public.host_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS host_type public.host_type,
  ADD COLUMN IF NOT EXISTS seeking_people INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS selection_style TEXT DEFAULT 'standard'
    CHECK (selection_style IN ('standard', 'hospiteer_lite')),
  ADD COLUMN IF NOT EXISTS lifestyle_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dealbreakers JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS neighborhood_lat DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS neighborhood_lng DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_housing_listings_host ON public.housing_listings(host_id);

-- ---------------------------------------------------------------------------
-- Extend housing_applications for blind pipeline
-- ---------------------------------------------------------------------------
ALTER TABLE public.housing_applications
  ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS anonymous_label TEXT,
  ADD COLUMN IF NOT EXISTS fit_score DECIMAL(4, 3),
  ADD COLUMN IF NOT EXISTS cohesion_score DECIMAL(4, 3),
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS watch_outs TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hard_gates_passed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS verification_badges TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS group_size INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rejection_reason_code TEXT,
  ADD COLUMN IF NOT EXISTS rejection_note TEXT,
  ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offer_made_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offer_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offer_declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS identity_revealed BOOLEAN NOT NULL DEFAULT false;

-- Expand status check to include shortlisted / offer states
ALTER TABLE public.housing_applications DROP CONSTRAINT IF EXISTS housing_applications_status_check;
ALTER TABLE public.housing_applications
  ADD CONSTRAINT housing_applications_status_check
  CHECK (status IN (
    'submitted', 'under_review', 'shortlisted', 'offer_pending',
    'offer_accepted', 'offer_declined', 'approved', 'rejected', 'withdrawn'
  ));

CREATE INDEX IF NOT EXISTS idx_housing_applications_fit ON public.housing_applications(listing_id, fit_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_housing_applications_chat ON public.housing_applications(chat_id);

-- ---------------------------------------------------------------------------
-- Tour bookings: anonymous handle + host confirm
-- ---------------------------------------------------------------------------
ALTER TABLE public.tour_bookings
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.housing_applications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS anonymous_label TEXT,
  ADD COLUMN IF NOT EXISTS proposed_by TEXT DEFAULT 'student'
    CHECK (proposed_by IN ('student', 'host')),
  ADD COLUMN IF NOT EXISTS host_notes TEXT;

-- ---------------------------------------------------------------------------
-- Nearby POIs + cached routes (HeiGIT/Overpass)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listing_nearby_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  walk_s INTEGER,
  cycle_s INTEGER,
  distance_m INTEGER,
  is_approx BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'overpass',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, category)
);

CREATE INDEX IF NOT EXISTS idx_listing_nearby_pois_listing ON public.listing_nearby_pois(listing_id);

CREATE TABLE IF NOT EXISTS public.listing_poi_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  poi_id UUID NOT NULL REFERENCES public.listing_nearby_pois(id) ON DELETE CASCADE,
  profile TEXT NOT NULL CHECK (profile IN ('foot-walking', 'cycling-regular')),
  geometry JSONB NOT NULL,
  duration_s INTEGER,
  distance_m INTEGER,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, poi_id, profile)
);

CREATE TABLE IF NOT EXISTS public.heigit_usage_counters (
  day DATE NOT NULL,
  endpoint TEXT NOT NULL,
  call_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, endpoint)
);

ALTER TABLE public.listing_nearby_pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_poi_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read listing pois" ON public.listing_nearby_pois;
CREATE POLICY "Authenticated can read listing pois" ON public.listing_nearby_pois
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read listing poi routes" ON public.listing_poi_routes;
CREATE POLICY "Authenticated can read listing poi routes" ON public.listing_poi_routes
  FOR SELECT TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- Group listing pins + votes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_listing_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chat_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.group_listing_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chat_id, listing_id, user_id)
);

ALTER TABLE public.group_listing_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_listing_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active members manage pins" ON public.group_listing_pins;
CREATE POLICY "Active members manage pins" ON public.group_listing_pins
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = group_listing_pins.chat_id
        AND cm.user_id = (SELECT auth.uid())
        AND COALESCE(cm.status, 'active') = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = group_listing_pins.chat_id
        AND cm.user_id = (SELECT auth.uid())
        AND COALESCE(cm.status, 'active') = 'active'
    )
  );

DROP POLICY IF EXISTS "Active members manage votes" ON public.group_listing_votes;
CREATE POLICY "Active members manage votes" ON public.group_listing_votes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = group_listing_votes.chat_id
        AND cm.user_id = (SELECT auth.uid())
        AND COALESCE(cm.status, 'active') = 'active'
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = group_listing_votes.chat_id
        AND cm.user_id = (SELECT auth.uid())
        AND COALESCE(cm.status, 'active') = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- Host listing RLS (owner by host_id)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Hosts manage own listings" ON public.housing_listings;
CREATE POLICY "Hosts manage own listings" ON public.housing_listings
  FOR ALL TO authenticated
  USING (
    host_id IN (
      SELECT hp.id FROM public.host_profiles hp WHERE hp.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    host_id IN (
      SELECT hp.id FROM public.host_profiles hp WHERE hp.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Hosts read applications for own listings" ON public.housing_applications;
CREATE POLICY "Hosts read applications for own listings" ON public.housing_applications
  FOR SELECT TO authenticated
  USING (
    listing_id IN (
      SELECT hl.id FROM public.housing_listings hl
      JOIN public.host_profiles hp ON hp.id = hl.host_id
      WHERE hp.user_id = (SELECT auth.uid())
    )
    OR user_id = (SELECT auth.uid())
    OR (SELECT auth.uid()) = ANY (group_members)
  );

DROP POLICY IF EXISTS "Hosts update applications for own listings" ON public.housing_applications;
CREATE POLICY "Hosts update applications for own listings" ON public.housing_applications
  FOR UPDATE TO authenticated
  USING (
    listing_id IN (
      SELECT hl.id FROM public.housing_listings hl
      JOIN public.host_profiles hp ON hp.id = hl.host_id
      WHERE hp.user_id = (SELECT auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Listing photos storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-photos',
  'listing-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Hosts upload listing photos" ON storage.objects;
CREATE POLICY "Hosts upload listing photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Hosts update listing photos" ON storage.objects;
CREATE POLICY "Hosts update listing photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Hosts delete listing photos" ON storage.objects;
CREATE POLICY "Hosts delete listing photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Authenticated read listing photos" ON storage.objects;
CREATE POLICY "Authenticated read listing photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'listing-photos');

-- ---------------------------------------------------------------------------
-- Consent: only ACTIVE chat members can read/send messages
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Chat members can read messages" ON public.messages;
CREATE POLICY "Chat members can read messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = messages.chat_id
        AND cm.user_id = (SELECT auth.uid())
        AND COALESCE(cm.status, 'active') = 'active'
    )
  );

DROP POLICY IF EXISTS "Chat members can send messages" ON public.messages;
CREATE POLICY "Chat members can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.chat_id = messages.chat_id
        AND cm.user_id = (SELECT auth.uid())
        AND COALESCE(cm.status, 'active') = 'active'
    )
  );

-- Fix listing report support on reports table if missing
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS target_listing_id UUID REFERENCES public.housing_listings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reports_target_listing ON public.reports(target_listing_id)
  WHERE target_listing_id IS NOT NULL;

-- Group compatibility: store pair matrix extras
ALTER TABLE public.group_compatibility_scores
  ADD COLUMN IF NOT EXISTS pair_scores JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS module_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS hard_gate_conflicts TEXT[] DEFAULT '{}';
