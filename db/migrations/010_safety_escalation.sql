-- Safety Escalation & Wellness Checks System
-- This migration adds tables for managing safety requests and wellness monitoring

-- Table for safety incidents and help requests
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Incident details
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('help_request', 'safety_concern', 'emergency', 'wellness_check', 'conflict_report', 'harassment', 'other')),
    severity_level VARCHAR(20) DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    
    -- User and location
    reported_by UUID NOT NULL REFERENCES auth.users(id),
    reported_for UUID REFERENCES auth.users(id), -- If reporting for someone else
    location VARCHAR(200), -- Physical location if relevant
    chat_room_id UUID, -- If incident occurred in chat
    forum_post_id UUID, -- If incident occurred in forum
    
    -- Incident description
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[], -- Links to screenshots, photos, etc.
    
    -- Status and handling
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
    assigned_to UUID REFERENCES auth.users(id), -- Admin assigned to handle
    priority_score INTEGER DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
    
    -- Response and resolution
    initial_response TEXT,
    resolution_notes TEXT,
    actions_taken TEXT[],
    
    -- Timestamps
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for wellness check-ins
CREATE TABLE wellness_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Check-in details
    check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('automated', 'manual', 'scheduled', 'emergency')),
    trigger_reason VARCHAR(100), -- What triggered this check-in
    
    -- Wellness assessment
    overall_wellness INTEGER CHECK (overall_wellness >= 1 AND overall_wellness <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    social_connections INTEGER CHECK (social_connections >= 1 AND social_connections <= 10),
    academic_pressure INTEGER CHECK (academic_pressure >= 1 AND academic_pressure <= 10),
    
    -- Additional feedback
    concerns TEXT[],
    positive_notes TEXT[],
    support_needed VARCHAR(100)[],
    
    -- Response
    response_text TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'skipped', 'overdue')),
    
    -- Timestamps
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for safety alerts and notifications
CREATE TABLE safety_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Alert details
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('emergency', 'safety_reminder', 'wellness_check', 'incident_update', 'security_notice')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Targeting
    target_users UUID[], -- Specific users to notify
    target_universities UUID[], -- All users at specific universities
    target_roles VARCHAR(50)[], -- Target specific user roles
    
    -- Alert content
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_required BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500), -- Link to take action
    
    -- Delivery
    delivery_methods VARCHAR(20)[] DEFAULT ARRAY['in_app', 'email'] CHECK (delivery_methods <@ ARRAY['in_app', 'email', 'sms', 'push']),
    sent_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_read INTEGER DEFAULT 0,
    total_acted INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for emergency contacts and escalation chains
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Contact details
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('personal', 'family', 'emergency', 'campus_security', 'counselor', 'landlord', 'other')),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    relationship VARCHAR(100),
    
    -- Escalation settings
    escalation_order INTEGER DEFAULT 1, -- Order to contact (1 = first)
    auto_contact BOOLEAN DEFAULT FALSE, -- Auto-contact in emergencies
    contact_conditions TEXT[], -- When to contact this person
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, contact_type, escalation_order)
);

-- Table for wellness patterns and analytics
CREATE TABLE wellness_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Pattern analysis
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    
    -- Calculated patterns
    average_wellness DECIMAL(3,2),
    wellness_trend VARCHAR(20) CHECK (wellness_trend IN ('improving', 'stable', 'declining', 'volatile')),
    risk_factors TEXT[],
    protective_factors TEXT[],
    
    -- Recommendations
    recommended_actions TEXT[],
    next_check_in_date DATE,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for safety statistics and reporting
CREATE TABLE safety_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    university_id UUID REFERENCES universities(id),
    
    -- Incident statistics
    total_incidents INTEGER DEFAULT 0,
    incidents_by_type JSONB,
    incidents_by_severity JSONB,
    average_response_time_minutes INTEGER,
    
    -- Wellness statistics
    total_wellness_checks INTEGER DEFAULT 0,
    average_wellness_score DECIMAL(3,2),
    users_at_risk INTEGER DEFAULT 0,
    
    -- Resolution statistics
    incidents_resolved INTEGER DEFAULT 0,
    incidents_escalated INTEGER DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2),
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_safety_incidents_reported_by ON safety_incidents(reported_by);
CREATE INDEX idx_safety_incidents_status ON safety_incidents(status);
CREATE INDEX idx_safety_incidents_severity ON safety_incidents(severity_level);
CREATE INDEX idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX idx_safety_incidents_reported_at ON safety_incidents(reported_at);
CREATE INDEX idx_safety_incidents_assigned_to ON safety_incidents(assigned_to);

CREATE INDEX idx_wellness_checks_user ON wellness_checks(user_id);
CREATE INDEX idx_wellness_checks_type ON wellness_checks(check_type);
CREATE INDEX idx_wellness_checks_status ON wellness_checks(status);
CREATE INDEX idx_wellness_checks_scheduled_at ON wellness_checks(scheduled_at);
CREATE INDEX idx_wellness_checks_completed_at ON wellness_checks(completed_at);

