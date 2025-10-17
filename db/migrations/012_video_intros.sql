-- Asynchronous Video/Audio Intros System
-- This migration adds tables for managing verified profile videos and audio recordings

-- Table for video/audio intro recordings
CREATE TABLE user_intro_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recording details
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recording_type VARCHAR(20) NOT NULL CHECK (recording_type IN ('video', 'audio')),
    
    -- File information
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    duration_seconds INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Recording metadata
    recording_quality VARCHAR(20) DEFAULT 'standard' CHECK (recording_quality IN ('low', 'standard', 'high', 'ultra_hd')),
    resolution VARCHAR(20), -- e.g., '1920x1080' for video
    frame_rate INTEGER, -- for video recordings
    audio_sample_rate INTEGER, -- for audio recordings
    bitrate INTEGER, -- for both video and audio
    
    -- Content and moderation
    title VARCHAR(200),
    description TEXT,
    language_code VARCHAR(10) DEFAULT 'en',
    
    -- Verification and approval
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50), -- e.g., 'selfie_match', 'document_scan', 'manual_review'
    verification_confidence DECIMAL(3,2), -- 0-1 confidence score
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged', 'under_review')),
    moderation_notes TEXT,
    moderation_score DECIMAL(3,2), -- 0-1 safety score
    flagged_reasons TEXT[], -- Reasons if flagged for review
    
    -- AI Analysis
    ai_transcription TEXT, -- Automated transcription
    ai_transcription_confidence DECIMAL(3,2), -- Confidence in transcription accuracy
    ai_highlights JSONB, -- AI-generated highlights and key moments
    ai_sentiment_analysis JSONB, -- Sentiment analysis results
    ai_content_tags TEXT[], -- AI-generated content tags
    ai_quality_score DECIMAL(3,2), -- Overall AI quality assessment
    
    -- Visibility and sharing
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Featured on profile
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Privacy settings
    visibility_settings JSONB DEFAULT '{}', -- Who can view this recording
    sharing_permissions TEXT[] DEFAULT ARRAY['matches'], -- Who can share this
    
    -- Status and timestamps
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'archived')),
    processing_progress INTEGER DEFAULT 0, -- 0-100 processing percentage
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for AI-generated highlights and key moments
CREATE TABLE intro_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parent recording
    recording_id UUID NOT NULL REFERENCES user_intro_recordings(id) ON DELETE CASCADE,
    
    -- Highlight details
    highlight_type VARCHAR(50) NOT NULL CHECK (highlight_type IN ('key_phrase', 'emotional_moment', 'important_info', 'funny_moment', 'personality_trait', 'interest_mention', 'goal_statement')),
    title VARCHAR(200),
    description TEXT,
    
    -- Timing information
    start_time_seconds DECIMAL(8,3) NOT NULL,
    end_time_seconds DECIMAL(8,3) NOT NULL,
    
    -- Content
    transcript_text TEXT, -- Text for this specific highlight
    confidence_score DECIMAL(3,2), -- AI confidence in this highlight
    
    -- Metadata
    tags TEXT[],
    sentiment_score DECIMAL(3,2), -- -1 to 1 sentiment
    importance_score DECIMAL(3,2), -- 0-1 importance rating
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for recording views and interactions
CREATE TABLE intro_recording_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Interaction details
    recording_id UUID NOT NULL REFERENCES user_intro_recordings(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'like', 'share', 'bookmark', 'report')),
    
    -- Interaction metadata
    view_duration_seconds INTEGER, -- How long they watched
    view_completion_percentage DECIMAL(5,2), -- 0-100% completion
    device_type VARCHAR(50),
    browser VARCHAR(50),
    
    -- Additional data
    notes TEXT, -- For reports or bookmarks
    shared_with UUID[], -- Users this was shared with
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one interaction per user per recording per type
    UNIQUE(recording_id, viewer_id, interaction_type)
);

