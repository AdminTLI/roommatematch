-- Roommate Reputation & References System
-- This migration adds tables for endorsements, references, and trust badges

-- Table for endorsements (short positive feedback)
CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endorsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endorsement_type VARCHAR(50) NOT NULL CHECK (endorsement_type IN ('roommate', 'tenant', 'student', 'peer')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('cleanliness', 'communication', 'responsibility', 'respect', 'reliability', 'friendliness', 'study_habits', 'financial_trust', 'general')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    context VARCHAR(100), -- e.g., "Spring 2024", "Apartment A", "Study Group"
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- Verified by university staff
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-endorsement and duplicate endorsements
    CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsee_id),
    UNIQUE(endorser_id, endorsee_id, endorsement_type, category)
);

-- Table for detailed references (longer testimonials)
CREATE TABLE references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('roommate', 'landlord', 'university_staff', 'peer', 'employer')),
    relationship_duration VARCHAR(50), -- e.g., "6 months", "1 year", "2 semesters"
    relationship_context TEXT, -- e.g., "We lived together in a shared apartment near campus"
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    
    -- Detailed ratings
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    responsibility_rating INTEGER CHECK (responsibility_rating >= 1 AND responsibility_rating <= 5),
    respect_rating INTEGER CHECK (respect_rating >= 1 AND respect_rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    financial_trust_rating INTEGER CHECK (financial_trust_rating >= 1 AND financial_trust_rating <= 5),
    
    -- Written testimonial
    testimonial TEXT NOT NULL,
    strengths TEXT[], -- Array of positive qualities
    areas_for_improvement TEXT[], -- Constructive feedback
    
    -- Contact verification
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_verified BOOLEAN DEFAULT FALSE,
    contact_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-reference
    CONSTRAINT no_self_reference CHECK (referrer_id != referee_id),
    
    -- Prevent duplicate references from same person
    UNIQUE(referrer_id, referee_id)
);

-- Table for trust badges (earned through endorsements and references)
CREATE TABLE trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('verified_roommate', 'reliable_tenant', 'excellent_communicator', 'clean_living', 'financial_trust', 'study_buddy', 'social_connector', 'university_endorsed', 'landlord_recommended')),
    badge_level VARCHAR(20) DEFAULT 'bronze' CHECK (badge_level IN ('bronze', 'silver', 'gold', 'platinum')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Some badges may expire
    awarded_by_system BOOLEAN DEFAULT TRUE,
    awarded_by UUID REFERENCES auth.users(id), -- If manually awarded
    criteria_met JSONB, -- Store the criteria that earned this badge
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, badge_type) -- One badge per type per user
);

-- Table for reputation scores (aggregated metrics)
CREATE TABLE reputation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Overall reputation score (0-100)
    overall_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Category-specific scores
    cleanliness_score DECIMAL(5,2) DEFAULT 0 CHECK (cleanliness_score >= 0 AND cleanliness_score <= 100),
    communication_score DECIMAL(5,2) DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 100),
    responsibility_score DECIMAL(5,2) DEFAULT 0 CHECK (responsibility_score >= 0 AND responsibility_score <= 100),
    respect_score DECIMAL(5,2) DEFAULT 0 CHECK (respect_score >= 0 AND respect_score <= 100),
    reliability_score DECIMAL(5,2) DEFAULT 0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    financial_trust_score DECIMAL(5,2) DEFAULT 0 CHECK (financial_trust_score >= 0 AND financial_trust_score <= 100),
    
    -- Metrics
    total_endorsements INTEGER DEFAULT 0,
    total_references INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of endorsement requests responded to
    
    -- Timestamps
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Table for endorsement requests (when users request feedback)
CREATE TABLE endorsement_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_from_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endorsement_type VARCHAR(50) NOT NULL CHECK (endorsement_type IN ('roommate', 'tenant', 'student', 'peer')),
    context VARCHAR(100), -- e.g., "Spring 2024 semester"
    message TEXT, -- Personal message from requester
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-requests and duplicate requests
    CONSTRAINT no_self_request CHECK (requester_id != requested_from_id),
    UNIQUE(requester_id, requested_from_id, endorsement_type, context)
);

