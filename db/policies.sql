-- Row Level Security (RLS) Policies for Domu Match
-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Universities: Read by anyone, write by admins only
CREATE POLICY "Universities are readable by everyone" ON universities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Universities are writable by admins only" ON universities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.university_id = universities.id
    )
  );

-- Users: Users can read their own data, admins can read users in their university
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can read users in their university" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN admins a ON a.university_id = p.university_id
      WHERE p.user_id = users.id 
      AND a.user_id = auth.uid()
    )
  );

-- Admins: Only admins can read admin data
CREATE POLICY "Admins can read admin data" ON admins
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admins a2
      WHERE a2.user_id = auth.uid()
      AND a2.university_id = admins.university_id
      AND a2.role IN ('super_admin', 'university_admin')
    )
  );

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.role = 'super_admin'
    )
  );

-- Profiles: Users can read their own, minimal public data by university members, full data only with accepted matches
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Minimal public profile data (for match cards) - visible to university members
CREATE POLICY "Minimal public profiles visible to university members" ON profiles
  FOR SELECT USING (
    minimal_public = true AND
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.user_id = auth.uid()
      AND p2.university_id = profiles.university_id
    )
  );

-- Full profile data - only visible with accepted matches or in same group
CREATE POLICY "Full profiles visible with accepted matches" ON profiles
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM matches m
      WHERE (
        (m.a_user = auth.uid() AND m.b_user = profiles.user_id) OR
        (m.b_user = auth.uid() AND m.a_user = profiles.user_id)
      )
      AND m.status = 'accepted'
    ) OR
    EXISTS (
      SELECT 1 FROM group_suggestions gs
      JOIN profiles p2 ON p2.user_id = auth.uid()
      WHERE gs.university_id = p2.university_id
      AND profiles.user_id = ANY(gs.member_ids)
      AND auth.uid() = ANY(gs.member_ids)
      AND gs.status = 'accepted'
    )
  );

-- Admins can read profiles in their university
CREATE POLICY "Admins can read profiles in their university" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.university_id = profiles.university_id
    )
  );

-- Question items: Read by everyone, write by admins
CREATE POLICY "Question items are readable by everyone" ON question_items
  FOR SELECT USING (true);

CREATE POLICY "Question items are writable by admins only" ON question_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Responses: Users can manage their own, admins can read aggregated data
CREATE POLICY "Users can manage their own responses" ON responses
  FOR ALL USING (user_id = auth.uid());

-- Create a security definer view for admin analytics
CREATE OR REPLACE VIEW admin_analytics_responses AS
SELECT 
  question_key,
  value,
  COUNT(*) as response_count,
  university_id
FROM responses r
JOIN profiles p ON p.user_id = r.user_id
GROUP BY question_key, value, university_id;

-- Grant access to analytics view for admins
CREATE POLICY "Admins can read analytics responses" ON responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN profiles p ON p.university_id = a.university_id
      WHERE a.user_id = auth.uid()
      AND p.user_id = responses.user_id
    )
  );

-- User vectors: Users can manage their own, admins can read for matching
CREATE POLICY "Users can manage their own vectors" ON user_vectors
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "System can read vectors for matching" ON user_vectors
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.university_id = (
        SELECT university_id FROM profiles p2 
        WHERE p2.user_id = user_vectors.user_id
      )
    )
  );

-- Matches: Users can read matches they're involved in, admins can read anonymized
CREATE POLICY "Users can read their matches" ON matches
  FOR SELECT USING (
    a_user = auth.uid() OR b_user = auth.uid()
  );

CREATE POLICY "Users can update their matches" ON matches
  FOR UPDATE USING (
    a_user = auth.uid() OR b_user = auth.uid()
  );

CREATE POLICY "Admins can read anonymized matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN admins a ON a.university_id = p.university_id
      WHERE (p.user_id = matches.a_user OR p.user_id = matches.b_user)
      AND a.user_id = auth.uid()
    )
  );

-- Group suggestions: Members can read their groups, admins can read all
CREATE POLICY "Group members can read their suggestions" ON group_suggestions
  FOR SELECT USING (
    auth.uid() = ANY(member_ids)
  );

