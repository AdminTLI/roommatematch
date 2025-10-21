-- Verification Script for Supabase Database Setup
-- This script checks that all tables, indexes, policies, and functions were created successfully

-- ============================================
-- 1. CHECK EXTENSIONS
-- ============================================

SELECT 'Extensions Check' as check_type, 
       extname as extension_name, 
       extversion as version
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'vector')
ORDER BY extname;

-- ============================================
-- 2. CHECK CUSTOM TYPES
-- ============================================

SELECT 'Custom Types Check' as check_type,
       typname as type_name,
       typtype as type_category
FROM pg_type 
WHERE typname IN ('verification_status', 'degree_level', 'match_status', 'report_status', 'admin_role', 'post_status')
ORDER BY typname;

-- ============================================
-- 3. CHECK CORE TABLES
-- ============================================

SELECT 'Core Tables Check' as check_type,
       schemaname,
       tablename,
       tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'universities', 'users', 'admins', 'profiles', 'programs', 'user_academic',
    'question_items', 'responses', 'user_vectors', 'matches', 'group_suggestions',
    'chats', 'chat_members', 'messages', 'message_reads', 'reports', 'announcements',
    'eligibility_rules', 'forum_posts', 'forum_comments', 'app_events'
  )
ORDER BY tablename;

-- ============================================
-- 4. CHECK HOUSING TABLES
-- ============================================

SELECT 'Housing Tables Check' as check_type,
       schemaname,
       tablename,
       tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'housing_listings', 'tour_bookings', 'user_housing_preferences', 'housing_applications'
  )
ORDER BY tablename;

-- ============================================
-- 5. CHECK REPUTATION TABLES
-- ============================================

SELECT 'Reputation Tables Check' as check_type,
       schemaname,
       tablename,
       tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'endorsements', 'user_references', 'trust_badges', 'reputation_scores'
  )
ORDER BY tablename;

-- ============================================
-- 6. CHECK MOVE-IN PLANNER TABLES
-- ============================================

SELECT 'Move-in Planner Tables Check' as check_type,
       schemaname,
       tablename,
       tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'move_in_plans', 'move_in_plan_participants', 'move_in_tasks', 'move_in_expenses'
  )
ORDER BY tablename;

-- ============================================
-- 7. CHECK VIDEO INTRO TABLES
-- ============================================

SELECT 'Video Intro Tables Check' as check_type,
       schemaname,
       tablename,
       tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_intro_recordings'
  )
ORDER BY tablename;

-- ============================================
-- 8. CHECK INDEXES
-- ============================================

SELECT 'Indexes Check' as check_type,
       schemaname,
       tablename,
       indexname,
       indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- 9. CHECK VECTOR INDEX
-- ============================================

SELECT 'Vector Index Check' as check_type,
       schemaname,
       tablename,
       indexname,
       indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname = 'idx_user_vectors_vector_hnsw';

-- ============================================
-- 10. CHECK RLS POLICIES
-- ============================================

SELECT 'RLS Policies Check' as check_type,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 11. CHECK RLS ENABLED TABLES
-- ============================================

SELECT 'RLS Enabled Tables Check' as check_type,
       schemaname,
       tablename,
       rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'universities', 'users', 'admins', 'profiles', 'programs', 'user_academic',
    'question_items', 'responses', 'user_vectors', 'matches', 'group_suggestions',
    'chats', 'chat_members', 'messages', 'message_reads', 'reports', 'announcements',
    'eligibility_rules', 'forum_posts', 'forum_comments', 'app_events',
    'housing_listings', 'tour_bookings', 'user_housing_preferences', 'housing_applications',
    'endorsements', 'user_references', 'trust_badges', 'reputation_scores',
    'move_in_plans', 'move_in_plan_participants', 'move_in_tasks', 'move_in_expenses',
    'user_intro_recordings'
  )
  AND rowsecurity = true
ORDER BY tablename;

-- ============================================
-- 12. CHECK FUNCTIONS
-- ============================================

SELECT 'Functions Check' as check_type,
       n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_result(p.oid) as return_type,
       pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('update_updated_at_column', 'compute_compatibility_score')