-- Indexes for performance
CREATE INDEX idx_endorsements_endorsee ON endorsements(endorsee_id);
CREATE INDEX idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX idx_endorsements_type ON endorsements(endorsement_type);
CREATE INDEX idx_endorsements_category ON endorsements(category);
CREATE INDEX idx_endorsements_rating ON endorsements(rating);
CREATE INDEX idx_endorsements_created_at ON endorsements(created_at);

CREATE INDEX idx_references_referee ON references(referee_id);
CREATE INDEX idx_references_referrer ON references(referrer_id);
CREATE INDEX idx_references_type ON references(reference_type);
CREATE INDEX idx_references_status ON references(status);
CREATE INDEX idx_references_rating ON references(overall_rating);

CREATE INDEX idx_trust_badges_user ON trust_badges(user_id);
CREATE INDEX idx_trust_badges_type ON trust_badges(badge_type);
CREATE INDEX idx_trust_badges_level ON trust_badges(badge_level);
CREATE INDEX idx_trust_badges_active ON trust_badges(is_active) WHERE is_active = true;

CREATE INDEX idx_reputation_scores_user ON reputation_scores(user_id);
CREATE INDEX idx_reputation_scores_overall ON reputation_scores(overall_score);

CREATE INDEX idx_endorsement_requests_requester ON endorsement_requests(requester_id);
CREATE INDEX idx_endorsement_requests_requested_from ON endorsement_requests(requested_from_id);
CREATE INDEX idx_endorsement_requests_status ON endorsement_requests(status);

-- RLS Policies
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE references ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsement_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own endorsements and those given to them
CREATE POLICY "Users can view their own endorsements" ON endorsements
    FOR SELECT USING (
        auth.uid() = endorser_id OR 
        auth.uid() = endorsee_id OR
        NOT is_anonymous
    );

-- Users can create endorsements for others
CREATE POLICY "Users can create endorsements" ON endorsements
    FOR INSERT WITH CHECK (auth.uid() = endorser_id);

-- Users can update their own endorsements (within time limit)
CREATE POLICY "Users can update their own endorsements" ON endorsements
    FOR UPDATE USING (
        auth.uid() = endorser_id AND 
        created_at > NOW() - INTERVAL '24 hours'
    );

-- Users can view their own references and public references
CREATE POLICY "Users can view references" ON references
    FOR SELECT USING (
        auth.uid() = referrer_id OR 
        auth.uid() = referee_id OR
        (is_public = true AND status = 'approved')
    );

-- Users can create references for others
CREATE POLICY "Users can create references" ON references
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Users can view their own trust badges
CREATE POLICY "Users can view their own trust badges" ON trust_badges
    FOR SELECT USING (auth.uid() = user_id OR is_active = true);

-- Users can view their own reputation scores
CREATE POLICY "Users can view their own reputation scores" ON reputation_scores
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view and manage their own endorsement requests
CREATE POLICY "Users can manage their own endorsement requests" ON endorsement_requests
    FOR ALL USING (
        auth.uid() = requester_id OR 
        auth.uid() = requested_from_id
    );

-- Admin access for moderation
CREATE POLICY "Admins can moderate all content" ON endorsements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

CREATE POLICY "Admins can moderate references" ON references
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

