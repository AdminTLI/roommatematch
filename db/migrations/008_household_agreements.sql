-- Household Agreement Builder & E-sign System
-- This migration adds tables for creating and managing household agreements

-- Table for household agreement templates
CREATE TABLE agreement_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('house_rules', 'chore_rotation', 'quiet_hours', 'rent_split', 'guest_policy', 'cleaning_schedule', 'utilities', 'parking', 'general')),
    template_data JSONB NOT NULL, -- Structured template with sections, fields, and default values
    is_public BOOLEAN DEFAULT TRUE,
    is_system_template BOOLEAN DEFAULT FALSE, -- System-provided vs user-created
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique names for system templates
    UNIQUE(name) WHERE is_system_template = TRUE
);

-- Table for household agreements (instances of templates)
CREATE TABLE household_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES agreement_templates(id),
    
    -- Agreement content (filled template)
    agreement_data JSONB NOT NULL, -- The actual agreement content with filled values
    
    -- Agreement metadata
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signatures', 'active', 'expired', 'terminated')),
    effective_date DATE,
    expiration_date DATE,
    
    -- Household/group information
    household_name VARCHAR(100),
    household_address TEXT,
    
    -- Agreement settings
    requires_all_signatures BOOLEAN DEFAULT TRUE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_period_months INTEGER DEFAULT 12,
    
    -- Moderation
    needs_admin_review BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for agreement participants (roommates)
CREATE TABLE agreement_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES household_agreements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'property_manager', 'witness')),
    
    -- Participation status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
    
    -- Signature information
    signature_data JSONB, -- Digital signature data (coordinates, timestamp, etc.)
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_ip VARCHAR(45), -- IP address for audit trail
    signature_user_agent TEXT, -- Browser info for audit trail
    
    -- Communication
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(agreement_id, user_id)
);

-- Table for agreement versions (for tracking changes)
CREATE TABLE agreement_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES household_agreements(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    -- Version content
    agreement_data JSONB NOT NULL,
    change_summary TEXT,
    
    -- Version metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(agreement_id, version_number)
);

-- Table for agreement disputes
CREATE TABLE agreement_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES household_agreements(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Dispute details
    dispute_type VARCHAR(50) NOT NULL CHECK (dispute_type IN ('breach_of_agreement', 'interpretation_dispute', 'enforcement_request', 'modification_request', 'termination_request')),
    description TEXT NOT NULL,
    evidence_urls TEXT[], -- Links to evidence (photos, messages, etc.)
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed', 'escalated')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for agreement notifications
CREATE TABLE agreement_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES household_agreements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('signature_required', 'agreement_signed', 'agreement_expiring', 'dispute_reported', 'agreement_modified', 'reminder')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery
    delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'email', 'sms')),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agreement_templates_category ON agreement_templates(category);
CREATE INDEX idx_agreement_templates_public ON agreement_templates(is_public) WHERE is_public = true;

CREATE INDEX idx_household_agreements_status ON household_agreements(status);
CREATE INDEX idx_household_agreements_created_by ON household_agreements(created_by);
CREATE INDEX idx_household_agreements_effective_date ON household_agreements(effective_date);
CREATE INDEX idx_household_agreements_expiration_date ON household_agreements(expiration_date);

CREATE INDEX idx_agreement_participants_agreement ON agreement_participants(agreement_id);
CREATE INDEX idx_agreement_participants_user ON agreement_participants(user_id);
CREATE INDEX idx_agreement_participants_status ON agreement_participants(status);

CREATE INDEX idx_agreement_versions_agreement ON agreement_versions(agreement_id);
CREATE INDEX idx_agreement_versions_number ON agreement_versions(agreement_id, version_number);

CREATE INDEX idx_agreement_disputes_agreement ON agreement_disputes(agreement_id);
CREATE INDEX idx_agreement_disputes_reported_by ON agreement_disputes(reported_by);
CREATE INDEX idx_agreement_disputes_status ON agreement_disputes(status);

CREATE INDEX idx_agreement_notifications_agreement ON agreement_notifications(agreement_id);
CREATE INDEX idx_agreement_notifications_user ON agreement_notifications(user_id);
CREATE INDEX idx_agreement_notifications_unread ON agreement_notifications(user_id, read_at) WHERE read_at IS NULL;

-- RLS Policies
ALTER TABLE agreement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view public templates and their own templates
CREATE POLICY "Users can view agreement templates" ON agreement_templates
    FOR SELECT USING (
        is_public = true OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Users can create their own templates
CREATE POLICY "Users can create agreement templates" ON agreement_templates
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND 
        is_system_template = false
    );

-- Users can view agreements they participate in
CREATE POLICY "Users can view their agreements" ON household_agreements
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM agreement_participants 
            WHERE agreement_participants.agreement_id = household_agreements.id 
            AND agreement_participants.user_id = auth.uid()
        )
    );

-- Users can create agreements
CREATE POLICY "Users can create agreements" ON household_agreements
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own agreements (if draft)
CREATE POLICY "Users can update their agreements" ON household_agreements
    FOR UPDATE USING (
        auth.uid() = created_by AND 
        status = 'draft'
    );

-- Users can view participants for their agreements
CREATE POLICY "Users can view agreement participants" ON agreement_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM household_agreements 
            WHERE household_agreements.id = agreement_participants.agreement_id 
            AND household_agreements.created_by = auth.uid()
        )
    );

