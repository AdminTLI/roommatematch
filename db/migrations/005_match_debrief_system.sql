-- Match Debrief & Conversation Nudges System
-- This migration adds tables for storing compatibility stories, conversation nudges, and engagement analytics

-- Table for storing match debriefs (compatibility stories)
CREATE TABLE match_debriefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL, -- References to the match between two users
    user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(3,2) NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
    compatibility_story JSONB NOT NULL, -- The generated compatibility story with charts
    first_questions JSONB NOT NULL, -- Suggested first questions for conversation
    shared_interests TEXT[] DEFAULT '{}',
    potential_conflicts TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(match_id, user_a_id, user_b_id)
);

-- Table for conversation nudges and tracking
CREATE TABLE conversation_nudges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debrief_id UUID NOT NULL REFERENCES match_debriefs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nudge_type VARCHAR(50) NOT NULL CHECK (nudge_type IN ('first_meeting', 'weekly_checkin', 'conflict_resolution', 'move_planning', 'agreement_setup')),
    message TEXT NOT NULL,
    action_suggested TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking engagement analytics
CREATE TABLE match_engagement_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debrief_id UUID NOT NULL REFERENCES match_debriefs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('debrief_viewed', 'questions_used', 'nudge_clicked', 'nudge_dismissed', 'chat_started', 'conflict_reported', 'agreement_signed')),
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for relational health tracking
CREATE TABLE relational_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debrief_id UUID NOT NULL REFERENCES match_debriefs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
    communication_quality INTEGER CHECK (communication_quality >= 1 AND communication_quality <= 5),
    conflict_level INTEGER CHECK (conflict_level >= 1 AND conflict_level <= 5),
    shared_activities INTEGER CHECK (shared_activities >= 1 AND shared_activities <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(debrief_id, user_id, week_number)
);

-- Indexes for performance
CREATE INDEX idx_match_debriefs_users ON match_debriefs(user_a_id, user_b_id);
CREATE INDEX idx_match_debriefs_match_id ON match_debriefs(match_id);
CREATE INDEX idx_conversation_nudges_debrief ON conversation_nudges(debrief_id);
CREATE INDEX idx_conversation_nudges_scheduled ON conversation_nudges(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX idx_engagement_analytics_debrief ON match_engagement_analytics(debrief_id);
CREATE INDEX idx_engagement_analytics_user ON match_engagement_analytics(user_id);
CREATE INDEX idx_relational_health_debrief ON relational_health_scores(debrief_id);

-- RLS Policies
ALTER TABLE match_debriefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE relational_health_scores ENABLE ROW LEVEL SECURITY;

-- Users can only see their own debriefs
CREATE POLICY "Users can view their own match debriefs" ON match_debriefs
    FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Users can only see their own nudges
CREATE POLICY "Users can view their own conversation nudges" ON conversation_nudges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation nudges" ON conversation_nudges
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own engagement analytics
CREATE POLICY "Users can view their own engagement analytics" ON match_engagement_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own engagement analytics" ON match_engagement_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own relational health scores
CREATE POLICY "Users can view their own relational health" ON relational_health_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own relational health" ON relational_health_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relational health" ON relational_health_scores
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin access for monitoring
CREATE POLICY "Admins can view all match debriefs" ON match_debriefs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

CREATE POLICY "Admins can view all engagement analytics" ON match_engagement_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin')
        )
    );

-- Functions for auto-generating debriefs
CREATE OR REPLACE FUNCTION generate_match_debrief(
    p_match_id UUID,
    p_user_a_id UUID,
    p_user_b_id UUID,
    p_compatibility_score DECIMAL,
    p_explanation JSONB
) RETURNS UUID AS $$
DECLARE
    debrief_id UUID;
    compatibility_story JSONB;
    first_questions JSONB;
    shared_interests TEXT[];
    potential_conflicts TEXT[];
