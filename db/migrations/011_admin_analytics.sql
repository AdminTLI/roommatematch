-- Community Pulse Dashboard for Admins - Advanced Analytics System
-- This migration adds tables for comprehensive analytics and admin insights

-- Table for analytics metrics and KPIs
CREATE TABLE analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Metric identification
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL CHECK (metric_category IN ('user_engagement', 'matching_success', 'safety_incidents', 'housing_availability', 'satisfaction_scores', 'retention_rates', 'revenue_metrics', 'performance_metrics')),
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('count', 'percentage', 'average', 'sum', 'rate', 'ratio')),
    
    -- Metric data
    metric_value DECIMAL(15,4) NOT NULL,
    previous_value DECIMAL(15,4), -- For comparison
    target_value DECIMAL(15,4), -- Target/goal value
    unit VARCHAR(20), -- e.g., 'users', 'percent', 'euros', 'hours'
    
    -- Time period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    granularity VARCHAR(20) DEFAULT 'daily' CHECK (granularity IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Context and filtering
    university_id UUID REFERENCES universities(id),
    user_segment VARCHAR(50), -- e.g., 'new_users', 'active_users', 'premium_users'
    filter_criteria JSONB, -- Additional filtering criteria
    
    -- Metadata
    data_source VARCHAR(100), -- Source of the data
    calculation_method TEXT, -- How the metric was calculated
    confidence_level DECIMAL(3,2), -- Confidence in the data (0-1)
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for anomaly detection results
CREATE TABLE analytics_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Anomaly identification
    metric_id UUID NOT NULL REFERENCES analytics_metrics(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(50) NOT NULL CHECK (anomaly_type IN ('spike', 'drop', 'trend_change', 'seasonal_deviation', 'outlier', 'pattern_break')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Anomaly details
    expected_value DECIMAL(15,4),
    actual_value DECIMAL(15,4) NOT NULL,
    deviation_percentage DECIMAL(8,4), -- How much it deviates from expected
    confidence_score DECIMAL(3,2), -- Confidence in anomaly detection (0-1)
    
    -- Analysis
    possible_causes TEXT[],
    impact_assessment TEXT,
    recommended_actions TEXT[],
    
    -- Status
    status VARCHAR(20) DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'acknowledged', 'resolved', 'false_positive')),
    assigned_to UUID REFERENCES auth.users(id),
    investigation_notes TEXT,
    
    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user journey analytics
CREATE TABLE user_journey_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and session
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    
    -- Event details
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('page_view', 'user_action', 'system_event', 'conversion', 'error', 'performance')),
    event_properties JSONB, -- Additional event data
    
    -- Context
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    
    -- Timing
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration_seconds INTEGER,
    
    -- Conversion tracking
    conversion_value DECIMAL(10,2),
    conversion_goal VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for funnel analysis
CREATE TABLE analytics_funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Funnel identification
    funnel_name VARCHAR(100) NOT NULL,
    funnel_category VARCHAR(50) NOT NULL CHECK (funnel_category IN ('onboarding', 'matching', 'housing_search', 'agreement_signing', 'payment', 'engagement')),
    
    -- Funnel steps
    steps JSONB NOT NULL, -- Array of funnel steps with names and order
    
    -- Analysis period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Results
    total_users INTEGER NOT NULL,
    step_conversions JSONB NOT NULL, -- Conversion rates for each step
    drop_off_points JSONB, -- Where users are dropping off most
    completion_rate DECIMAL(5,2), -- Overall funnel completion rate
    average_time_to_complete INTERVAL,
    
    -- Insights
    bottlenecks TEXT[],
    optimization_opportunities TEXT[],
    
    -- Timestamps
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for satisfaction surveys and feedback
CREATE TABLE satisfaction_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Survey details
    survey_name VARCHAR(200) NOT NULL,
    survey_type VARCHAR(50) NOT NULL CHECK (survey_type IN ('nps', 'csat', 'ces', 'custom', 'post_match', 'post_agreement', 'post_move_in')),
    target_audience VARCHAR(100), -- Who the survey is for
    
    -- Survey content
    questions JSONB NOT NULL, -- Survey questions and options
    response_options JSONB, -- Available response options
    
    -- Targeting and distribution
    university_id UUID REFERENCES universities(id),
    user_segments VARCHAR(50)[],
    distribution_method VARCHAR(50) DEFAULT 'in_app' CHECK (distribution_method IN ('in_app', 'email', 'sms', 'external')),
    
    -- Status and timing
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Results summary
    total_responses INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    average_score DECIMAL(5,2),
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for survey responses
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Response identification
    survey_id UUID NOT NULL REFERENCES satisfaction_surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Response data
    responses JSONB NOT NULL, -- User's answers to survey questions
    overall_score DECIMAL(5,2),
    completion_time_seconds INTEGER,
    
    -- Context
    device_type VARCHAR(50),
    browser VARCHAR(50),
    ip_address VARCHAR(45),
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for housing market analytics
CREATE TABLE housing_market_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Market data
    university_id UUID NOT NULL REFERENCES universities(id),
    location VARCHAR(200), -- Specific area within university city
    
    -- Availability metrics
    total_listings INTEGER NOT NULL,
    available_listings INTEGER NOT NULL,
    average_price_per_month DECIMAL(10,2),
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    
    -- Demand metrics
    total_searches INTEGER NOT NULL,
    unique_searchers INTEGER NOT NULL,
    average_search_duration_minutes INTEGER,
    
    -- Supply-demand ratio
    listings_per_searcher DECIMAL(8,4),
    demand_supply_ratio DECIMAL(8,4),
    
    -- Market trends
    price_trend VARCHAR(20) CHECK (price_trend IN ('increasing', 'decreasing', 'stable', 'volatile')),
    availability_trend VARCHAR(20) CHECK (availability_trend IN ('improving', 'worsening', 'stable')),
    
    -- Analysis period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for conflict and safety hotspots