-- Users can update their own participation status
CREATE POLICY "Users can update their participation" ON agreement_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Users can view versions of their agreements
CREATE POLICY "Users can view agreement versions" ON agreement_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM household_agreements 
            WHERE household_agreements.id = agreement_versions.agreement_id 
            AND (
                household_agreements.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM agreement_participants 
                    WHERE agreement_participants.agreement_id = agreement_versions.agreement_id 
                    AND agreement_participants.user_id = auth.uid()
                )
            )
        )
    );

-- Users can view disputes for their agreements
CREATE POLICY "Users can view agreement disputes" ON agreement_disputes
    FOR SELECT USING (
        reported_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM household_agreements 
            WHERE household_agreements.id = agreement_disputes.agreement_id 
            AND (
                household_agreements.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM agreement_participants 
                    WHERE agreement_participants.agreement_id = agreement_disputes.agreement_id 
                    AND agreement_participants.user_id = auth.uid()
                )
            )
        )
    );

-- Users can create disputes for their agreements
CREATE POLICY "Users can create agreement disputes" ON agreement_disputes
    FOR INSERT WITH CHECK (
        auth.uid() = reported_by AND
        EXISTS (
            SELECT 1 FROM agreement_participants 
            WHERE agreement_participants.agreement_id = agreement_disputes.agreement_id 
            AND agreement_participants.user_id = auth.uid()
        )
    );

-- Users can view their notifications
CREATE POLICY "Users can view their notifications" ON agreement_notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their notification read status
CREATE POLICY "Users can update notification status" ON agreement_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Admin access for moderation
CREATE POLICY "Admins can moderate all agreements" ON household_agreements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

CREATE POLICY "Admins can moderate all disputes" ON agreement_disputes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

-- Functions for agreement management
CREATE OR REPLACE FUNCTION create_agreement_from_template(
    p_template_id UUID,
    p_title VARCHAR(200),
    p_description TEXT,
    p_participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
    v_agreement_id UUID;
    v_template_data JSONB;
    v_participant_id UUID;
BEGIN
    -- Get template data
    SELECT template_data INTO v_template_data
    FROM agreement_templates
    WHERE id = p_template_id AND is_public = true;
    
    IF v_template_data IS NULL THEN
        RAISE EXCEPTION 'Template not found or not public';
    END IF;
    
    -- Create agreement
    INSERT INTO household_agreements (
        title, description, template_id, agreement_data, created_by
    ) VALUES (
        p_title, p_description, p_template_id, v_template_data, auth.uid()
    ) RETURNING id INTO v_agreement_id;
    
    -- Add participants
    FOREACH v_participant_id IN ARRAY p_participant_ids
    LOOP
        INSERT INTO agreement_participants (agreement_id, user_id)
        VALUES (v_agreement_id, v_participant_id);
    END LOOP;
    
    -- Add creator as participant
    INSERT INTO agreement_participants (agreement_id, user_id, status)
    VALUES (v_agreement_id, auth.uid(), 'signed');
    
    RETURN v_agreement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sign an agreement
CREATE OR REPLACE FUNCTION sign_agreement(
    p_agreement_id UUID,
    p_signature_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_participant_id UUID;
    v_all_signed BOOLEAN;
BEGIN
    -- Update participant signature
    UPDATE agreement_participants
    SET 
        status = 'signed',
        signature_data = p_signature_data,
        signed_at = NOW(),
        signature_ip = inet_client_addr(),
        signature_user_agent = current_setting('request.headers', true)
    WHERE agreement_id = p_agreement_id AND user_id = auth.uid()
    RETURNING id INTO v_participant_id;
    
    IF v_participant_id IS NULL THEN
        RAISE EXCEPTION 'User is not a participant in this agreement';
    END IF;
    
    -- Check if all participants have signed
    SELECT NOT EXISTS (
        SELECT 1 FROM agreement_participants 
        WHERE agreement_id = p_agreement_id AND status != 'signed'
    ) INTO v_all_signed;
    
    -- If all signed, activate agreement
    IF v_all_signed THEN
        UPDATE household_agreements
        SET 
            status = 'active',
            effective_date = CURRENT_DATE
        WHERE id = p_agreement_id;
        
        -- Create notification for all participants
        INSERT INTO agreement_notifications (agreement_id, user_id, notification_type, title, message)
        SELECT 
            p_agreement_id,
            user_id,
            'agreement_signed',
            'Agreement Activated',
            'All participants have signed the agreement. It is now active.'
        FROM agreement_participants
        WHERE agreement_id = p_agreement_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agreement status
CREATE OR REPLACE FUNCTION get_agreement_status(p_agreement_id UUID)
RETURNS TABLE (
    agreement_id UUID,
    title VARCHAR(200),
    status VARCHAR(20),
    total_participants BIGINT,
    signed_participants BIGINT,
    pending_participants BIGINT,
    effective_date DATE,
    expiration_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ha.id,
        ha.title,
        ha.status,
        COUNT(ap.id) as total_participants,
        COUNT(ap.id) FILTER (WHERE ap.status = 'signed') as signed_participants,
        COUNT(ap.id) FILTER (WHERE ap.status = 'pending') as pending_participants,
        ha.effective_date,
        ha.expiration_date
    FROM household_agreements ha
    LEFT JOIN agreement_participants ap ON ha.id = ap.agreement_id
    WHERE ha.id = p_agreement_id
    GROUP BY ha.id, ha.title, ha.status, ha.effective_date, ha.expiration_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_agreement_templates_updated_at
    BEFORE UPDATE ON agreement_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_agreements_updated_at
    BEFORE UPDATE ON household_agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreement_participants_updated_at
    BEFORE UPDATE ON agreement_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreement_disputes_updated_at
    BEFORE UPDATE ON agreement_disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