CREATE POLICY "Group members can update their suggestions" ON group_suggestions
  FOR UPDATE USING (
    auth.uid() = ANY(member_ids)
  );

CREATE POLICY "Admins can read group suggestions" ON group_suggestions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.university_id = group_suggestions.university_id
    )
  );

-- Chats: Members can read/write
CREATE POLICY "Chat members can read chats" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chats.id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Chat members can update chats" ON chats
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chats.id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Chat members: Members can manage membership
CREATE POLICY "Chat members can manage membership" ON chat_members
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chats c
      WHERE c.id = chat_members.chat_id
      AND c.created_by = auth.uid()
    )
  );

-- Messages: Chat members can read/write
CREATE POLICY "Chat members can read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = messages.chat_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Chat members can send messages" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = messages.chat_id
      AND cm.user_id = auth.uid()
    )
  );

-- Message reads: Users can manage their own read receipts
CREATE POLICY "Users can manage their read receipts" ON message_reads
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Chat members can read read receipts" ON message_reads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reads.message_id
      AND cm.user_id = auth.uid()
    )
  );

-- Reports: Users can create reports, admins can manage them
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can read their own reports" ON reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Admins can manage reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN profiles p ON p.university_id = a.university_id
      WHERE a.user_id = auth.uid()
      AND (
        p.user_id = reports.reporter_id OR
        p.user_id = reports.target_user_id OR
        reports.target_user_id IS NULL
      )
    )
  );

-- Announcements: Read by university members, write by admins
CREATE POLICY "University members can read announcements" ON announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.university_id = announcements.university_id
    )
  );

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.university_id = announcements.university_id
    )
  );

-- Eligibility rules: Read by university members, write by admins
CREATE POLICY "University members can read eligibility rules" ON eligibility_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.university_id = eligibility_rules.university_id
    )
  );

CREATE POLICY "Admins can manage eligibility rules" ON eligibility_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.university_id = eligibility_rules.university_id
    )
  );

-- Forum posts: University-scoped read/write
CREATE POLICY "University members can read forum posts" ON forum_posts
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.university_id = forum_posts.university_id
    )
  );

CREATE POLICY "Verified users can create forum posts" ON forum_posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.university_id = forum_posts.university_id
      AND p.verification_status = 'verified'
    )
  );

CREATE POLICY "Authors can update their forum posts" ON forum_posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Admins can manage forum posts" ON forum_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.user_id = auth.uid()
      AND a.university_id = forum_posts.university_id
    )
  );

-- Forum comments: Similar to posts
CREATE POLICY "University members can read forum comments" ON forum_comments
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM forum_posts fp
      JOIN profiles p ON p.university_id = fp.university_id
      WHERE fp.id = forum_comments.post_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Verified users can create forum comments" ON forum_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM forum_posts fp
      JOIN profiles p ON p.university_id = fp.university_id
      WHERE fp.id = forum_comments.post_id
      AND p.user_id = auth.uid()
      AND p.verification_status = 'verified'
    )
  );

CREATE POLICY "Authors can update their forum comments" ON forum_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Admins can manage forum comments" ON forum_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM forum_posts fp
      JOIN admins a ON a.university_id = fp.university_id
      WHERE fp.id = forum_comments.post_id
      AND a.user_id = auth.uid()
    )
  );

-- App events: Users can create their own, admins can read all
CREATE POLICY "Users can create their own events" ON app_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all events" ON app_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Verifications: Users can read their own, admins can read all in their university
CREATE POLICY "Users can read own verifications" ON verifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage verifications" ON verifications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admins can read verifications in university" ON verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN admins a ON a.university_id = p.university_id
      WHERE p.user_id = verifications.user_id
      AND a.user_id = auth.uid()
    )
  );

-- Verification webhooks: Service role only
CREATE POLICY "Service role can manage webhooks" ON verification_webhooks
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admins can read webhooks" ON verification_webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admin actions: Admins can read all
CREATE POLICY "Admins can read admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert admin actions" ON admin_actions
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');