CREATE INDEX idx_safety_alerts_type ON safety_alerts(alert_type);
CREATE INDEX idx_safety_alerts_severity ON safety_alerts(severity);
CREATE INDEX idx_safety_alerts_sent_at ON safety_alerts(sent_at);
CREATE INDEX idx_safety_alerts_expires_at ON safety_alerts(expires_at);

CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_type ON emergency_contacts(contact_type);
CREATE INDEX idx_emergency_contacts_escalation_order ON emergency_contacts(escalation_order);

CREATE INDEX idx_wellness_patterns_user ON wellness_patterns(user_id);
CREATE INDEX idx_wellness_patterns_period ON wellness_patterns(analysis_period_start, analysis_period_end);

CREATE INDEX idx_safety_statistics_period ON safety_statistics(period_start, period_end);
CREATE INDEX idx_safety_statistics_university ON safety_statistics(university_id);

-- RLS Policies
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_statistics ENABLE ROW LEVEL SECURITY;

-- Users can view their own safety incidents
CREATE POLICY "Users can view their own safety incidents" ON safety_incidents
    FOR SELECT USING (
        reported_by = auth.uid() OR 
        reported_for = auth.uid()
    );

-- Users can create safety incidents
CREATE POLICY "Users can create safety incidents" ON safety_incidents
    FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Users can update their own safety incidents (if still open)
CREATE POLICY "Users can update their own safety incidents" ON safety_incidents
    FOR UPDATE USING (
        auth.uid() = reported_by AND 
        status IN ('open', 'in_progress')
    );

-- Users can view their own wellness checks
CREATE POLICY "Users can view their own wellness checks" ON wellness_checks
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create wellness checks
CREATE POLICY "Users can create wellness checks" ON wellness_checks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own wellness checks
CREATE POLICY "Users can update their own wellness checks" ON wellness_checks
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view safety alerts targeted to them
CREATE POLICY "Users can view relevant safety alerts" ON safety_alerts
    FOR SELECT USING (
        auth.uid() = ANY(target_users) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.university_id = ANY(target_universities)
        )
    );

-- Users can view their own emergency contacts
CREATE POLICY "Users can manage their emergency contacts" ON emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

-- Users can view their own wellness patterns
CREATE POLICY "Users can view their own wellness patterns" ON wellness_patterns
    FOR SELECT USING (auth.uid() = user_id);

-- Admin access for all safety data
CREATE POLICY "Admins can manage all safety incidents" ON safety_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'safety_admin')
        )
    );

CREATE POLICY "Admins can manage wellness checks" ON wellness_checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'wellness_admin')
        )
    );

CREATE POLICY "Admins can manage safety alerts" ON safety_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'safety_admin')
        )
    );

CREATE POLICY "Admins can view safety statistics" ON safety_statistics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

