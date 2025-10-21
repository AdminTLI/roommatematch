-- Verified Housing Feed & Instant Tours System
-- This migration adds tables for university-vetted housing listings with tour booking and compatibility gating

-- Table for housing listings (university-vetted)
CREATE TABLE housing_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property details
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('apartment', 'house', 'studio', 'shared_room', 'private_room')),
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('private', 'shared', 'studio', 'entire_place')),
    total_rooms INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL,
    total_bathrooms DECIMAL(3, 1) NOT NULL,
    square_meters INTEGER,
    
    -- Pricing
    rent_monthly DECIMAL(10, 2) NOT NULL,
    utilities_included BOOLEAN DEFAULT FALSE,
    utilities_cost DECIMAL(10, 2) DEFAULT 0,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    agency_fee DECIMAL(10, 2) DEFAULT 0,
    
    -- Availability
    available_from DATE NOT NULL,
    available_until DATE,
    min_stay_months INTEGER DEFAULT 1,
    max_stay_months INTEGER,
    
    -- Amenities and features
    amenities TEXT[] DEFAULT '{}',
    pet_friendly BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    furnished BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    parking_cost DECIMAL(10, 2) DEFAULT 0,
    
    -- University integration
    university_id UUID REFERENCES universities(id),
    verified_by_university BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    -- Landlord/agency info
    landlord_name VARCHAR(255) NOT NULL,
    landlord_email VARCHAR(255) NOT NULL,
    landlord_phone VARCHAR(20),
    agency_name VARCHAR(255),
    agency_license VARCHAR(100),
    
    -- Media
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    virtual_tour_url TEXT,
    floor_plan_url TEXT,
    
    -- Status and moderation
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'rented', 'expired')),
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'needs_review')),
    moderation_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Table for tour bookings