-- Table for recording playlists and collections
CREATE TABLE intro_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Playlist details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Playlist settings
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    playlist_type VARCHAR(50) DEFAULT 'personal' CHECK (playlist_type IN ('personal', 'curated', 'featured', 'university', 'themed')),
    
    -- Content
    recording_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    total_duration_seconds INTEGER DEFAULT 0,
    total_recordings INTEGER DEFAULT 0,
    
    -- Metadata
    tags TEXT[],
    category VARCHAR(100),
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for recording comments and reviews
CREATE TABLE intro_recording_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Comment details
    recording_id UUID NOT NULL REFERENCES user_intro_recordings(id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES intro_recording_comments(id) ON DELETE CASCADE, -- For replies
    
    -- Content
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'review', 'feedback', 'question')),
    
    -- Rating (for reviews)
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for recording analytics and insights
CREATE TABLE intro_recording_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recording reference
    recording_id UUID NOT NULL REFERENCES user_intro_recordings(id) ON DELETE CASCADE,
    
    -- Analytics period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    granularity VARCHAR(20) DEFAULT 'daily' CHECK (granularity IN ('hourly', 'daily', 'weekly', 'monthly')),
    
    -- View metrics
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    average_view_duration_seconds DECIMAL(8,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0, -- Average completion percentage
    
    -- Engagement metrics
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0, -- (likes + shares + comments) / views
    
    -- Geographic data
    views_by_country JSONB DEFAULT '{}',
    views_by_region JSONB DEFAULT '{}',
    
    -- Device and browser data
    views_by_device JSONB DEFAULT '{}',
    views_by_browser JSONB DEFAULT '{}',
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for recording templates and prompts
CREATE TABLE intro_recording_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('prompt', 'script', 'outline', 'example')),
    
    -- Content
    template_content TEXT NOT NULL,
    suggested_duration_seconds INTEGER,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Categorization
    category VARCHAR(100),
    tags TEXT[],
    language_code VARCHAR(10) DEFAULT 'en',
    
    -- Usage
    university_id UUID REFERENCES universities(id),
    target_audience VARCHAR(100), -- e.g., 'first_year_students', 'graduate_students'
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2), -- Average completion/success rate
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_intro_recordings_user ON user_intro_recordings(user_id);
CREATE INDEX idx_user_intro_recordings_type ON user_intro_recordings(recording_type);
CREATE INDEX idx_user_intro_recordings_status ON user_intro_recordings(status);
CREATE INDEX idx_user_intro_recordings_moderation ON user_intro_recordings(moderation_status);
CREATE INDEX idx_user_intro_recordings_verified ON user_intro_recordings(is_verified);
CREATE INDEX idx_user_intro_recordings_public ON user_intro_recordings(is_public);
CREATE INDEX idx_user_intro_recordings_featured ON user_intro_recordings(is_featured);
CREATE INDEX idx_user_intro_recordings_created_at ON user_intro_recordings(created_at);

CREATE INDEX idx_intro_highlights_recording ON intro_highlights(recording_id);
CREATE INDEX idx_intro_highlights_type ON intro_highlights(highlight_type);
CREATE INDEX idx_intro_highlights_start_time ON intro_highlights(start_time_seconds);

CREATE INDEX idx_intro_recording_interactions_recording ON intro_recording_interactions(recording_id);
CREATE INDEX idx_intro_recording_interactions_viewer ON intro_recording_interactions(viewer_id);
CREATE INDEX idx_intro_recording_interactions_type ON intro_recording_interactions(interaction_type);
CREATE INDEX idx_intro_recording_interactions_created_at ON intro_recording_interactions(created_at);

CREATE INDEX idx_intro_playlists_creator ON intro_playlists(created_by);
CREATE INDEX idx_intro_playlists_public ON intro_playlists(is_public);
CREATE INDEX idx_intro_playlists_type ON intro_playlists(playlist_type);

CREATE INDEX idx_intro_recording_comments_recording ON intro_recording_comments(recording_id);
CREATE INDEX idx_intro_recording_comments_commenter ON intro_recording_comments(commenter_id);
CREATE INDEX idx_intro_recording_comments_parent ON intro_recording_comments(parent_comment_id);