-- Functions for safety management
CREATE OR REPLACE FUNCTION create_safety_incident(
    p_incident_type VARCHAR(50),
    p_severity_level VARCHAR(20),
    p_title VARCHAR(200),
    p_description TEXT,
    p_reported_for UUID DEFAULT NULL,
    p_location VARCHAR(200) DEFAULT NULL,
    p_chat_room_id UUID DEFAULT NULL,
    p_forum_post_id UUID DEFAULT NULL,
    p_evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
    v_incident_id UUID;
    v_priority_score INTEGER;
BEGIN
    -- Calculate priority score based on severity and type
    v_priority_score := CASE 
        WHEN p_severity_level = 'critical' THEN 10
        WHEN p_severity_level = 'high' THEN 8
        WHEN p_severity_level = 'medium' THEN 5
        WHEN p_severity_level = 'low' THEN 3
        ELSE 5
    END;
    
    -- Adjust based on incident type
    IF p_incident_type IN ('emergency', 'harassment') THEN
        v_priority_score := v_priority_score + 2;
    ELSIF p_incident_type IN ('help_request', 'safety_concern') THEN
        v_priority_score := v_priority_score + 1;
    END IF;
    
    -- Create the incident
    INSERT INTO safety_incidents (
        incident_type, severity_level, reported_by, reported_for,
        location, chat_room_id, forum_post_id, title, description,
        evidence_urls, priority_score
    ) VALUES (
        p_incident_type, p_severity_level, auth.uid(), p_reported_for,
        p_location, p_chat_room_id, p_forum_post_id, p_title, p_description,
        p_evidence_urls, v_priority_score
    ) RETURNING id INTO v_incident_id;
    
    -- Create safety alert for high/critical incidents
    IF p_severity_level IN ('high', 'critical') THEN
        INSERT INTO safety_alerts (
            alert_type, severity, target_users, title, message,
            action_required, action_url
        ) VALUES (
            'incident_update', p_severity_level, ARRAY[auth.uid()],
            'Safety Incident Reported',
            'Your safety incident has been reported and is being reviewed.',
            true, '/safety/incidents/' || v_incident_id
        );
    END IF;
    
    RETURN v_incident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create wellness check
CREATE OR REPLACE FUNCTION create_wellness_check(
    p_user_id UUID,
    p_check_type VARCHAR(50),
    p_trigger_reason VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_check_id UUID;
BEGIN
    INSERT INTO wellness_checks (
        user_id, check_type, trigger_reason, status, scheduled_at
    ) VALUES (
        p_user_id, p_check_type, p_trigger_reason, 'pending', NOW()
    ) RETURNING id INTO v_check_id;
    
    RETURN v_check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user safety summary
CREATE OR REPLACE FUNCTION get_user_safety_summary(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    total_incidents BIGINT,
    open_incidents BIGINT,
    resolved_incidents BIGINT,
    last_wellness_check TIMESTAMP WITH TIME ZONE,
    average_wellness_score DECIMAL(3,2),
    risk_level VARCHAR(20),
    emergency_contacts_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_user_id,
        COUNT(si.id) as total_incidents,
        COUNT(si.id) FILTER (WHERE si.status IN ('open', 'in_progress')) as open_incidents,
        COUNT(si.id) FILTER (WHERE si.status = 'resolved') as resolved_incidents,
        MAX(wc.completed_at) as last_wellness_check,
        AVG(wc.overall_wellness) as average_wellness_score,
        CASE 
            WHEN AVG(wc.overall_wellness) < 4 THEN 'high'
            WHEN AVG(wc.overall_wellness) < 7 THEN 'medium'
            ELSE 'low'
        END as risk_level,
        COUNT(ec.id) as emergency_contacts_count
    FROM (SELECT p_user_id as user_id) u
    LEFT JOIN safety_incidents si ON u.user_id = si.reported_by OR u.user_id = si.reported_for
    LEFT JOIN wellness_checks wc ON u.user_id = wc.user_id AND wc.status = 'completed'
    LEFT JOIN emergency_contacts ec ON u.user_id = ec.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger automated wellness check
CREATE OR REPLACE FUNCTION trigger_automated_wellness_check(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_last_check TIMESTAMP WITH TIME ZONE;
    v_days_since_last_check INTEGER;
BEGIN
    -- Get last wellness check
    SELECT MAX(completed_at) INTO v_last_check
    FROM wellness_checks 
    WHERE user_id = p_user_id AND status = 'completed';
    
    -- Calculate days since last check
    IF v_last_check IS NULL THEN
        v_days_since_last_check := 999; -- No previous check
    ELSE
        v_days_since_last_check := EXTRACT(DAY FROM NOW() - v_last_check);
    END IF;
    
    -- Trigger check if it's been more than 7 days
    IF v_days_since_last_check >= 7 THEN
        PERFORM create_wellness_check(p_user_id, 'automated', '7_day_interval');
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_safety_incidents_updated_at
    BEFORE UPDATE ON safety_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_checks_updated_at
    BEFORE UPDATE ON wellness_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_alerts_updated_at
    BEFORE UPDATE ON safety_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically create wellness patterns after multiple checks
CREATE OR REPLACE FUNCTION analyze_wellness_patterns()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_check_count INTEGER;
    v_average_wellness DECIMAL(3,2);
    v_trend VARCHAR(20);
BEGIN
    -- Only analyze if this is a completed wellness check
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        v_user_id := NEW.user_id;
        
        -- Count wellness checks in last 30 days
        SELECT COUNT(*) INTO v_check_count
        FROM wellness_checks 
        WHERE user_id = v_user_id 
        AND completed_at >= NOW() - INTERVAL '30 days'
        AND status = 'completed';
        
        -- If we have enough data points, create pattern analysis
        IF v_check_count >= 3 THEN
            -- Calculate average wellness score
            SELECT AVG(overall_wellness) INTO v_average_wellness
            FROM wellness_checks 
            WHERE user_id = v_user_id 
            AND completed_at >= NOW() - INTERVAL '30 days'
            AND status = 'completed'
            AND overall_wellness IS NOT NULL;
            
            -- Determine trend (simplified)
            v_trend := CASE 
                WHEN v_average_wellness >= 7 THEN 'stable'
                WHEN v_average_wellness >= 5 THEN 'declining'
                ELSE 'volatile'
            END;
            
            -- Insert or update wellness pattern
            INSERT INTO wellness_patterns (
                user_id, analysis_period_start, analysis_period_end,
                average_wellness, wellness_trend, next_check_in_date
            ) VALUES (
                v_user_id, 
                CURRENT_DATE - INTERVAL '30 days',
                CURRENT_DATE,
                v_average_wellness,
                v_trend,
                CURRENT_DATE + INTERVAL '7 days'
            )
            ON CONFLICT (user_id, analysis_period_start, analysis_period_end) 
            DO UPDATE SET
                average_wellness = EXCLUDED.average_wellness,
                wellness_trend = EXCLUDED.wellness_trend,
                calculated_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analyze_wellness_patterns_trigger
    AFTER UPDATE ON wellness_checks
    FOR EACH ROW
    EXECUTE FUNCTION analyze_wellness_patterns();