CREATE TABLE conflict_hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Location identification
    university_id UUID NOT NULL REFERENCES universities(id),
    location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('residence_hall', 'apartment_complex', 'neighborhood', 'campus_area', 'specific_address')),
    location_name VARCHAR(200),
    location_coordinates POINT, -- Geographic coordinates
    
    -- Conflict metrics
    total_incidents INTEGER NOT NULL,
    incidents_by_type JSONB, -- Breakdown by incident type
    incidents_by_severity JSONB, -- Breakdown by severity
    average_resolution_time_hours DECIMAL(8,2),
    
    -- Safety metrics
    safety_score DECIMAL(3,2), -- Overall safety score (1-10)
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Trends
    incident_trend VARCHAR(20) CHECK (incident_trend IN ('increasing', 'decreasing', 'stable')),
    last_incident_date TIMESTAMP WITH TIME ZONE,
    
    -- Analysis period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Recommendations
    recommended_actions TEXT[],
    priority_level INTEGER CHECK (priority_level >= 1 AND priority_level <= 5),
    
    -- Timestamps
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for admin dashboard configurations
CREATE TABLE admin_dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Configuration details
    dashboard_name VARCHAR(100) NOT NULL,
    dashboard_type VARCHAR(50) NOT NULL CHECK (dashboard_type IN ('university_admin', 'super_admin', 'safety_admin', 'housing_admin', 'analytics_admin')),
    
    -- Dashboard layout and widgets
    layout_config JSONB NOT NULL, -- Dashboard layout configuration
    widget_configs JSONB NOT NULL, -- Individual widget configurations
    
    -- Access control
    university_id UUID REFERENCES universities(id),
    allowed_roles VARCHAR(50)[],
    
    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for automated reports and alerts
CREATE TABLE analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Report details
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('scheduled', 'triggered', 'ad_hoc', 'alert')),
    report_category VARCHAR(50) NOT NULL CHECK (report_category IN ('summary', 'detailed', 'anomaly', 'performance', 'safety', 'housing')),
    
    -- Content
    report_data JSONB NOT NULL, -- Report content and data
    insights TEXT[], -- Key insights from the report
    recommendations TEXT[], -- Actionable recommendations
    
    -- Delivery
    recipients UUID[], -- User IDs to receive the report
    delivery_method VARCHAR(50) DEFAULT 'email' CHECK (delivery_method IN ('email', 'dashboard', 'webhook', 'file')),
    delivery_schedule VARCHAR(100), -- Cron expression for scheduled reports
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'delivered')),
    
    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_metrics_category ON analytics_metrics(metric_category);
CREATE INDEX idx_analytics_metrics_period ON analytics_metrics(period_start, period_end);
CREATE INDEX idx_analytics_metrics_university ON analytics_metrics(university_id);
CREATE INDEX idx_analytics_metrics_name ON analytics_metrics(metric_name);

CREATE INDEX idx_analytics_anomalies_metric ON analytics_anomalies(metric_id);
CREATE INDEX idx_analytics_anomalies_severity ON analytics_anomalies(severity);
CREATE INDEX idx_analytics_anomalies_status ON analytics_anomalies(status);
CREATE INDEX idx_analytics_anomalies_detected_at ON analytics_anomalies(detected_at);

CREATE INDEX idx_user_journey_events_user ON user_journey_events(user_id);
CREATE INDEX idx_user_journey_events_category ON user_journey_events(event_category);
CREATE INDEX idx_user_journey_events_timestamp ON user_journey_events(event_timestamp);
CREATE INDEX idx_user_journey_events_name ON user_journey_events(event_name);

CREATE INDEX idx_analytics_funnels_category ON analytics_funnels(funnel_category);
CREATE INDEX idx_analytics_funnels_period ON analytics_funnels(period_start, period_end);