ORDER BY p.proname;

-- ============================================
-- 13. CHECK TRIGGERS
-- ============================================

SELECT 'Triggers Check' as check_type,
       n.nspname as schemaname,
       c.relname as tablename,
       t.tgname as triggername,
       t.tgtype
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND t.tgname LIKE '%updated_at%'
ORDER BY c.relname, t.tgname;

-- ============================================
-- 14. CHECK VIEWS
-- ============================================

SELECT 'Views Check' as check_type,
       schemaname,
       viewname,
       definition
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname = 'user_study_year_v';

-- ============================================
-- 15. CHECK STORAGE BUCKETS
-- ============================================

SELECT 'Storage Buckets Check' as check_type,
       id,
       name,
       public,
       file_size_limit,
       allowed_mime_types
FROM storage.buckets 
WHERE id = 'verification-documents';

-- ============================================
-- 16. CHECK SEED DATA
-- ============================================

-- Check universities
SELECT 'Universities Seed Data Check' as check_type,
       COUNT(*) as university_count
FROM universities;

-- Check programs
SELECT 'Programs Seed Data Check' as check_type,
       COUNT(*) as program_count
FROM programs;

-- Check question items
SELECT 'Question Items Seed Data Check' as check_type,
       COUNT(*) as question_count,
       COUNT(DISTINCT section) as sections_count
FROM question_items;

-- Check housing listings
SELECT 'Housing Listings Seed Data Check' as check_type,
       COUNT(*) as listing_count
FROM housing_listings;

-- ============================================
-- 17. SUMMARY REPORT
-- ============================================

WITH summary AS (
  SELECT 
    'Total Tables' as metric,
    COUNT(*)::text as value
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
  
  UNION ALL
  
  SELECT 
    'Tables with RLS Enabled' as metric,
    COUNT(*)::text as value
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND rowsecurity = true
  
  UNION ALL
  
  SELECT 
    'Total Indexes' as metric,
    COUNT(*)::text as value
  FROM pg_indexes 
  WHERE schemaname = 'public'
  
  UNION ALL
  
  SELECT 
    'Total Policies' as metric,
    COUNT(*)::text as value
  FROM pg_policies 
  WHERE schemaname = 'public'
  
  UNION ALL
  
  SELECT 
    'Total Functions' as metric,
    COUNT(*)::text as value
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  
  UNION ALL
  
  SELECT 
    'Vector Extension' as metric,
    CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') 
         THEN 'Installed' 
         ELSE 'Missing' 
    END as value
  
  UNION ALL
  
  SELECT 
    'UUID Extension' as metric,
    CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
         THEN 'Installed' 
         ELSE 'Missing' 
    END as value
)
SELECT 
  metric,
  value
FROM summary
ORDER BY 
  CASE metric
    WHEN 'Vector Extension' THEN 1
    WHEN 'UUID Extension' THEN 2
    WHEN 'Total Tables' THEN 3
    WHEN 'Tables with RLS Enabled' THEN 4
    WHEN 'Total Indexes' THEN 5
    WHEN 'Total Policies' THEN 6
    WHEN 'Total Functions' THEN 7
    ELSE 8
  END;

-- ============================================
-- 18. DEMO USER CHECK (if exists)
-- ============================================

-- Check if demo user exists in auth.users
SELECT 'Demo User Check' as check_type,
       id,
       email,
       email_confirmed_at,
       created_at
FROM auth.users 
WHERE email = 'demo@account.com';

-- Check if demo user has profile
SELECT 'Demo User Profile Check' as check_type,
       p.id,
       p.first_name,
       p.university_id,
       u.name as university_name,
       p.verification_status
FROM profiles p
JOIN universities u ON p.university_id = u.id
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'demo@account.com';

-- Check demo user questionnaire responses
SELECT 'Demo User Responses Check' as check_type,
       COUNT(*) as response_count,
       COUNT(DISTINCT qi.section) as sections_completed
FROM responses r
JOIN auth.users au ON r.user_id = au.id
JOIN question_items qi ON r.question_key = qi.key
WHERE au.email = 'demo@account.com';
