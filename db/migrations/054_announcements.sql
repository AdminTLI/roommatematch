-- In-Product Announcements System
-- This migration adds tables for in-product announcements

-- Table for announcements
CREATE TABLE announcements (
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
CREATE TABLE announcement_views (
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
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_university ON announcements(university_id);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_priority ON announcements(priority DESC);

CREATE INDEX idx_announcement_views_announcement ON announcement_views(announcement_id);
CREATE INDEX idx_announcement_views_user ON announcement_views(user_id);
CREATE INDEX idx_announcement_views_dismissed ON announcement_views(dismissed);

-- RLS Policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

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