-- Functions for reputation calculation
CREATE OR REPLACE FUNCTION calculate_reputation_score(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    endorsement_count INTEGER;
    reference_count INTEGER;
    avg_endorsement_rating DECIMAL(3,2);
    avg_reference_rating DECIMAL(3,2);
    category_scores JSONB;
    overall_score DECIMAL(5,2);
BEGIN
    -- Count endorsements and references
    SELECT COUNT(*) INTO endorsement_count
    FROM endorsements 
    WHERE endorsee_id = p_user_id;
    
    SELECT COUNT(*) INTO reference_count
    FROM references 
    WHERE referee_id = p_user_id AND status = 'approved';
    
    -- Calculate average endorsement rating
    SELECT COALESCE(AVG(rating), 0) INTO avg_endorsement_rating
    FROM endorsements 
    WHERE endorsee_id = p_user_id;
    
    -- Calculate average reference rating
    SELECT COALESCE(AVG(overall_rating), 0) INTO avg_reference_rating
    FROM references 
    WHERE referee_id = p_user_id AND status = 'approved';
    
    -- Calculate category-specific scores
    SELECT jsonb_build_object(
        'cleanliness', COALESCE(AVG(CASE WHEN category = 'cleanliness' THEN rating END), 0),
        'communication', COALESCE(AVG(CASE WHEN category = 'communication' THEN rating END), 0),
        'responsibility', COALESCE(AVG(CASE WHEN category = 'responsibility' THEN rating END), 0),
        'respect', COALESCE(AVG(CASE WHEN category = 'respect' THEN rating END), 0),
        'reliability', COALESCE(AVG(CASE WHEN category = 'reliability' THEN rating END), 0),
        'financial_trust', COALESCE(AVG(CASE WHEN category = 'financial_trust' THEN rating END), 0)
    ) INTO category_scores
    FROM endorsements 
    WHERE endorsee_id = p_user_id;
    
    -- Calculate overall score (weighted average)
    overall_score := (
        (avg_endorsement_rating * 0.4 + avg_reference_rating * 0.6) * 20 + -- Convert to 0-100 scale
        LEAST(endorsement_count + reference_count, 20) -- Bonus for having more feedback
    );
    
    -- Update or insert reputation score
    INSERT INTO reputation_scores (
        user_id, overall_score, cleanliness_score, communication_score,
        responsibility_score, respect_score, reliability_score, financial_trust_score,
        total_endorsements, total_references, average_rating, last_calculated_at
    ) VALUES (
        p_user_id, overall_score,
        (category_scores->>'cleanliness')::DECIMAL * 20,
        (category_scores->>'communication')::DECIMAL * 20,
        (category_scores->>'responsibility')::DECIMAL * 20,
        (category_scores->>'respect')::DECIMAL * 20,
        (category_scores->>'reliability')::DECIMAL * 20,
        (category_scores->>'financial_trust')::DECIMAL * 20,
        endorsement_count, reference_count,
        (avg_endorsement_rating + avg_reference_rating) / 2,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        cleanliness_score = EXCLUDED.cleanliness_score,
        communication_score = EXCLUDED.communication_score,
        responsibility_score = EXCLUDED.responsibility_score,
        respect_score = EXCLUDED.respect_score,
        reliability_score = EXCLUDED.reliability_score,
        financial_trust_score = EXCLUDED.financial_trust_score,
        total_endorsements = EXCLUDED.total_endorsements,
        total_references = EXCLUDED.total_references,
        average_rating = EXCLUDED.average_rating,
        last_calculated_at = EXCLUDED.last_calculated_at,
        updated_at = NOW();
        
    -- Award trust badges based on scores
    PERFORM award_trust_badges(p_user_id, overall_score, category_scores);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award trust badges
CREATE OR REPLACE FUNCTION award_trust_badges(
    p_user_id UUID,
    p_overall_score DECIMAL(5,2),
    p_category_scores JSONB
)
RETURNS VOID AS $$
DECLARE
    category_score DECIMAL(5,2);
    badge_level VARCHAR(20);
BEGIN
    -- Award badges based on overall score
    IF p_overall_score >= 90 THEN
        badge_level := 'platinum';
    ELSIF p_overall_score >= 80 THEN
        badge_level := 'gold';
    ELSIF p_overall_score >= 70 THEN
        badge_level := 'silver';
    ELSIF p_overall_score >= 60 THEN
        badge_level := 'bronze';
    ELSE
        RETURN; -- No badge if score is too low
    END IF;
    
    -- Award overall reputation badge
    INSERT INTO trust_badges (user_id, badge_type, badge_level, criteria_met)
    VALUES (p_user_id, 'verified_roommate', badge_level, jsonb_build_object('overall_score', p_overall_score))
    ON CONFLICT (user_id, badge_type) DO UPDATE SET
        badge_level = EXCLUDED.badge_level,
        criteria_met = EXCLUDED.criteria_met,
        earned_at = NOW();
    
    -- Award category-specific badges
    FOR category_score IN SELECT (p_category_scores->>key)::DECIMAL * 20 FROM jsonb_object_keys(p_category_scores) AS key LOOP
        IF category_score >= 90 THEN
            badge_level := 'platinum';
        ELSIF category_score >= 80 THEN
            badge_level := 'gold';
        ELSIF category_score >= 70 THEN
            badge_level := 'silver';
        ELSIF category_score >= 60 THEN
            badge_level := 'bronze';
        ELSE
            CONTINUE; -- Skip if score is too low
        END IF;
        
        -- Award specific category badge (simplified - would need more logic for each category)
        INSERT INTO trust_badges (user_id, badge_type, badge_level, criteria_met)
        VALUES (p_user_id, 'excellent_communicator', badge_level, jsonb_build_object('category_score', category_score))
        ON CONFLICT (user_id, badge_type) DO UPDATE SET
            badge_level = EXCLUDED.badge_level,
            criteria_met = EXCLUDED.criteria_met,
            earned_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user reputation summary
CREATE OR REPLACE FUNCTION get_user_reputation_summary(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    overall_score DECIMAL(5,2),
    total_endorsements BIGINT,
    total_references BIGINT,
    average_rating DECIMAL(3,2),
    trust_badges JSONB,
    recent_endorsements JSONB,
    top_categories JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.user_id,
        rs.overall_score,
        rs.total_endorsements::BIGINT,
        rs.total_references::BIGINT,
        rs.average_rating,
        
        -- Trust badges
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'type', tb.badge_type,
                    'level', tb.badge_level,
                    'earned_at', tb.earned_at
                )
            ) FILTER (WHERE tb.id IS NOT NULL),
            '[]'::jsonb
        ) as trust_badges,
        
        -- Recent endorsements
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'category', e.category,
                    'rating', e.rating,
                    'comment', e.comment,
                    'created_at', e.created_at
                )
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::jsonb
        ) as recent_endorsements,
        
        -- Top categories
        COALESCE(
            jsonb_build_object(
                'cleanliness', rs.cleanliness_score,
                'communication', rs.communication_score,
                'responsibility', rs.responsibility_score,
                'respect', rs.respect_score,
                'reliability', rs.reliability_score,
                'financial_trust', rs.financial_trust_score
            ),
            '{}'::jsonb
        ) as top_categories
        
    FROM reputation_scores rs
    LEFT JOIN trust_badges tb ON rs.user_id = tb.user_id AND tb.is_active = true
    LEFT JOIN endorsements e ON rs.user_id = e.endorsee_id
    WHERE rs.user_id = p_user_id
    GROUP BY rs.user_id, rs.overall_score, rs.total_endorsements, rs.total_references, 
             rs.average_rating, rs.cleanliness_score, rs.communication_score,
             rs.responsibility_score, rs.respect_score, rs.reliability_score, rs.financial_trust_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate reputation when endorsements change
CREATE OR REPLACE FUNCTION trigger_recalculate_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate reputation for the endorsee
    PERFORM calculate_reputation_score(NEW.endorsee_id);
    
    -- If this is an update, also recalculate for the old endorsee
    IF TG_OP = 'UPDATE' AND OLD.endorsee_id != NEW.endorsee_id THEN
        PERFORM calculate_reputation_score(OLD.endorsee_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_reputation_on_endorsement_change
    AFTER INSERT OR UPDATE OR DELETE ON endorsements
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_reputation();

-- Trigger to recalculate reputation when references change
CREATE TRIGGER recalculate_reputation_on_reference_change
    AFTER INSERT OR UPDATE OR DELETE ON references
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_reputation();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_endorsements_updated_at
    BEFORE UPDATE ON endorsements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_references_updated_at
    BEFORE UPDATE ON references
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reputation_scores_updated_at
    BEFORE UPDATE ON reputation_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