CREATE INDEX idx_intro_recording_analytics_recording ON intro_recording_analytics(recording_id);
CREATE INDEX idx_intro_recording_analytics_period ON intro_recording_analytics(period_start, period_end);

CREATE INDEX idx_intro_recording_templates_type ON intro_recording_templates(template_type);
CREATE INDEX idx_intro_recording_templates_category ON intro_recording_templates(category);
CREATE INDEX idx_intro_recording_templates_university ON intro_recording_templates(university_id);

-- RLS Policies
ALTER TABLE user_intro_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_recording_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_recording_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_recording_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_recording_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own recordings
CREATE POLICY "Users can view their own recordings" ON user_intro_recordings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view public recordings
CREATE POLICY "Users can view public recordings" ON user_intro_recordings
    FOR SELECT USING (is_public = true AND status = 'ready');

-- Users can create their own recordings
CREATE POLICY "Users can create their own recordings" ON user_intro_recordings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own recordings (if not approved yet)
CREATE POLICY "Users can update their own recordings" ON user_intro_recordings
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        moderation_status IN ('pending', 'rejected')
    );

-- Users can delete their own recordings
CREATE POLICY "Users can delete their own recordings" ON user_intro_recordings
    FOR DELETE USING (auth.uid() = user_id);

-- Users can view highlights for recordings they can access
CREATE POLICY "Users can view highlights" ON intro_highlights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_intro_recordings 
            WHERE user_intro_recordings.id = intro_highlights.recording_id
            AND (user_intro_recordings.user_id = auth.uid() OR user_intro_recordings.is_public = true)
        )
    );

-- Users can create interactions for recordings they can view
CREATE POLICY "Users can create interactions" ON intro_recording_interactions
    FOR INSERT WITH CHECK (
        auth.uid() = viewer_id AND
        EXISTS (
            SELECT 1 FROM user_intro_recordings 
            WHERE user_intro_recordings.id = intro_recording_interactions.recording_id
            AND (user_intro_recordings.is_public = true OR user_intro_recordings.user_id = auth.uid())
        )
    );

-- Users can view their own interactions
CREATE POLICY "Users can view their own interactions" ON intro_recording_interactions
    FOR SELECT USING (auth.uid() = viewer_id);

-- Users can manage their own playlists
CREATE POLICY "Users can manage their own playlists" ON intro_playlists
    FOR ALL USING (auth.uid() = created_by);

-- Users can view public playlists
CREATE POLICY "Users can view public playlists" ON intro_playlists
    FOR SELECT USING (is_public = true);

-- Users can comment on recordings they can view
CREATE POLICY "Users can comment on recordings" ON intro_recording_comments
    FOR INSERT WITH CHECK (
        auth.uid() = commenter_id AND
        EXISTS (
            SELECT 1 FROM user_intro_recordings 
            WHERE user_intro_recordings.id = intro_recording_comments.recording_id
            AND (user_intro_recordings.is_public = true OR user_intro_recordings.user_id = auth.uid())
        )
    );

-- Users can view comments on recordings they can view
CREATE POLICY "Users can view comments" ON intro_recording_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_intro_recordings 
            WHERE user_intro_recordings.id = intro_recording_comments.recording_id
            AND (user_intro_recordings.is_public = true OR user_intro_recordings.user_id = auth.uid())
        )
    );

-- Users can view their own comments
CREATE POLICY "Users can update their own comments" ON intro_recording_comments
    FOR UPDATE USING (auth.uid() = commenter_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON intro_recording_comments
    FOR DELETE USING (auth.uid() = commenter_id);

-- Users can view templates
CREATE POLICY "Users can view templates" ON intro_recording_templates
    FOR SELECT USING (is_active = true);

-- Admin access for all recording data
CREATE POLICY "Admins can manage all recordings" ON user_intro_recordings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'content_admin')
        )
    );

CREATE POLICY "Admins can manage highlights" ON intro_highlights
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'content_admin')
        )
    );