CREATE TABLE tour_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES housing_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tour_type VARCHAR(20) NOT NULL CHECK (tour_type IN ('in_person', 'virtual', 'video_call')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    
    -- Contact info for tour
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Tour details
    notes TEXT,
    special_requests TEXT,
    attendees_count INTEGER DEFAULT 1,
    
    -- Confirmation and follow-up
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    feedback_requested_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for housing preferences (linked to user profiles)
CREATE TABLE user_housing_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Location preferences
    preferred_cities TEXT[] DEFAULT '{}',
    max_commute_minutes INTEGER,
    near_university BOOLEAN DEFAULT TRUE,
    
    -- Property preferences
    preferred_property_types TEXT[] DEFAULT '{}',
    preferred_room_type VARCHAR(50),
    min_square_meters INTEGER,
    max_square_meters INTEGER,
    
    -- Budget preferences
    max_rent_monthly DECIMAL(10, 2) NOT NULL,
    utilities_preference VARCHAR(20) DEFAULT 'included' CHECK (utilities_preference IN ('included', 'separate', 'either')),
    
    -- Amenity preferences
    required_amenities TEXT[] DEFAULT '{}',
    preferred_amenities TEXT[] DEFAULT '{}',
    pet_friendly_required BOOLEAN DEFAULT FALSE,
    smoking_preference VARCHAR(20) DEFAULT 'no_smoking' CHECK (smoking_preference IN ('no_smoking', 'smoking_ok', 'either')),
    
    -- Stay preferences
    min_stay_months INTEGER DEFAULT 1,
    max_stay_months INTEGER,
    move_in_flexibility_days INTEGER DEFAULT 30,
    
    -- Roommate preferences (linked to matching system)
    prefer_matched_roommates BOOLEAN DEFAULT TRUE,
    max_roommates INTEGER DEFAULT 3,
    gender_preference VARCHAR(20) CHECK (gender_preference IN ('same', 'opposite', 'any')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Table for housing applications
CREATE TABLE housing_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES housing_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Application details
    application_type VARCHAR(20) DEFAULT 'individual' CHECK (application_type IN ('individual', 'group')),
    group_members UUID[] DEFAULT '{}', -- Array of user IDs for group applications
    
    -- Application status
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
    
    -- Application content
    motivation_letter TEXT,
    reference_documents TEXT[] DEFAULT '{}',
    employment_status VARCHAR(50),
    income_proof_url TEXT,
    
    -- Decision tracking
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(listing_id, user_id)
);

-- Table for housing compatibility scores (linking listings to user matches)
CREATE TABLE housing_compatibility_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES housing_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Compatibility factors
    budget_compatibility DECIMAL(3, 2) NOT NULL CHECK (budget_compatibility >= 0 AND budget_compatibility <= 1),
    location_compatibility DECIMAL(3, 2) NOT NULL CHECK (location_compatibility >= 0 AND location_compatibility <= 1),
    amenity_compatibility DECIMAL(3, 2) NOT NULL CHECK (amenity_compatibility >= 0 AND amenity_compatibility <= 1),
    timeline_compatibility DECIMAL(3, 2) NOT NULL CHECK (timeline_compatibility >= 0 AND timeline_compatibility <= 1),
    
    -- Overall score
    overall_compatibility DECIMAL(3, 2) NOT NULL CHECK (overall_compatibility >= 0 AND overall_compatibility <= 1),
    
    -- Recommendation reasons
    positive_factors TEXT[] DEFAULT '{}',
    negative_factors TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(listing_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_housing_listings_city ON housing_listings(city);
CREATE INDEX idx_housing_listings_university ON housing_listings(university_id);
CREATE INDEX idx_housing_listings_rent ON housing_listings(rent_monthly);
CREATE INDEX idx_housing_listings_available_from ON housing_listings(available_from);
CREATE INDEX idx_housing_listings_status ON housing_listings(status);
CREATE INDEX idx_housing_listings_verified ON housing_listings(verified_by_university);

CREATE INDEX idx_tour_bookings_listing ON tour_bookings(listing_id);
CREATE INDEX idx_tour_bookings_user ON tour_bookings(user_id);
CREATE INDEX idx_tour_bookings_scheduled ON tour_bookings(scheduled_for);
CREATE INDEX idx_tour_bookings_status ON tour_bookings(status);

CREATE INDEX idx_housing_applications_listing ON housing_applications(listing_id);
CREATE INDEX idx_housing_applications_user ON housing_applications(user_id);
CREATE INDEX idx_housing_applications_status ON housing_applications(status);

CREATE INDEX idx_housing_compatibility_listing ON housing_compatibility_scores(listing_id);
CREATE INDEX idx_housing_compatibility_user ON housing_compatibility_scores(user_id);
CREATE INDEX idx_housing_compatibility_score ON housing_compatibility_scores(overall_compatibility);

-- RLS Policies
ALTER TABLE housing_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_housing_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_compatibility_scores ENABLE ROW LEVEL SECURITY;

-- Users can view active housing listings
CREATE POLICY "Users can view active housing listings" ON housing_listings
    FOR SELECT USING (status = 'active' AND moderation_status = 'approved');

-- Users can manage their own tour bookings
CREATE POLICY "Users can manage their own tour bookings" ON tour_bookings
    FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own housing preferences
CREATE POLICY "Users can manage their own housing preferences" ON user_housing_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own housing applications
CREATE POLICY "Users can manage their own housing applications" ON housing_applications
    FOR ALL USING (auth.uid() = user_id);

-- Users can view their own compatibility scores
CREATE POLICY "Users can view their own compatibility scores" ON housing_compatibility_scores
    FOR SELECT USING (auth.uid() = user_id);

-- Landlords can manage their own listings
CREATE POLICY "Landlords can manage their own listings" ON housing_listings
    FOR ALL USING (landlord_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin access for moderation
CREATE POLICY "Admins can manage all housing listings" ON housing_listings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

CREATE POLICY "Admins can view all applications" ON housing_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

-- Functions for housing compatibility calculation
CREATE OR REPLACE FUNCTION calculate_housing_compatibility(
    p_listing_id UUID,
    p_user_id UUID
) RETURNS DECIMAL(3,2) AS $$
DECLARE
    listing_record RECORD;
    user_prefs RECORD;
    budget_score DECIMAL(3,2);
    location_score DECIMAL(3,2);
    amenity_score DECIMAL(3,2);
    timeline_score DECIMAL(3,2);
    overall_score DECIMAL(3,2);
BEGIN
    -- Get listing details
    SELECT * INTO listing_record FROM housing_listings WHERE id = p_listing_id;
    
    -- Get user preferences
    SELECT * INTO user_prefs FROM user_housing_preferences WHERE user_id = p_user_id;
    
    -- Calculate budget compatibility (0-1)
    IF listing_record.rent_monthly <= user_prefs.max_rent_monthly THEN
        budget_score := 1.0 - ((user_prefs.max_rent_monthly - listing_record.rent_monthly) / user_prefs.max_rent_monthly * 0.3);
    ELSE
        budget_score := GREATEST(0.0, 1.0 - ((listing_record.rent_monthly - user_prefs.max_rent_monthly) / user_prefs.max_rent_monthly));
    END IF;
    
    -- Calculate location compatibility (0-1)
    location_score := 0.5; -- Base score
    IF user_prefs.near_university AND listing_record.university_id IS NOT NULL THEN
        location_score := location_score + 0.3;
    END IF;
    IF listing_record.city = ANY(user_prefs.preferred_cities) THEN
        location_score := location_score + 0.2;
    END IF;
    
    -- Calculate amenity compatibility (0-1)
    amenity_score := 0.0;
    IF array_length(user_prefs.required_amenities, 1) IS NULL THEN
        amenity_score := 0.5; -- No requirements
    ELSE
        -- Check required amenities
        DECLARE
            required_count INTEGER;
            matched_count INTEGER := 0;
        BEGIN
            required_count := array_length(user_prefs.required_amenities, 1);
            FOR i IN 1..required_count LOOP
                IF user_prefs.required_amenities[i] = ANY(listing_record.amenities) THEN
                    matched_count := matched_count + 1;
                END IF;
            END LOOP;
            amenity_score := matched_count::DECIMAL / required_count;
        END;
    END IF;
    
    -- Calculate timeline compatibility (0-1)
    timeline_score := 0.5; -- Base score
    -- This would need more complex logic based on user's move-in date preferences
    
    -- Calculate overall score (weighted average)
    overall_score := (
        budget_score * 0.4 +
        location_score * 0.3 +
        amenity_score * 0.2 +
        timeline_score * 0.1
    );
    
    -- Insert or update compatibility score
    INSERT INTO housing_compatibility_scores (
        listing_id, user_id, budget_compatibility, location_compatibility,
        amenity_compatibility, timeline_compatibility, overall_compatibility
    ) VALUES (
        p_listing_id, p_user_id, budget_score, location_score,
        amenity_score, timeline_score, overall_score
    )
    ON CONFLICT (listing_id, user_id) DO UPDATE SET
        budget_compatibility = EXCLUDED.budget_compatibility,
        location_compatibility = EXCLUDED.location_compatibility,
        amenity_compatibility = EXCLUDED.amenity_compatibility,
        timeline_compatibility = EXCLUDED.timeline_compatibility,
        overall_compatibility = EXCLUDED.overall_compatibility;
    
    RETURN overall_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get compatible housing listings for a user
CREATE OR REPLACE FUNCTION get_compatible_housing_listings(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_min_compatibility DECIMAL(3,2) DEFAULT 0.5
) RETURNS TABLE (
    listing_id UUID,
    title VARCHAR,
    address TEXT,
    city VARCHAR,
    rent_monthly DECIMAL,
    compatibility_score DECIMAL,
    available_from DATE,
    photos TEXT[],
    amenities TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hl.id as listing_id,
        hl.title,
        hl.address,
        hl.city,
        hl.rent_monthly,
        hcs.overall_compatibility as compatibility_score,
        hl.available_from,
        hl.photos,
        hl.amenities
    FROM housing_listings hl
    LEFT JOIN housing_compatibility_scores hcs ON hl.id = hcs.listing_id AND hcs.user_id = p_user_id
    WHERE hl.status = 'active' 
    AND hl.moderation_status = 'approved'
    AND (hcs.overall_compatibility IS NULL OR hcs.overall_compatibility >= p_min_compatibility)
    ORDER BY hcs.overall_compatibility DESC NULLS LAST, hl.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_housing_listings_updated_at
    BEFORE UPDATE ON housing_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_bookings_updated_at
    BEFORE UPDATE ON tour_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_housing_preferences_updated_at
    BEFORE UPDATE ON user_housing_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_housing_applications_updated_at
    BEFORE UPDATE ON housing_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
