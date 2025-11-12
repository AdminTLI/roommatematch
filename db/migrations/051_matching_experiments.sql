-- Matching Experiments and A/B Testing
-- This migration adds tables for matching algorithm experiments and quality metrics

-- Table for matching experiments
CREATE TABLE matching_experiments (
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
CREATE TABLE experiment_assignments (
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
CREATE TABLE matching_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Metric identification
    experiment_id UUID REFERENCES matching_experiments(id) ON DELETE CASCADE,
    variant_name VARCHAR(100),
    assignment_id UUID REFERENCES experiment_assignments(id) ON DELETE CASCADE,
    
    -- Match metrics
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
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
CREATE INDEX idx_matching_experiments_status ON matching_experiments(status);
CREATE INDEX idx_matching_experiments_university ON matching_experiments(university_id);
CREATE INDEX idx_matching_experiments_dates ON matching_experiments(start_date, end_date);

CREATE INDEX idx_experiment_assignments_experiment ON experiment_assignments(experiment_id);
CREATE INDEX idx_experiment_assignments_user ON experiment_assignments(user_id);
CREATE INDEX idx_experiment_assignments_variant ON experiment_assignments(variant_name);

CREATE INDEX idx_matching_quality_metrics_experiment ON matching_quality_metrics(experiment_id);
CREATE INDEX idx_matching_quality_metrics_variant ON matching_quality_metrics(variant_name);
CREATE INDEX idx_matching_quality_metrics_user ON matching_quality_metrics(user_id);
CREATE INDEX idx_matching_quality_metrics_match ON matching_quality_metrics(match_id);
CREATE INDEX idx_matching_quality_metrics_period ON matching_quality_metrics(period_start, period_end);

-- RLS Policies
ALTER TABLE matching_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_quality_metrics ENABLE ROW LEVEL SECURITY;

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

