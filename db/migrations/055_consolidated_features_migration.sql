-- ============================================
-- CONSOLIDATED FEATURES MIGRATION
-- This migration combines all recent feature migrations in the correct order
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENSURE REQUIRED FUNCTION EXISTS
-- ============================================

-- Function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. STUDY MONTHS MIGRATION (045)
-- ============================================

-- Add study_start_month column (1-12, nullable for backward compatibility)
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS study_start_month INTEGER 
CHECK (study_start_month IS NULL OR (study_start_month >= 1 AND study_start_month <= 12));

-- Add graduation_month column (1-12, nullable for backward compatibility)
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS graduation_month INTEGER 
CHECK (graduation_month IS NULL OR (graduation_month >= 1 AND graduation_month <= 12));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_academic_start_month ON user_academic(study_start_month);
CREATE INDEX IF NOT EXISTS idx_user_academic_graduation_month ON user_academic(graduation_month);

-- Add comments for clarity
COMMENT ON COLUMN user_academic.study_start_month IS 'Month when studies started (1-12). Used for accurate academic year calculation. NULL falls back to institution defaults.';
COMMENT ON COLUMN user_academic.graduation_month IS 'Expected month of graduation (1-12). Used for accurate academic year calculation. NULL defaults to June (6).';

-- ============================================
-- 3. UPDATE STUDY YEAR VIEW (046)
-- ============================================

-- Ensure expected_graduation_year column exists
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS expected_graduation_year int 
CHECK (expected_graduation_year IS NULL OR (expected_graduation_year >= EXTRACT(YEAR FROM now()) AND expected_graduation_year <= EXTRACT(YEAR FROM now()) + 10));

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_academic_graduation_year ON user_academic(expected_graduation_year);

-- ============================================
-- 4. ENFORCE STUDY MONTHS (050)
-- ============================================

-- IMPORTANT: Drop the view first to avoid column name conflicts
-- The existing view may have different columns, so we need to drop it completely
DROP VIEW IF EXISTS user_study_year_v CASCADE;

-- Add programme_duration_months column to user_academic
ALTER TABLE user_academic 
ADD COLUMN IF NOT EXISTS programme_duration_months INTEGER 
CHECK (programme_duration_months IS NULL OR (programme_duration_months >= 12 AND programme_duration_months <= 120));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_academic_duration ON user_academic(programme_duration_months);

-- Add comment for clarity
COMMENT ON COLUMN user_academic.programme_duration_months IS 'Programme duration in months, calculated from study_start_month/graduation_month. Used for accurate study year calculation.';

-- Create function to calculate programme duration in months
CREATE OR REPLACE FUNCTION calculate_programme_duration_months(
  p_study_start_year INTEGER,
  p_study_start_month INTEGER,
  p_expected_graduation_year INTEGER,
  p_graduation_month INTEGER
) RETURNS INTEGER AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  duration_months INTEGER;
BEGIN
  -- Validate inputs
  IF p_study_start_year IS NULL OR p_study_start_month IS NULL OR 
     p_expected_graduation_year IS NULL OR p_graduation_month IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Create date objects
  start_date := MAKE_DATE(p_study_start_year, p_study_start_month, 1);
  end_date := MAKE_DATE(p_expected_graduation_year, p_graduation_month, 1);
  
  -- Calculate duration in months
  duration_months := EXTRACT(YEAR FROM age(end_date, start_date))::INTEGER * 12 + 
                     EXTRACT(MONTH FROM age(end_date, start_date))::INTEGER;
  
  -- Clamp to reasonable range (12-120 months = 1-10 years)
  duration_months := GREATEST(12, LEAST(120, duration_months));
  
  RETURN duration_months;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recreate user_study_year_v view with all columns and month-aware calculation