CREATE INDEX idx_satisfaction_surveys_type ON satisfaction_surveys(survey_type);
CREATE INDEX idx_satisfaction_surveys_university ON satisfaction_surveys(university_id);
CREATE INDEX idx_satisfaction_surveys_status ON satisfaction_surveys(status);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX idx_survey_responses_completed_at ON survey_responses(completed_at);

CREATE INDEX idx_housing_market_analytics_university ON housing_market_analytics(university_id);
CREATE INDEX idx_housing_market_analytics_period ON housing_market_analytics(period_start, period_end);

CREATE INDEX idx_conflict_hotspots_university ON conflict_hotspots(university_id);
CREATE INDEX idx_conflict_hotspots_risk_level ON conflict_hotspots(risk_level);
CREATE INDEX idx_conflict_hotspots_period ON conflict_hotspots(period_start, period_end);

CREATE INDEX idx_admin_dashboard_configs_type ON admin_dashboard_configs(dashboard_type);
CREATE INDEX idx_admin_dashboard_configs_university ON admin_dashboard_configs(university_id);

CREATE INDEX idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX idx_analytics_reports_category ON analytics_reports(report_category);
CREATE INDEX idx_analytics_reports_status ON analytics_reports(status);

-- RLS Policies
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_market_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- Admin access for all analytics data
CREATE POLICY "Admins can access analytics metrics" ON analytics_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'analytics_admin')
        )
    );

CREATE POLICY "Admins can access analytics anomalies" ON analytics_anomalies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'analytics_admin')
        )
    );

CREATE POLICY "Admins can access user journey events" ON user_journey_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'analytics_admin')
        )
    );

CREATE POLICY "Admins can access analytics funnels" ON analytics_funnels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'analytics_admin')
        )
    );

CREATE POLICY "Admins can manage satisfaction surveys" ON satisfaction_surveys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'analytics_admin')
        )
    );

CREATE POLICY "Users can respond to surveys" ON survey_responses
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM satisfaction_surveys 
            WHERE satisfaction_surveys.id = survey_id 
            AND satisfaction_surveys.status = 'active'
        )
    );

CREATE POLICY "Users can view their own survey responses" ON survey_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can access housing market analytics" ON housing_market_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'housing_admin')
        )
    );

CREATE POLICY "Admins can access conflict hotspots" ON conflict_hotspots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'safety_admin')
        )
    );

CREATE POLICY "Admins can manage dashboard configs" ON admin_dashboard_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

CREATE POLICY "Admins can manage analytics reports" ON analytics_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'analytics_admin')
        )
    );

-- Functions for analytics
CREATE OR REPLACE FUNCTION calculate_funnel_metrics(
    p_funnel_name VARCHAR(100),
    p_period_start TIMESTAMP WITH TIME ZONE,
    p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    funnel_id UUID,
    step_name VARCHAR(100),
    step_order INTEGER,
    users_reached INTEGER,
    conversion_rate DECIMAL(5,2),
    drop_off_count INTEGER,
    drop_off_percentage DECIMAL(5,2)
) AS $$
DECLARE
    v_funnel_id UUID;
BEGIN
    -- This is a simplified version - in reality, this would be much more complex
    -- and would involve analyzing user_journey_events data
    
    RETURN QUERY
    SELECT 
        v_funnel_id,
        'Step 1'::VARCHAR(100),
        1,
        1000,
        95.5,
        45,
        4.5;
        
    RETURN QUERY
    SELECT 
        v_funnel_id,
        'Step 2'::VARCHAR(100),
        2,
        955,
        78.2,
        208,
        21.8;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION detect_metric_anomalies(
    p_metric_name VARCHAR(100),
    p_university_id UUID DEFAULT NULL,
    p_threshold DECIMAL DEFAULT 0.2
)
RETURNS INTEGER AS $$
DECLARE
    v_anomalies_detected INTEGER := 0;
BEGIN
    -- Simplified anomaly detection logic
    -- In reality, this would use statistical methods like:
    -- - Z-score analysis
    -- - Moving averages
    -- - Seasonal decomposition
    -- - Machine learning models
    
    -- For demo purposes, just return 0
    RETURN v_anomalies_detected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_admin_dashboard_data(
    p_university_id UUID DEFAULT NULL,
    p_period_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_dashboard_data JSONB;
BEGIN
    -- This function would aggregate data from multiple tables
    -- to generate comprehensive dashboard data
    
    v_dashboard_data := jsonb_build_object(
        'total_users', 1250,
        'active_users', 890,
        'new_signups', 45,
        'total_matches', 234,
        'successful_matches', 189,
        'safety_incidents', 12,
        'housing_listings', 156,
        'average_satisfaction', 4.2
    );
    
    RETURN v_dashboard_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_analytics_anomalies_updated_at
    BEFORE UPDATE ON analytics_anomalies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_satisfaction_surveys_updated_at
    BEFORE UPDATE ON satisfaction_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_dashboard_configs_updated_at
    BEFORE UPDATE ON admin_dashboard_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at
    BEFORE UPDATE ON analytics_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
