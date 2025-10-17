-- Missing tables for real data integration
-- These tables are referenced in the RPC functions and components

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    type text NOT NULL CHECK (type IN ('individual', 'group')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Chat room participants
CREATE TABLE IF NOT EXISTS chat_room_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now(),
    last_read_at timestamptz DEFAULT now(),
    UNIQUE(room_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    read_by text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Match decisions
CREATE TABLE IF NOT EXISTS match_decisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    decision text NOT NULL CHECK (decision IN ('accepted', 'rejected')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, matched_user_id)
);

-- Groups for group matching
CREATE TABLE IF NOT EXISTS groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- User vectors for matching
CREATE TABLE IF NOT EXISTS user_vectors (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    vector numeric[] NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reporter_name text NOT NULL,
    reported_user_name text NOT NULL,
    reason text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz,
    resolved_by uuid REFERENCES auth.users(id)
);

-- Verifications table
CREATE TABLE IF NOT EXISTS verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_document_path text NOT NULL,
    selfie_path text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    reviewed_at timestamptz,
    reviewed_by uuid REFERENCES auth.users(id)
);

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    author_name text NOT NULL,
    is_anonymous boolean DEFAULT false,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Forum likes
CREATE TABLE IF NOT EXISTS forum_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'admin',
    permissions text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, university_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_match_decisions_user_id ON match_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_decisions_matched_user_id ON match_decisions(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post_id ON forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_university_id ON admins(university_id);

-- RLS Policies
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies
CREATE POLICY "chat_rooms_participants_read" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_participants 
            WHERE room_id = id AND user_id = auth.uid()
        )
    );

-- Chat room participants policies
CREATE POLICY "chat_room_participants_own" ON chat_room_participants
    FOR ALL USING (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "chat_messages_participants_read" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_participants 
            WHERE room_id = room_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "chat_messages_participants_insert" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chat_room_participants 
            WHERE room_id = room_id AND user_id = auth.uid()
        )
    );

-- Match decisions policies
CREATE POLICY "match_decisions_own" ON match_decisions
    FOR ALL USING (user_id = auth.uid());

-- Groups policies
CREATE POLICY "groups_members_read" ON groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = id AND user_id = auth.uid()
        )
    );

-- Group members policies
CREATE POLICY "group_members_own" ON group_members
    FOR ALL USING (user_id = auth.uid());

-- User vectors policies
CREATE POLICY "user_vectors_own" ON user_vectors
    FOR ALL USING (user_id = auth.uid());

-- Reports policies
CREATE POLICY "reports_own" ON reports
    FOR ALL USING (reporter_id = auth.uid());

CREATE POLICY "reports_admin_read" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- Verifications policies
CREATE POLICY "verifications_own" ON verifications
    FOR ALL USING (user_id = auth.uid());

-- Forum posts policies
CREATE POLICY "forum_posts_read_approved" ON forum_posts
    FOR SELECT USING (status = 'approved');

CREATE POLICY "forum_posts_own" ON forum_posts
    FOR ALL USING (user_id = auth.uid());

-- Forum likes policies
CREATE POLICY "forum_likes_own" ON forum_likes
    FOR ALL USING (user_id = auth.uid());

-- Admins policies
CREATE POLICY "admins_own" ON admins
    FOR ALL USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT ON chat_rooms TO authenticated;
GRANT SELECT ON chat_room_participants TO authenticated;
GRANT SELECT ON chat_messages TO authenticated;
GRANT INSERT ON chat_messages TO authenticated;
GRANT SELECT ON match_decisions TO authenticated;
GRANT INSERT ON match_decisions TO authenticated;
GRANT SELECT ON groups TO authenticated;
GRANT SELECT ON group_members TO authenticated;
GRANT SELECT ON user_vectors TO authenticated;
GRANT INSERT ON user_vectors TO authenticated;
GRANT UPDATE ON user_vectors TO authenticated;
GRANT SELECT ON reports TO authenticated;
GRANT INSERT ON reports TO authenticated;
GRANT SELECT ON verifications TO authenticated;
GRANT INSERT ON verifications TO authenticated;
GRANT SELECT ON forum_posts TO authenticated;
GRANT INSERT ON forum_posts TO authenticated;
GRANT SELECT ON forum_likes TO authenticated;
GRANT INSERT ON forum_likes TO authenticated;
GRANT DELETE ON forum_likes TO authenticated;
GRANT SELECT ON admins TO authenticated;