CREATE POLICY "Admins can manage interactions" ON intro_recording_interactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'content_admin')
        )
    );

CREATE POLICY "Admins can manage playlists" ON intro_playlists
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'content_admin')
        )
    );

CREATE POLICY "Admins can manage comments" ON intro_recording_comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'content_admin')
        )
    );

CREATE POLICY "Admins can manage analytics" ON intro_recording_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'analytics_admin')
        )
    );

CREATE POLICY "Admins can manage templates" ON intro_recording_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.role IN ('super_admin', 'university_admin', 'content_admin')
        )
    );

-- Functions for video intro management
CREATE OR REPLACE FUNCTION create_intro_recording(
    p_user_id UUID,
    p_recording_type VARCHAR(20),
    p_file_url VARCHAR(500),
    p_duration_seconds INTEGER,
    p_mime_type VARCHAR(100),
    p_title VARCHAR(200) DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_recording_id UUID;
BEGIN
    INSERT INTO user_intro_recordings (
        user_id, recording_type, file_url, duration_seconds, mime_type,
        title, description, status
    ) VALUES (
        p_user_id, p_recording_type, p_file_url, p_duration_seconds, p_mime_type,
        p_title, p_description, 'processing'
    ) RETURNING id INTO v_recording_id;
    
    RETURN v_recording_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_intro_recording(
    p_recording_id UUID,
    p_approved_by UUID,
    p_moderation_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_intro_recordings 
    SET 
        moderation_status = 'approved',
        approved_by = p_approved_by,
        approved_at = NOW(),
        moderation_notes = p_moderation_notes,
        status = 'ready'
    WHERE id = p_recording_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION record_intro_interaction(
    p_recording_id UUID,
    p_viewer_id UUID,
    p_interaction_type VARCHAR(20),
    p_view_duration_seconds INTEGER DEFAULT NULL,
    p_view_completion_percentage DECIMAL(5,2) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO intro_recording_interactions (
        recording_id, viewer_id, interaction_type,
        view_duration_seconds, view_completion_percentage
    ) VALUES (
        p_recording_id, p_viewer_id, p_interaction_type,
        p_view_duration_seconds, p_view_completion_percentage
    )
    ON CONFLICT (recording_id, viewer_id, interaction_type) 
    DO UPDATE SET
        view_duration_seconds = EXCLUDED.view_duration_seconds,
        view_completion_percentage = EXCLUDED.view_completion_percentage,
        created_at = NOW();
    
    -- Update recording statistics
    IF p_interaction_type = 'view' THEN
        UPDATE user_intro_recordings 
        SET view_count = view_count + 1
        WHERE id = p_recording_id;
    ELSIF p_interaction_type = 'like' THEN
        UPDATE user_intro_recordings 
        SET like_count = like_count + 1
        WHERE id = p_recording_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_intro_stats(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    total_recordings BIGINT,
    public_recordings BIGINT,
    verified_recordings BIGINT,
    total_views BIGINT,
    total_likes BIGINT,
    average_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_user_id,
        COUNT(uir.id) as total_recordings,
        COUNT(uir.id) FILTER (WHERE uir.is_public = true) as public_recordings,
        COUNT(uir.id) FILTER (WHERE uir.is_verified = true) as verified_recordings,
        COALESCE(SUM(uir.view_count), 0) as total_views,
        COALESCE(SUM(uir.like_count), 0) as total_likes,
        AVG(irc.rating) as average_rating
    FROM (SELECT p_user_id as user_id) u
    LEFT JOIN user_intro_recordings uir ON u.user_id = uir.user_id
    LEFT JOIN intro_recording_comments irc ON uir.id = irc.recording_id AND irc.rating IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_user_intro_recordings_updated_at
    BEFORE UPDATE ON user_intro_recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intro_playlists_updated_at
    BEFORE UPDATE ON intro_playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intro_recording_comments_updated_at
    BEFORE UPDATE ON intro_recording_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intro_recording_templates_updated_at
    BEFORE UPDATE ON intro_recording_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
