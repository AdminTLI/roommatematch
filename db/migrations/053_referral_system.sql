-- Referral System
-- This migration adds tables for referral tracking and rewards

-- Table for referral codes
CREATE TABLE referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referral code
    code VARCHAR(50) UNIQUE NOT NULL, -- Unique referral code
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Referral settings
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER, -- Maximum number of uses (NULL for unlimited)
    uses_count INTEGER DEFAULT 0, -- Current number of uses
    
    -- Rewards
    reward_type VARCHAR(50) DEFAULT 'credit' CHECK (reward_type IN ('credit', 'discount', 'feature', 'none')),
    reward_amount DECIMAL(10,2), -- Reward amount (if applicable)
    reward_description TEXT,
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB, -- Additional metadata
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for referrals
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referral relationship
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who referred
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who was referred
    referral_code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
    
    -- Referral status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'expired', 'cancelled')),
    
    -- Completion criteria
    completion_criteria VARCHAR(50) DEFAULT 'signup' CHECK (completion_criteria IN ('signup', 'verification', 'onboarding', 'first_match', 'first_agreement')),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Rewards
    referrer_reward_amount DECIMAL(10,2),
    referred_reward_amount DECIMAL(10,2),
    referrer_rewarded_at TIMESTAMP WITH TIME ZONE,
    referred_rewarded_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB, -- Additional metadata (source, campaign, etc.)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for campus ambassadors
CREATE TABLE campus_ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ambassador information
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id),
    
    -- Ambassador status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
    tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    
    -- Ambassador metrics
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    completed_referrals INTEGER DEFAULT 0,
    total_rewards DECIMAL(10,2) DEFAULT 0,
    
    -- Ambassador settings
    custom_referral_code VARCHAR(50) UNIQUE, -- Custom referral code (if provided)
    marketing_materials JSONB, -- Marketing materials and resources
    
    -- Metadata
    metadata JSONB, -- Additional metadata
    
    -- Timestamps
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_active ON referral_codes(is_active);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code_id);
CREATE INDEX idx_referrals_status ON referrals(status);

CREATE INDEX idx_campus_ambassadors_user ON campus_ambassadors(user_id);
CREATE INDEX idx_campus_ambassadors_university ON campus_ambassadors(university_id);
CREATE INDEX idx_campus_ambassadors_status ON campus_ambassadors(status);

-- RLS Policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_ambassadors ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral codes
CREATE POLICY "Users can view their own referral codes" ON referral_codes
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own referral codes
CREATE POLICY "Users can create their own referral codes" ON referral_codes
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can view their own referrals
CREATE POLICY "Users can view their own referrals" ON referrals
    FOR SELECT
    USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Users can create referrals
CREATE POLICY "Users can create referrals" ON referrals
    FOR INSERT
    WITH CHECK (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Users can view their own ambassador status
CREATE POLICY "Users can view their own ambassador status" ON campus_ambassadors
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can access all referral data
CREATE POLICY "Admins can access all referral codes" ON referral_codes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can access all referrals" ON referrals
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can access all ambassadors" ON campus_ambassadors
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    user_code TEXT;
BEGIN
    -- Generate code: USER-XXXX-YYYY
    user_code := UPPER(SUBSTRING(user_id::TEXT, 1, 8));
    code := 'REF-' || user_code || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE referral_codes IS 'Referral codes for user referrals';
COMMENT ON TABLE referrals IS 'Referral tracking and rewards';
COMMENT ON TABLE campus_ambassadors IS 'Campus ambassador program tracking';