BEGIN
    -- Generate compatibility story based on explanation
    compatibility_story := jsonb_build_object(
        'overall_score', p_compatibility_score,
        'breakdown', p_explanation,
        'top_strength', p_explanation->>'top_alignment',
        'watch_outs', p_explanation->>'watch_out',
        'house_rules', p_explanation->>'house_rules_suggestion',
        'generated_at', NOW()
    );
    
    -- Generate first questions based on compatibility
    first_questions := jsonb_build_object(
        'ice_breakers', ARRAY[
            'What are you most excited about for this semester?',
            'Do you have any favorite study spots on campus?',
            'What kind of music do you like to listen to while studying?'
        ],
        'logistics', ARRAY[
            'What time do you usually wake up and go to bed?',
            'How do you prefer to handle cleaning and chores?',
            'Are you comfortable with having guests over?'
        ],
        'preferences', ARRAY[
            'What temperature do you prefer in the room?',
            'How do you like to handle noise levels?',
            'What are your thoughts on shared expenses?'
        ]
    );
    
    -- Extract shared interests and potential conflicts from explanation
    shared_interests := ARRAY[]::TEXT[];
    potential_conflicts := ARRAY[]::TEXT[];
    
    -- Insert the debrief
    INSERT INTO match_debriefs (
        match_id, user_a_id, user_b_id, compatibility_score,
        compatibility_story, first_questions, shared_interests, potential_conflicts
    ) VALUES (
        p_match_id, p_user_a_id, p_user_b_id, p_compatibility_score,
        compatibility_story, first_questions, shared_interests, potential_conflicts
    ) RETURNING id INTO debrief_id;
    
    -- Schedule initial conversation nudges
    INSERT INTO conversation_nudges (debrief_id, user_id, nudge_type, message, action_suggested, scheduled_for)
    VALUES 
        (debrief_id, p_user_a_id, 'first_meeting', 
         'You have a new match! Check out your compatibility story and suggested first questions to start a great conversation.',
         'View Compatibility Story', NOW() + INTERVAL '1 hour'),
        (debrief_id, p_user_b_id, 'first_meeting', 
         'You have a new match! Check out your compatibility story and suggested first questions to start a great conversation.',
         'View Compatibility Story', NOW() + INTERVAL '1 hour'),
        (debrief_id, p_user_a_id, 'weekly_checkin', 
         'How is your roommate match going? Take a quick moment to share how things are progressing.',
         'Update Relational Health', NOW() + INTERVAL '7 days'),
        (debrief_id, p_user_b_id, 'weekly_checkin', 
         'How is your roommate match going? Take a quick moment to share how things are progressing.',
         'Update Relational Health', NOW() + INTERVAL '7 days');
    
    RETURN debrief_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation nudge insights
CREATE OR REPLACE FUNCTION get_nudge_insights(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    nudge_type VARCHAR,
    total_sent BIGINT,
    total_clicked BIGINT,
    click_rate DECIMAL,
    total_dismissed BIGINT,
    dismiss_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cn.nudge_type,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN cn.clicked_at IS NOT NULL THEN 1 END) as total_clicked,
        ROUND(
            COUNT(CASE WHEN cn.clicked_at IS NOT NULL THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 2
        ) as click_rate,
        COUNT(CASE WHEN cn.dismissed_at IS NOT NULL THEN 1 END) as total_dismissed,
        ROUND(
            COUNT(CASE WHEN cn.dismissed_at IS NOT NULL THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 2
        ) as dismiss_rate
    FROM conversation_nudges cn
    WHERE cn.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY cn.nudge_type
    ORDER BY total_sent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track engagement events
CREATE OR REPLACE FUNCTION track_match_engagement(
    p_debrief_id UUID,
    p_user_id UUID,
    p_event_type VARCHAR,
    p_event_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    engagement_id UUID;
BEGIN
    INSERT INTO match_engagement_analytics (debrief_id, user_id, event_type, event_data)
    VALUES (p_debrief_id, p_user_id, p_event_type, p_event_data)
    RETURNING id INTO engagement_id;
    
    RETURN engagement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_debriefs_updated_at
    BEFORE UPDATE ON match_debriefs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relational_health_updated_at
    BEFORE UPDATE ON relational_health_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