-- Note: View was already dropped above, so we can safely create it now
CREATE VIEW user_study_year_v AS
SELECT 
    ua.user_id,
    ua.university_id,
    ua.degree_level,
    ua.program_id,
    ua.study_start_year,
    ua.study_start_month,
    ua.expected_graduation_year,
    ua.graduation_month,
    ua.programme_duration_months,
    -- Calculate study year using month-aware academic year logic
    CASE 
        -- Month-aware calculation when all required data is provided
        WHEN ua.study_start_month IS NOT NULL 
             AND ua.graduation_month IS NOT NULL 
             AND ua.expected_graduation_year IS NOT NULL 
             AND ua.study_start_year IS NOT NULL THEN
            GREATEST(1, LEAST(
                -- Current academic year (starts in September, month 9)
                -- Academic year offset: if current month >= 9, add 1 to year
                (EXTRACT(YEAR FROM now())::int + CASE WHEN EXTRACT(MONTH FROM now()) >= 9 THEN 1 ELSE 0 END) -
                -- Start academic year (if start month >= 9, add 1 to year)
                (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1,
                -- Maximum possible year (calculated from duration or fallback)
                COALESCE(
                    -- Use duration in months if available
                    CASE WHEN ua.programme_duration_months IS NOT NULL 
                         THEN (ua.programme_duration_months / 12)::INTEGER + 1
                         ELSE NULL
                    END,
                    -- Fallback to graduation year calculation
                    (ua.expected_graduation_year + CASE WHEN ua.graduation_month >= 9 THEN 1 ELSE 0 END) -
                    (ua.study_start_year + CASE WHEN ua.study_start_month >= 9 THEN 1 ELSE 0 END) + 1
                )
            ))
        -- Fallback to old calculation for backward compatibility (when months are NULL)
        WHEN ua.study_start_year IS NOT NULL THEN
            GREATEST(1, EXTRACT(YEAR FROM now())::int - ua.study_start_year + 1)
        -- If no start year, return NULL
        ELSE
            NULL
    END AS study_year
FROM user_academic ua;

-- Update comment
COMMENT ON VIEW user_study_year_v IS 'View to calculate current academic year status using month-aware logic and programme duration. Falls back to calendar year calculation when months or expected_graduation_year are NULL. Academic year starts in September (month 9).';

-- Create trigger function to automatically calculate programme_duration_months
CREATE OR REPLACE FUNCTION update_programme_duration_months()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration if all required fields are present
  IF NEW.study_start_year IS NOT NULL AND NEW.study_start_month IS NOT NULL AND
     NEW.expected_graduation_year IS NOT NULL AND NEW.graduation_month IS NOT NULL THEN
    NEW.programme_duration_months := calculate_programme_duration_months(
      NEW.study_start_year,
      NEW.study_start_month,
      NEW.expected_graduation_year,
      NEW.graduation_month
    );
  ELSE
    NEW.programme_duration_months := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update programme_duration_months
DROP TRIGGER IF EXISTS trigger_update_programme_duration ON user_academic;
CREATE TRIGGER trigger_update_programme_duration
  BEFORE INSERT OR UPDATE ON user_academic
  FOR EACH ROW
  EXECUTE FUNCTION update_programme_duration_months();

-- Backfill programme_duration_months for existing records
UPDATE user_academic
SET programme_duration_months = calculate_programme_duration_months(
  study_start_year,
  study_start_month,
  expected_graduation_year,
  graduation_month
)
WHERE study_start_year IS NOT NULL 
  AND study_start_month IS NOT NULL 
  AND expected_graduation_year IS NOT NULL 
  AND graduation_month IS NOT NULL
  AND programme_duration_months IS NULL;

-- ============================================
-- 5. ADMIN ANALYTICS (011) - FIXED
-- ============================================

-- Table for analytics metrics and KPIs
CREATE TABLE IF NOT EXISTS analytics_metrics (
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
CREATE TABLE IF NOT EXISTS analytics_anomalies (
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
CREATE TABLE IF NOT EXISTS user_journey_events (
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
CREATE TABLE IF NOT EXISTS analytics_funnels (
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
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
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
CREATE TABLE IF NOT EXISTS survey_responses (
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
CREATE TABLE IF NOT EXISTS housing_market_analytics (
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
CREATE TABLE IF NOT EXISTS conflict_hotspots (
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
CREATE TABLE IF NOT EXISTS admin_dashboard_configs (
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
CREATE TABLE IF NOT EXISTS analytics_reports (
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

-- Indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_category ON analytics_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON analytics_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_university ON analytics_metrics(university_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name);

CREATE INDEX IF NOT EXISTS idx_analytics_anomalies_metric ON analytics_anomalies(metric_id);
CREATE INDEX IF NOT EXISTS idx_analytics_anomalies_severity ON analytics_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_analytics_anomalies_status ON analytics_anomalies(status);
CREATE INDEX IF NOT EXISTS idx_analytics_anomalies_detected_at ON analytics_anomalies(detected_at);

CREATE INDEX IF NOT EXISTS idx_user_journey_events_user ON user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_category ON user_journey_events(event_category);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_timestamp ON user_journey_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_name ON user_journey_events(event_name);

CREATE INDEX IF NOT EXISTS idx_analytics_funnels_category ON analytics_funnels(funnel_category);
CREATE INDEX IF NOT EXISTS idx_analytics_funnels_period ON analytics_funnels(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_type ON satisfaction_surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_university ON satisfaction_surveys(university_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_status ON satisfaction_surveys(status);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed_at ON survey_responses(completed_at);

CREATE INDEX IF NOT EXISTS idx_housing_market_analytics_university ON housing_market_analytics(university_id);
CREATE INDEX IF NOT EXISTS idx_housing_market_analytics_period ON housing_market_analytics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_conflict_hotspots_university ON conflict_hotspots(university_id);
CREATE INDEX IF NOT EXISTS idx_conflict_hotspots_risk_level ON conflict_hotspots(risk_level);
CREATE INDEX IF NOT EXISTS idx_conflict_hotspots_period ON conflict_hotspots(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_admin_dashboard_configs_type ON admin_dashboard_configs(dashboard_type);
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_configs_university ON admin_dashboard_configs(university_id);

CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_category ON analytics_reports(report_category);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_status ON analytics_reports(status);

-- RLS Policies for analytics
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

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Admins can access analytics metrics" ON analytics_metrics;
DROP POLICY IF EXISTS "Admins can access analytics anomalies" ON analytics_anomalies;
DROP POLICY IF EXISTS "Admins can access user journey events" ON user_journey_events;
DROP POLICY IF EXISTS "Admins can access analytics funnels" ON analytics_funnels;
DROP POLICY IF EXISTS "Admins can manage satisfaction surveys" ON satisfaction_surveys;
DROP POLICY IF EXISTS "Users can respond to surveys" ON survey_responses;
DROP POLICY IF EXISTS "Users can view their own survey responses" ON survey_responses;
DROP POLICY IF EXISTS "Admins can access housing market analytics" ON housing_market_analytics;
DROP POLICY IF EXISTS "Admins can access conflict hotspots" ON conflict_hotspots;
DROP POLICY IF EXISTS "Admins can manage dashboard configs" ON admin_dashboard_configs;
DROP POLICY IF EXISTS "Admins can manage analytics reports" ON analytics_reports;

-- Admin access for all analytics data (FIXED: uses admins table, not admin_users)
CREATE POLICY "Admins can access analytics metrics" ON analytics_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can access analytics anomalies" ON analytics_anomalies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can access user journey events" ON user_journey_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can access analytics funnels" ON analytics_funnels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage satisfaction surveys" ON satisfaction_surveys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
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
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can access conflict hotspots" ON conflict_hotspots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage dashboard configs" ON admin_dashboard_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage analytics reports" ON analytics_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid()
        )
    );

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_analytics_anomalies_updated_at ON analytics_anomalies;
CREATE TRIGGER update_analytics_anomalies_updated_at
    BEFORE UPDATE ON analytics_anomalies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_satisfaction_surveys_updated_at ON satisfaction_surveys;
CREATE TRIGGER update_satisfaction_surveys_updated_at
    BEFORE UPDATE ON satisfaction_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_dashboard_configs_updated_at ON admin_dashboard_configs;
CREATE TRIGGER update_admin_dashboard_configs_updated_at
    BEFORE UPDATE ON admin_dashboard_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_reports_updated_at ON analytics_reports;
CREATE TRIGGER update_analytics_reports_updated_at
    BEFORE UPDATE ON analytics_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. MATCHING EXPERIMENTS (051)
-- ============================================

-- Table for matching experiments
CREATE TABLE IF NOT EXISTS matching_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Experiment identification
    experiment_name VARCHAR(200) NOT NULL,
    experiment_description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    
    -- Experiment configuration
    variants JSONB NOT NULL, -- Array of experiment variants with configuration
    traffic_split JSONB NOT NULL, -- Traffic split between variants (e.g., {"control": 50, "variant_a": 50})
    assignment_method VARCHAR(50) DEFAULT 'random' CHECK (assignment_method IN ('random', 'user_id_hash', 'cohort')),
    
    -- Targeting
    university_id UUID REFERENCES universities(id),
    user_segments VARCHAR(50)[], -- Target user segments
    filter_criteria JSONB, -- Additional filtering criteria
    
    -- Timing
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Results
    total_users INTEGER DEFAULT 0,
    users_by_variant JSONB, -- Users assigned to each variant
    metrics_summary JSONB, -- Summary of metrics by variant
    
    -- Status
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for experiment assignments
CREATE TABLE IF NOT EXISTS experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Assignment details
    experiment_id UUID NOT NULL REFERENCES matching_experiments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    
    -- Assignment metadata
    assignment_method VARCHAR(50) NOT NULL,
    assignment_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Results
    matches_count INTEGER DEFAULT 0,
    matches_accepted INTEGER DEFAULT 0,
    matches_rejected INTEGER DEFAULT 0,
    chat_initiated INTEGER DEFAULT 0,
    agreement_signed INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one assignment per user per experiment
    UNIQUE(experiment_id, user_id)
);

-- Table for matching quality metrics
-- Note: match_id references matches table - make sure matches table exists
CREATE TABLE IF NOT EXISTS matching_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Metric identification
    experiment_id UUID REFERENCES matching_experiments(id) ON DELETE CASCADE,
    variant_name VARCHAR(100),
    assignment_id UUID REFERENCES experiment_assignments(id) ON DELETE CASCADE,
    
    -- Match metrics (nullable if matches table doesn't exist yet)
    match_id UUID, -- REFERENCES matches(id) ON DELETE CASCADE - commented out for flexibility
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Quality metrics
    compatibility_score DECIMAL(5,2), -- Original compatibility score
    match_quality_score DECIMAL(5,2), -- Overall match quality score
    acceptance_rate DECIMAL(5,2), -- Acceptance rate for this match
    chat_initiation_rate DECIMAL(5,2), -- Chat initiation rate
    agreement_rate DECIMAL(5,2), -- Agreement signing rate
    
    -- Outcome
    outcome VARCHAR(50), -- 'accepted', 'rejected', 'chat_initiated', 'agreement_signed', 'expired'
    outcome_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Context
    match_created_at TIMESTAMP WITH TIME ZONE,
    match_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Analysis period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matching_experiments_status ON matching_experiments(status);
CREATE INDEX IF NOT EXISTS idx_matching_experiments_university ON matching_experiments(university_id);
CREATE INDEX IF NOT EXISTS idx_matching_experiments_dates ON matching_experiments(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_user ON experiment_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_variant ON experiment_assignments(variant_name);

CREATE INDEX IF NOT EXISTS idx_matching_quality_metrics_experiment ON matching_quality_metrics(experiment_id);
CREATE INDEX IF NOT EXISTS idx_matching_quality_metrics_variant ON matching_quality_metrics(variant_name);
CREATE INDEX IF NOT EXISTS idx_matching_quality_metrics_user ON matching_quality_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_matching_quality_metrics_match ON matching_quality_metrics(match_id);
CREATE INDEX IF NOT EXISTS idx_matching_quality_metrics_period ON matching_quality_metrics(period_start, period_end);

-- RLS Policies
ALTER TABLE matching_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can access matching experiments" ON matching_experiments;
DROP POLICY IF EXISTS "Users can view their own experiment assignments" ON experiment_assignments;
DROP POLICY IF EXISTS "Admins can access experiment assignments" ON experiment_assignments;
DROP POLICY IF EXISTS "Users can view their own quality metrics" ON matching_quality_metrics;
DROP POLICY IF EXISTS "Admins can access quality metrics" ON matching_quality_metrics;

-- Admins can access all experiments
CREATE POLICY "Admins can access matching experiments" ON matching_experiments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Users can view their own assignments
CREATE POLICY "Users can view their own experiment assignments" ON experiment_assignments
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can access all assignments
CREATE POLICY "Admins can access experiment assignments" ON experiment_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Users can view their own quality metrics
CREATE POLICY "Users can view their own quality metrics" ON matching_quality_metrics
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can access all quality metrics
CREATE POLICY "Admins can access quality metrics" ON matching_quality_metrics
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Comments
COMMENT ON TABLE matching_experiments IS 'A/B testing experiments for matching algorithm variants';
COMMENT ON TABLE experiment_assignments IS 'User assignments to experiment variants';
COMMENT ON TABLE matching_quality_metrics IS 'Quality metrics for matches in experiments';

-- ============================================
-- 7. SUPPORT TICKETS (052)
-- ============================================

-- Table for support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ticket identification
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- Human-readable ticket number
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Ticket categorization
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'account', 'matching', 'payment', 'safety', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'cancelled')),
    
    -- User information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id), -- Admin user assigned to ticket
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    tags VARCHAR(50)[],
    metadata JSONB, -- Additional metadata
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Table for ticket messages
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message identification
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    
    -- Message content
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'user' CHECK (message_type IN ('user', 'admin', 'system')),
    
    -- Sender information
    sender_id UUID REFERENCES auth.users(id), -- NULL for system messages
    sender_name VARCHAR(200),
    sender_email VARCHAR(200),
    
    -- Message metadata
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes visible only to admins
    attachments JSONB, -- Array of attachment URLs/metadata
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for ticket attachments
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Attachment identification
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
    
    -- File information
    file_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER, -- Size in bytes
    file_url TEXT NOT NULL, -- URL to file storage
    
    -- Upload information
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_university ON support_tickets(university_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_message ON ticket_attachments(message_id);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can access all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view messages in their tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Users can create messages in their tickets" ON ticket_messages;
DROP POLICY IF EXISTS "Admins can access all messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users can view attachments in their tickets" ON ticket_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their tickets" ON ticket_attachments;
DROP POLICY IF EXISTS "Admins can access all attachments" ON ticket_attachments;

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can access all tickets
CREATE POLICY "Admins can access all tickets" ON support_tickets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Users can view messages in their tickets
CREATE POLICY "Users can view messages in their tickets" ON ticket_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
            AND ticket_messages.is_internal = FALSE
        )
    );

-- Users can create messages in their tickets
CREATE POLICY "Users can create messages in their tickets" ON ticket_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_messages.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Admins can access all messages
CREATE POLICY "Admins can access all messages" ON ticket_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Users can view attachments in their tickets
CREATE POLICY "Users can view attachments in their tickets" ON ticket_attachments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_attachments.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Users can upload attachments to their tickets
CREATE POLICY "Users can upload attachments to their tickets" ON ticket_attachments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets
            WHERE support_tickets.id = ticket_attachments.ticket_id
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Admins can access all attachments
CREATE POLICY "Admins can access all attachments" ON ticket_attachments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_num TEXT;
    ticket_count INTEGER;
BEGIN
    -- Get count of tickets created today (handle NULL case)
    SELECT COALESCE(COUNT(*), 0) INTO ticket_count
    FROM support_tickets 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate ticket number: TICKET-YYYYMMDD-XXXX
    ticket_num := 'TICKET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((ticket_count + 1)::TEXT, 4, '0');
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate ticket number on insert
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number_trigger ON support_tickets;
CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- Comments
COMMENT ON TABLE support_tickets IS 'Support tickets for user issues and inquiries';
COMMENT ON TABLE ticket_messages IS 'Messages in support tickets';
COMMENT ON TABLE ticket_attachments IS 'File attachments in support tickets';

-- ============================================
-- 8. REFERRAL SYSTEM (053)
-- ============================================

-- Table for referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
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
CREATE TABLE IF NOT EXISTS referrals (
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
CREATE TABLE IF NOT EXISTS campus_ambassadors (
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
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_campus_ambassadors_user ON campus_ambassadors(user_id);
CREATE INDEX IF NOT EXISTS idx_campus_ambassadors_university ON campus_ambassadors(university_id);
CREATE INDEX IF NOT EXISTS idx_campus_ambassadors_status ON campus_ambassadors(status);

-- RLS Policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_ambassadors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can create their own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Admins can access all referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can access all referrals" ON referrals;
DROP POLICY IF EXISTS "Users can view their own ambassador status" ON campus_ambassadors;
DROP POLICY IF EXISTS "Admins can access all ambassadors" ON campus_ambassadors;

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
    -- Generate code: REF-XXXX-YYYY
    user_code := UPPER(SUBSTRING(user_id::TEXT, 1, 8));
    code := 'REF-' || user_code || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE referral_codes IS 'Referral codes for user referrals';
COMMENT ON TABLE referrals IS 'Referral tracking and rewards';
COMMENT ON TABLE campus_ambassadors IS 'Campus ambassador program tracking';

-- ============================================
-- 9. ANNOUNCEMENTS (054)
-- ============================================

-- Table for announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Announcement identification
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'promotion')),
    
    -- Announcement settings
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Higher priority = shown first
    
    -- Targeting
    university_id UUID REFERENCES universities(id), -- NULL for all universities
    user_segments VARCHAR(50)[], -- Target user segments
    filter_criteria JSONB, -- Additional filtering criteria
    
    -- Display settings
    display_type VARCHAR(20) DEFAULT 'banner' CHECK (display_type IN ('banner', 'modal', 'toast', 'inline')),
    position VARCHAR(20) DEFAULT 'top' CHECK (position IN ('top', 'bottom', 'center')),
    dismissible BOOLEAN DEFAULT TRUE,
    auto_dismiss_seconds INTEGER, -- Auto-dismiss after N seconds (NULL for no auto-dismiss)
    
    -- Action buttons
    primary_action_label VARCHAR(50),
    primary_action_url VARCHAR(500),
    secondary_action_label VARCHAR(50),
    secondary_action_url VARCHAR(500),
    
    -- Timing
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB, -- Additional metadata
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for announcement views
CREATE TABLE IF NOT EXISTS announcement_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- View identification
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- View metadata
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    action_clicked VARCHAR(50), -- 'primary' or 'secondary'
    action_clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one view per user per announcement
    UNIQUE(announcement_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_university ON announcements(university_id);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority DESC);

CREATE INDEX IF NOT EXISTS idx_announcement_views_announcement ON announcement_views(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_views_user ON announcement_views(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_views_dismissed ON announcement_views(dismissed);

-- RLS Policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view active announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can access all announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view their own announcement views" ON announcement_views;
DROP POLICY IF EXISTS "Users can create their own announcement views" ON announcement_views;
DROP POLICY IF EXISTS "Users can update their own announcement views" ON announcement_views;
DROP POLICY IF EXISTS "Admins can access all announcement views" ON announcement_views;

-- Users can view active announcements
CREATE POLICY "Users can view active announcements" ON announcements
    FOR SELECT
    USING (
        is_active = TRUE
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Users can view their own announcement views
CREATE POLICY "Users can view their own announcement views" ON announcement_views
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own announcement views
CREATE POLICY "Users can create their own announcement views" ON announcement_views
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own announcement views
CREATE POLICY "Users can update their own announcement views" ON announcement_views
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admins can access all announcements
CREATE POLICY "Admins can access all announcements" ON announcements
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Admins can access all announcement views
CREATE POLICY "Admins can access all announcement views" ON announcement_views
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
        )
    );

-- Comments
COMMENT ON TABLE announcements IS 'In-product announcements for users';
COMMENT ON TABLE announcement_views IS 'User views and interactions with announcements';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - analytics_metrics';
    RAISE NOTICE '  - analytics_anomalies';
    RAISE NOTICE '  - user_journey_events';
    RAISE NOTICE '  - matching_experiments';
    RAISE NOTICE '  - experiment_assignments';
    RAISE NOTICE '  - matching_quality_metrics';
    RAISE NOTICE '  - support_tickets';
    RAISE NOTICE '  - ticket_messages';
    RAISE NOTICE '  - ticket_attachments';
    RAISE NOTICE '  - referral_codes';
    RAISE NOTICE '  - referrals';
    RAISE NOTICE '  - campus_ambassadors';
    RAISE NOTICE '  - announcements';
    RAISE NOTICE '  - announcement_views';
END $$;

