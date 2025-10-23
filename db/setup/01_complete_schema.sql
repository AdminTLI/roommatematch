-- Complete Supabase Database Schema for Roommate Match
-- This file contains all tables, indexes, triggers, functions, and policies in the correct order

-- ============================================
-- 1. EXTENSIONS
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- 2. CUSTOM TYPES
-- ============================================

-- Create custom types
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'failed');
CREATE TYPE degree_level AS ENUM ('bachelor', 'master', 'phd', 'exchange', 'other');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_status AS ENUM ('open', 'actioned', 'dismissed');
CREATE TYPE admin_role AS ENUM ('super_admin', 'university_admin', 'moderator');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'hidden', 'deleted');

-- ============================================
-- 3. CORE TABLES
-- ============================================

-- Universities table
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  branding JSONB DEFAULT '{}',
  eligibility_domains TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- University admins
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'university_admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, university_id)
);

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  degree_level degree_level NOT NULL,
  program VARCHAR(255),
  campus VARCHAR(100),
  languages TEXT[] DEFAULT '{}',
  minimal_public BOOLEAN DEFAULT true,
  verification_status verification_status DEFAULT 'unverified',
  last_answers_changed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Programs table for WO programmes from Studiekeuzedatabase
CREATE TABLE programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    croho_code text UNIQUE,
    name text NOT NULL,
    name_en text,
    degree_level text NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'premaster')),
    language_codes text[] DEFAULT '{}',
    faculty text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- User academic table for academic information
CREATE TABLE user_academic (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id uuid NOT NULL REFERENCES universities(id),
    degree_level text NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'premaster')),
    program_id uuid REFERENCES programs(id),
    undecided_program boolean DEFAULT false,
    study_start_year int NOT NULL CHECK (study_start_year >= 2015 AND study_start_year <= EXTRACT(YEAR FROM now()) + 1),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_academic_program_or_undecided 
        CHECK ((program_id IS NOT NULL AND undecided_program = false) OR 
               (program_id IS NULL AND undecided_program = true))
);

-- ============================================
-- 4. QUESTIONNAIRE SYSTEM
-- ============================================

-- Questionnaire items
CREATE TABLE question_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  section VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'single', 'multiple', 'slider', 'text', 'boolean'
  options JSONB,
  weight DECIMAL(3,2) DEFAULT 1.0,
  is_hard BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User responses to questionnaire
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_key VARCHAR(100) NOT NULL REFERENCES question_items(key) ON DELETE CASCADE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_key)
);

-- User vectors for matching (pgvector)
CREATE TABLE user_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vector vector(50), -- Normalized questionnaire responses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 5. MATCHING SYSTEM
-- ============================================

-- Individual matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  a_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  b_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score DECIMAL(4,3) NOT NULL,
  explanation JSONB DEFAULT '{}',
  status match_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(a_user, b_user)
);

-- Group suggestions
CREATE TABLE group_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  group_size INTEGER NOT NULL DEFAULT 2,
  member_ids UUID[] NOT NULL,
  avg_score DECIMAL(4,3) NOT NULL,
  explanation JSONB DEFAULT '{}',
  status match_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. CHAT SYSTEM
-- ============================================

-- Chat rooms
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_group BOOLEAN NOT NULL DEFAULT false,
  group_id UUID REFERENCES group_suggestions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat members
CREATE TABLE chat_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message read receipts
CREATE TABLE message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- ============================================
-- 7. HOUSING SYSTEM
-- ============================================

-- Housing listings (university-vetted)
CREATE TABLE housing_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property details
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('apartment', 'house', 'studio', 'shared_room', 'private_room')),
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('private', 'shared', 'studio', 'entire_place')),
    total_rooms INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL,
    total_bathrooms DECIMAL(3, 1) NOT NULL,
    square_meters INTEGER,
    
    -- Pricing
    rent_monthly DECIMAL(10, 2) NOT NULL,
    utilities_included BOOLEAN DEFAULT FALSE,
    utilities_cost DECIMAL(10, 2) DEFAULT 0,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    agency_fee DECIMAL(10, 2) DEFAULT 0,
    
    -- Availability
    available_from DATE NOT NULL,
    available_until DATE,
    min_stay_months INTEGER DEFAULT 1,
    max_stay_months INTEGER,
    
    -- Amenities and features
    amenities TEXT[] DEFAULT '{}',
    pet_friendly BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    furnished BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    parking_cost DECIMAL(10, 2) DEFAULT 0,
    
    -- University integration
    university_id UUID REFERENCES universities(id),
    verified_by_university BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    -- Landlord/agency info
    landlord_name VARCHAR(255) NOT NULL,
    landlord_email VARCHAR(255) NOT NULL,
    landlord_phone VARCHAR(20),
    agency_name VARCHAR(255),
    agency_license VARCHAR(100),
    
    -- Media
    photos TEXT[] DEFAULT '{}', -- Array of photo URLs
    virtual_tour_url TEXT,
    floor_plan_url TEXT,
    
    -- Status and moderation
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'rented', 'expired')),
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'needs_review')),
    moderation_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tour bookings
CREATE TABLE tour_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES housing_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tour_type VARCHAR(20) NOT NULL CHECK (tour_type IN ('in_person', 'virtual', 'video_call')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    
    -- Contact info for tour
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    
    -- Tour details
    notes TEXT,
    special_requests TEXT,
    attendees_count INTEGER DEFAULT 1,
    
    -- Confirmation and follow-up
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    feedback_requested_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User housing preferences
CREATE TABLE user_housing_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Location preferences
    preferred_cities TEXT[] DEFAULT '{}',
    max_commute_minutes INTEGER,
    near_university BOOLEAN DEFAULT TRUE,
    
    -- Property preferences
    preferred_property_types TEXT[] DEFAULT '{}',
    preferred_room_type VARCHAR(50),
    min_square_meters INTEGER,
    max_square_meters INTEGER,
    
    -- Budget preferences
    max_rent_monthly DECIMAL(10, 2) NOT NULL,
    utilities_preference VARCHAR(20) DEFAULT 'included' CHECK (utilities_preference IN ('included', 'separate', 'either')),
    
    -- Amenity preferences
    required_amenities TEXT[] DEFAULT '{}',
    preferred_amenities TEXT[] DEFAULT '{}',
    pet_friendly_required BOOLEAN DEFAULT FALSE,
    smoking_preference VARCHAR(20) DEFAULT 'no_smoking' CHECK (smoking_preference IN ('no_smoking', 'smoking_ok', 'either')),
    
    -- Stay preferences
    min_stay_months INTEGER DEFAULT 1,
    max_stay_months INTEGER,
    move_in_flexibility_days INTEGER DEFAULT 30,
    
    -- Roommate preferences
    prefer_matched_roommates BOOLEAN DEFAULT TRUE,
    max_roommates INTEGER DEFAULT 3,
    gender_preference VARCHAR(20) CHECK (gender_preference IN ('same', 'opposite', 'any')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Housing applications
CREATE TABLE housing_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES housing_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Application details
    application_type VARCHAR(20) DEFAULT 'individual' CHECK (application_type IN ('individual', 'group')),
    group_members UUID[] DEFAULT '{}', -- Array of user IDs for group applications
    
    -- Application status
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')),
    
    -- Application content
    motivation_letter TEXT,
    reference_documents TEXT[] DEFAULT '{}',
    employment_status VARCHAR(50),
    income_proof_url TEXT,
    
    -- Decision tracking
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(listing_id, user_id)
);

-- ============================================
-- 8. REPUTATION SYSTEM
-- ============================================

-- Endorsements (short positive feedback)
CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endorsee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endorsement_type VARCHAR(50) NOT NULL CHECK (endorsement_type IN ('roommate', 'tenant', 'student', 'peer')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('cleanliness', 'communication', 'responsibility', 'respect', 'reliability', 'friendliness', 'study_habits', 'financial_trust', 'general')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    context VARCHAR(100), -- e.g., "Spring 2024", "Apartment A", "Study Group"
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- Verified by university staff
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-endorsement and duplicate endorsements
    CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsee_id),
    UNIQUE(endorser_id, endorsee_id, endorsement_type, category)
);

-- Detailed references (longer testimonials)
CREATE TABLE user_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('roommate', 'landlord', 'university_staff', 'peer', 'employer')),
    relationship_duration VARCHAR(50), -- e.g., "6 months", "1 year", "2 semesters"
    relationship_context TEXT, -- e.g., "We lived together in a shared apartment near campus"
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    
    -- Detailed ratings
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    responsibility_rating INTEGER CHECK (responsibility_rating >= 1 AND responsibility_rating <= 5),
    respect_rating INTEGER CHECK (respect_rating >= 1 AND respect_rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    financial_trust_rating INTEGER CHECK (financial_trust_rating >= 1 AND financial_trust_rating <= 5),
    
    -- Written testimonial
    testimonial TEXT NOT NULL,
    strengths TEXT[], -- Array of positive qualities
    areas_for_improvement TEXT[], -- Constructive feedback
    
    -- Contact verification
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_verified BOOLEAN DEFAULT FALSE,
    contact_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
    moderated_by UUID REFERENCES auth.users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent self-reference
    CONSTRAINT no_self_reference CHECK (referrer_id != referee_id),
    
    -- Prevent duplicate references from same person
    UNIQUE(referrer_id, referee_id)
);

-- Trust badges (earned through endorsements and references)
CREATE TABLE trust_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('verified_roommate', 'reliable_tenant', 'excellent_communicator', 'clean_living', 'financial_trust', 'study_buddy', 'social_connector', 'university_endorsed', 'landlord_recommended')),
    badge_level VARCHAR(20) DEFAULT 'bronze' CHECK (badge_level IN ('bronze', 'silver', 'gold', 'platinum')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Some badges may expire
    awarded_by_system BOOLEAN DEFAULT TRUE,
    awarded_by UUID REFERENCES auth.users(id), -- If manually awarded
    criteria_met JSONB, -- Store the criteria that earned this badge
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, badge_type) -- One badge per type per user
);

-- Reputation scores (aggregated metrics)
CREATE TABLE reputation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Overall reputation score (0-100)
    overall_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Category-specific scores
    cleanliness_score DECIMAL(5,2) DEFAULT 0 CHECK (cleanliness_score >= 0 AND cleanliness_score <= 100),
    communication_score DECIMAL(5,2) DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 100),
    responsibility_score DECIMAL(5,2) DEFAULT 0 CHECK (responsibility_score >= 0 AND responsibility_score <= 100),
    respect_score DECIMAL(5,2) DEFAULT 0 CHECK (respect_score >= 0 AND respect_score <= 100),
    reliability_score DECIMAL(5,2) DEFAULT 0 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    financial_trust_score DECIMAL(5,2) DEFAULT 0 CHECK (financial_trust_score >= 0 AND financial_trust_score <= 100),
    
    -- Metrics
    total_endorsements INTEGER DEFAULT 0,
    total_references INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of endorsement requests responded to
    
    -- Timestamps
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================
-- 9. MOVE-IN PLANNER SYSTEM
-- ============================================

-- Move-in plans (shared planning sessions)
CREATE TABLE move_in_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Move-in details
    move_in_date DATE NOT NULL,
    move_out_date DATE, -- For planning purposes
    property_address TEXT NOT NULL,
    property_type VARCHAR(50) DEFAULT 'apartment' CHECK (property_type IN ('apartment', 'house', 'studio', 'shared_room', 'dormitory')),
    
    -- Plan settings
    is_shared BOOLEAN DEFAULT TRUE, -- Shared with roommates
    budget_limit DECIMAL(10,2), -- Total budget limit
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Move-in plan participants
CREATE TABLE move_in_plan_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord', 'property_manager', 'helper')),
    
    -- Participation settings
    can_edit_plan BOOLEAN DEFAULT TRUE,
    can_manage_tasks BOOLEAN DEFAULT TRUE,
    can_manage_expenses BOOLEAN DEFAULT TRUE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Move-in tasks
CREATE TABLE move_in_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    
    -- Task details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('packing', 'cleaning', 'utilities', 'furniture', 'documents', 'insurance', 'transport', 'setup', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Task scheduling
    due_date DATE,
    estimated_duration_hours DECIMAL(4,2),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- e.g., 'weekly', 'monthly'
    
    -- Assignment and completion
    assigned_to UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),
    
    -- Task dependencies
    depends_on_task_id UUID REFERENCES move_in_tasks(id),
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Move-in expenses
CREATE TABLE move_in_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES move_in_plans(id) ON DELETE CASCADE,
    
    -- Expense details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('deposit', 'rent', 'utilities', 'furniture', 'appliances', 'cleaning', 'transport', 'storage', 'insurance', 'other')),
    
    -- Financial details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    is_shared_expense BOOLEAN DEFAULT TRUE, -- Shared among roommates
    split_method VARCHAR(50) DEFAULT 'equal' CHECK (split_method IN ('equal', 'by_room_size', 'by_usage', 'custom')),
    
    -- Payment information
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'cancelled')),
    payment_method VARCHAR(50), -- e.g., 'bank_transfer', 'cash', 'card', 'app'
    payment_app VARCHAR(50), -- e.g., 'tikkie', 'paypal', 'splitwise'
    payment_reference VARCHAR(100), -- Reference number or link
    
    -- Dates
    due_date DATE,
    paid_date DATE,
    receipt_url TEXT,
    
    -- Assignment
    paid_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. VIDEO INTROS SYSTEM
-- ============================================

-- Video/audio intro recordings
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

-- ============================================
-- 11. OTHER CORE TABLES
-- ============================================

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status report_status DEFAULT 'open',
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eligibility rules
CREATE TABLE eligibility_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  domain_allowlist TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(university_id)
);

-- Forum posts
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT false,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status post_status DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum comments
CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status post_status DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App events for analytics
CREATE TABLE app_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  props JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding sections storage for multi-step questionnaire
CREATE TABLE onboarding_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (
    section IN (
      'intro',
      'location-commute',
      'personality-values',
      'sleep-circadian',
      'noise-sensory',
      'home-operations',
      'social-hosting-language',
      'communication-conflict',
      'privacy-territoriality',
      'reliability-logistics'
    )
  ),
  answers JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT 'rmq-v1',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, section)
);

-- Onboarding submissions for final questionnaire snapshots
CREATE TABLE onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 12. INDEXES
-- ============================================

-- Core table indexes
CREATE INDEX idx_profiles_university_id ON profiles(university_id);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_question_key ON responses(question_key);
CREATE INDEX idx_user_vectors_user_id ON user_vectors(user_id);
CREATE INDEX idx_matches_a_user ON matches(a_user);
CREATE INDEX idx_matches_b_user ON matches(b_user);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_group_suggestions_university_id ON group_suggestions(university_id);
CREATE INDEX idx_group_suggestions_status ON group_suggestions(status);
CREATE INDEX idx_chats_group_id ON chats(group_id);
CREATE INDEX idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX idx_messages_chat_id_created_at ON messages(chat_id, created_at);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_target_user_id ON reports(target_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_announcements_university_id ON announcements(university_id);
CREATE INDEX idx_announcements_starts_at ON announcements(starts_at);
CREATE INDEX idx_announcements_ends_at ON announcements(ends_at);
CREATE INDEX idx_forum_posts_university_id ON forum_posts(university_id);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_status ON forum_posts(status);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_author_id ON forum_comments(author_id);
CREATE INDEX idx_app_events_user_id ON app_events(user_id);
CREATE INDEX idx_app_events_name ON app_events(name);
CREATE INDEX idx_app_events_created_at ON app_events(created_at);

-- Onboarding table indexes
CREATE INDEX idx_onboarding_sections_user_id ON onboarding_sections(user_id);
CREATE INDEX idx_onboarding_sections_section ON onboarding_sections(section);
CREATE INDEX idx_onboarding_submissions_user_id ON onboarding_submissions(user_id);
CREATE INDEX idx_onboarding_submissions_submitted_at ON onboarding_submissions(submitted_at);

-- Academic indexes
CREATE INDEX idx_programs_university_degree ON programs(university_id, degree_level);
CREATE INDEX idx_programs_name ON programs(name);
CREATE INDEX idx_programs_croho ON programs(croho_code) WHERE croho_code IS NOT NULL;
CREATE INDEX idx_programs_active ON programs(active) WHERE active = true;
CREATE INDEX idx_user_academic_university ON user_academic(university_id);
CREATE INDEX idx_user_academic_degree ON user_academic(degree_level);
CREATE INDEX idx_user_academic_program ON user_academic(program_id);
CREATE INDEX idx_user_academic_start_year ON user_academic(study_start_year);

-- Housing indexes
CREATE INDEX idx_housing_listings_city ON housing_listings(city);
CREATE INDEX idx_housing_listings_university ON housing_listings(university_id);
CREATE INDEX idx_housing_listings_rent ON housing_listings(rent_monthly);
CREATE INDEX idx_housing_listings_available_from ON housing_listings(available_from);
CREATE INDEX idx_housing_listings_status ON housing_listings(status);
CREATE INDEX idx_tour_bookings_listing ON tour_bookings(listing_id);
CREATE INDEX idx_tour_bookings_user ON tour_bookings(user_id);
CREATE INDEX idx_tour_bookings_scheduled ON tour_bookings(scheduled_for);
CREATE INDEX idx_housing_applications_listing ON housing_applications(listing_id);
CREATE INDEX idx_housing_applications_user ON housing_applications(user_id);
CREATE INDEX idx_housing_applications_status ON housing_applications(status);

-- Reputation indexes
CREATE INDEX idx_endorsements_endorsee ON endorsements(endorsee_id);
CREATE INDEX idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX idx_endorsements_type ON endorsements(endorsement_type);
CREATE INDEX idx_endorsements_category ON endorsements(category);
CREATE INDEX idx_endorsements_rating ON endorsements(rating);
CREATE INDEX idx_endorsements_created_at ON endorsements(created_at);
CREATE INDEX idx_user_references_referee ON user_references(referee_id);
CREATE INDEX idx_user_references_referrer ON user_references(referrer_id);
CREATE INDEX idx_user_references_type ON user_references(reference_type);
CREATE INDEX idx_user_references_status ON user_references(status);
CREATE INDEX idx_user_references_overall_rating ON user_references(overall_rating);
CREATE INDEX idx_trust_badges_user ON trust_badges(user_id);
CREATE INDEX idx_trust_badges_type ON trust_badges(badge_type);
CREATE INDEX idx_trust_badges_level ON trust_badges(badge_level);
CREATE INDEX idx_reputation_scores_user ON reputation_scores(user_id);
CREATE INDEX idx_reputation_scores_overall ON reputation_scores(overall_score);

-- Move-in planner indexes
CREATE INDEX idx_move_in_plans_created_by ON move_in_plans(created_by);
CREATE INDEX idx_move_in_plans_status ON move_in_plans(status);
CREATE INDEX idx_move_in_plans_move_in_date ON move_in_plans(move_in_date);
CREATE INDEX idx_move_in_plan_participants_plan ON move_in_plan_participants(plan_id);
CREATE INDEX idx_move_in_plan_participants_user ON move_in_plan_participants(user_id);
CREATE INDEX idx_move_in_tasks_plan ON move_in_tasks(plan_id);
CREATE INDEX idx_move_in_tasks_assigned_to ON move_in_tasks(assigned_to);
CREATE INDEX idx_move_in_tasks_status ON move_in_tasks(status);
CREATE INDEX idx_move_in_tasks_due_date ON move_in_tasks(due_date);
CREATE INDEX idx_move_in_tasks_category ON move_in_tasks(category);
CREATE INDEX idx_move_in_expenses_plan ON move_in_expenses(plan_id);
CREATE INDEX idx_move_in_expenses_category ON move_in_expenses(category);
CREATE INDEX idx_move_in_expenses_payment_status ON move_in_expenses(payment_status);
CREATE INDEX idx_move_in_expenses_due_date ON move_in_expenses(due_date);

-- Video intro indexes
CREATE INDEX idx_user_intro_recordings_user ON user_intro_recordings(user_id);
CREATE INDEX idx_user_intro_recordings_type ON user_intro_recordings(recording_type);
CREATE INDEX idx_user_intro_recordings_status ON user_intro_recordings(status);
CREATE INDEX idx_user_intro_recordings_public ON user_intro_recordings(is_public);
CREATE INDEX idx_user_intro_recordings_featured ON user_intro_recordings(is_featured);

-- HNSW index for vector similarity search
CREATE INDEX idx_user_vectors_vector_hnsw ON user_vectors USING hnsw (vector vector_cosine_ops);

-- ============================================
-- 13. TRIGGERS AND FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_items_updated_at BEFORE UPDATE ON question_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_responses_updated_at BEFORE UPDATE ON responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_vectors_updated_at BEFORE UPDATE ON user_vectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_suggestions_updated_at BEFORE UPDATE ON group_suggestions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eligibility_rules_updated_at BEFORE UPDATE ON eligibility_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Academic table triggers
CREATE TRIGGER trigger_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_academic_updated_at
    BEFORE UPDATE ON user_academic
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Housing table triggers
CREATE TRIGGER update_housing_listings_updated_at BEFORE UPDATE ON housing_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tour_bookings_updated_at BEFORE UPDATE ON tour_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_housing_preferences_updated_at BEFORE UPDATE ON user_housing_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_housing_applications_updated_at BEFORE UPDATE ON housing_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reputation table triggers
CREATE TRIGGER update_endorsements_updated_at BEFORE UPDATE ON endorsements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_references_updated_at BEFORE UPDATE ON user_references FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reputation_scores_updated_at BEFORE UPDATE ON reputation_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Move-in planner triggers
CREATE TRIGGER update_move_in_plans_updated_at BEFORE UPDATE ON move_in_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_move_in_tasks_updated_at BEFORE UPDATE ON move_in_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_move_in_expenses_updated_at BEFORE UPDATE ON move_in_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Video intro triggers
CREATE TRIGGER update_user_intro_recordings_updated_at BEFORE UPDATE ON user_intro_recordings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Onboarding triggers
CREATE TRIGGER update_onboarding_sections_updated_at BEFORE UPDATE ON onboarding_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 14. VIEWS
-- ============================================

-- View for computed study year
CREATE OR REPLACE VIEW user_study_year_v AS
SELECT 
    user_id,
    GREATEST(1, EXTRACT(YEAR FROM now())::int - study_start_year + 1) AS study_year
FROM user_academic;

-- ============================================
-- 15. STORAGE BUCKETS
-- ============================================

-- Create the storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- ============================================
-- 16. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_academic ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE housing_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_housing_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_plan_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_in_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intro_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

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

-- Programs: Read by anyone, write by service role
CREATE POLICY "programs_read_active" ON programs
    FOR SELECT USING (active = true);

CREATE POLICY "programs_service_role" ON programs
    FOR ALL USING (auth.role() = 'service_role');

-- User academic: Users can manage their own academic data
CREATE POLICY "user_academic_own" ON user_academic
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_academic_admin_read" ON user_academic
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- Profiles: Users can read their own, minimal public data by university members
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Minimal public profiles visible to university members" ON profiles
  FOR SELECT USING (
    minimal_public = true AND
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.user_id = auth.uid()
      AND p2.university_id = profiles.university_id
    )
  );

-- Question items: Read by everyone
CREATE POLICY "Question items are readable by everyone" ON question_items
  FOR SELECT USING (true);

-- Responses: Users can manage their own responses
CREATE POLICY "Users can manage their own responses" ON responses
  FOR ALL USING (user_id = auth.uid());

-- User vectors: Users can manage their own vectors
CREATE POLICY "Users can manage their own vectors" ON user_vectors
  FOR ALL USING (user_id = auth.uid());

-- Matches: Users can see matches they're involved in
CREATE POLICY "Users can see their matches" ON matches
  FOR SELECT USING (a_user = auth.uid() OR b_user = auth.uid());

-- Chats: Users can see chats they're members of
CREATE POLICY "Users can see their chats" ON chats
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = chats.id 
      AND chat_members.user_id = auth.uid()
    )
  );

-- Chat members: Users can see chat members for their chats
CREATE POLICY "Users can see chat members for their chats" ON chat_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_members.chat_id 
      AND (chats.created_by = auth.uid() OR
           EXISTS (
             SELECT 1 FROM chat_members cm2
             WHERE cm2.chat_id = chats.id 
             AND cm2.user_id = auth.uid()
           ))
    )
  );

-- Messages: Users can see messages in their chats
CREATE POLICY "Users can see messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = messages.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

-- Housing listings: Read by everyone, write by admins
CREATE POLICY "housing_listings_read" ON housing_listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "housing_listings_admin_write" ON housing_listings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

-- User housing preferences: Users can manage their own
CREATE POLICY "user_housing_preferences_own" ON user_housing_preferences
  FOR ALL USING (user_id = auth.uid());

-- Tour bookings: Users can manage their own bookings
CREATE POLICY "tour_bookings_own" ON tour_bookings
  FOR ALL USING (user_id = auth.uid());

-- Endorsements: Users can create endorsements, see those about them
CREATE POLICY "endorsements_create" ON endorsements
  FOR INSERT WITH CHECK (endorser_id = auth.uid());

CREATE POLICY "endorsements_read_about_me" ON endorsements
  FOR SELECT USING (endorsee_id = auth.uid());

-- User references: Users can create references, see those about them
CREATE POLICY "user_references_create" ON user_references
  FOR INSERT WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "user_references_read_about_me" ON user_references
  FOR SELECT USING (referee_id = auth.uid());

-- Trust badges: Users can see their own badges
CREATE POLICY "trust_badges_own" ON trust_badges
  FOR SELECT USING (user_id = auth.uid());

-- Reputation scores: Users can see their own scores
CREATE POLICY "reputation_scores_own" ON reputation_scores
  FOR SELECT USING (user_id = auth.uid());

-- Move-in plans: Users can see plans they participate in
CREATE POLICY "move_in_plans_participant" ON move_in_plans
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM move_in_plan_participants 
      WHERE move_in_plan_participants.plan_id = move_in_plans.id 
      AND move_in_plan_participants.user_id = auth.uid()
    )
  );

-- Video recordings: Users can manage their own recordings
CREATE POLICY "user_intro_recordings_own" ON user_intro_recordings
  FOR ALL USING (user_id = auth.uid());

-- Onboarding sections: Users can manage their own sections
CREATE POLICY "onboarding_sections_own" ON onboarding_sections
  FOR ALL USING (user_id = auth.uid());

-- Onboarding submissions: Users can manage their own submissions
CREATE POLICY "onboarding_submissions_own" ON onboarding_submissions
  FOR ALL USING (user_id = auth.uid());

-- App events: Users can insert their own events
CREATE POLICY "Users can insert their own events" ON app_events
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Grant necessary permissions
GRANT SELECT ON programs TO authenticated;
GRANT ALL ON user_academic TO authenticated;
GRANT SELECT ON user_study_year_v TO authenticated;
GRANT ALL ON user_housing_preferences TO authenticated;
GRANT ALL ON tour_bookings TO authenticated;
GRANT ALL ON endorsements TO authenticated;
GRANT ALL ON user_references TO authenticated;
GRANT ALL ON trust_badges TO authenticated;
GRANT ALL ON reputation_scores TO authenticated;
GRANT ALL ON move_in_plans TO authenticated;
GRANT ALL ON move_in_plan_participants TO authenticated;
GRANT ALL ON move_in_tasks TO authenticated;
GRANT ALL ON move_in_expenses TO authenticated;
GRANT ALL ON user_intro_recordings TO authenticated;

-- Grant service role permissions for imports
GRANT ALL ON programs TO service_role;
GRANT SELECT ON universities TO service_role;

-- Storage bucket policies
CREATE POLICY "verification_documents_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "verification_documents_view_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "verification_documents_admin_view" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "verification_documents_service_role" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 17. MATCHING ENGINE FUNCTIONS
-- ============================================

-- Function to compute user compatibility score
CREATE OR REPLACE FUNCTION compute_compatibility_score(
  user_a_id uuid,
  user_b_id uuid
) RETURNS TABLE (
  compatibility_score numeric,
  personality_score numeric,
  schedule_score numeric,
  lifestyle_score numeric,
  social_score numeric,
  academic_bonus numeric,
  penalty numeric,
  top_alignment text,
  watch_out text,
  house_rules_suggestion text,
  academic_details jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_a_vector numeric[];
  user_b_vector numeric[];
  user_a_profile record;
  user_b_profile record;
  similarity_score numeric;
  schedule_overlap numeric;
  cleanliness_align numeric;
  social_align numeric;
  academic_bonus numeric := 0;
  penalty numeric := 0;
  base_score numeric;
  final_score numeric;
  top_alignment text;
  watch_out text;
  house_rules text;
  academic_details jsonb;
BEGIN
  -- Get user vectors and profiles
  SELECT vector INTO user_a_vector FROM user_vectors WHERE user_id = user_a_id;
  SELECT vector INTO user_b_vector FROM user_vectors WHERE user_id = user_b_id;
  
  -- Get user profiles for lifestyle matching
  SELECT 
    ua.university_id,
    ua.degree_level,
    ua.program_id,
    ua.study_start_year,
    p.faculty,
    GREATEST(1, EXTRACT(YEAR FROM NOW())::int - ua.study_start_year + 1) as study_year
  INTO user_a_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  WHERE ua.user_id = user_a_id;
  
  SELECT 
    ua.university_id,
    ua.degree_level,
    ua.program_id,
    ua.study_start_year,
    p.faculty,
    GREATEST(1, EXTRACT(YEAR FROM NOW())::int - ua.study_start_year + 1) as study_year
  INTO user_b_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  WHERE ua.user_id = user_b_id;

  -- Compute cosine similarity (simplified)
  similarity_score := 0.8; -- Placeholder - would compute actual cosine similarity
  
  -- Compute schedule overlap (simplified)
  schedule_overlap := 0.7; -- Placeholder
  
  -- Compute lifestyle alignment (simplified)
  cleanliness_align := 0.6; -- Placeholder
  social_align := 0.5; -- Placeholder
  
  -- Compute academic affinity
  academic_details := '{}'::jsonb;
  
  -- Same university bonus (8%)
  IF user_a_profile.university_id = user_b_profile.university_id THEN
    academic_bonus := academic_bonus + 0.08;
    academic_details := academic_details || '{"university_affinity": true}'::jsonb;
  END IF;
  
  -- Same programme bonus (12%) - highest priority
  IF user_a_profile.program_id = user_b_profile.program_id AND user_a_profile.program_id IS NOT NULL THEN
    academic_bonus := academic_bonus + 0.12;
    academic_details := academic_details || '{"program_affinity": true}'::jsonb;
  -- Same faculty bonus (5%) - only if not same programme
  ELSIF user_a_profile.faculty = user_b_profile.faculty AND user_a_profile.faculty IS NOT NULL THEN
    academic_bonus := academic_bonus + 0.05;
    academic_details := academic_details || '{"faculty_affinity": true}'::jsonb;
  END IF;
  
  -- Study year gap penalty (2% per year beyond 2)
  IF ABS(user_a_profile.study_year - user_b_profile.study_year) > 2 THEN
    penalty := penalty + (ABS(user_a_profile.study_year - user_b_profile.study_year) - 2) * 0.02;
    academic_details := academic_details || '{"year_gap_penalty": ' || ABS(user_a_profile.study_year - user_b_profile.study_year) || '}'::jsonb;
  END IF;
  
  -- Calculate component scores
  personality_score := similarity_score;
  schedule_score := schedule_overlap;
  lifestyle_score := (cleanliness_align + social_align) / 2;
  social_score := social_align;
  
  -- Calculate final compatibility score
  base_score := (personality_score * 0.3 + schedule_score * 0.2 + lifestyle_score * 0.3 + social_score * 0.2);
  final_score := base_score + academic_bonus - penalty;
  
  -- Ensure score is between 0 and 1
  final_score := GREATEST(0, LEAST(1, final_score));
  
  -- Generate insights
  IF academic_bonus > 0.1 THEN
    top_alignment := 'Academic compatibility';
  ELSIF similarity_score > 0.8 THEN
    top_alignment := 'Personality match';
  ELSIF schedule_overlap > 0.8 THEN
    top_alignment := 'Schedule alignment';
  ELSE
    top_alignment := 'General compatibility';
  END IF;
  
  IF penalty > 0.1 THEN
    watch_out := 'Significant age gap';
  ELSIF cleanliness_align < 0.4 THEN
    watch_out := 'Different cleanliness standards';
  ELSIF social_align < 0.3 THEN
    watch_out := 'Different social preferences';
  ELSE
    watch_out := 'No major concerns';
  END IF;
  
  house_rules := 'Discuss shared spaces, quiet hours, and guest policies';
  
  RETURN QUERY SELECT 
    final_score,
    personality_score,
    schedule_score,
    lifestyle_score,
    social_score,
    academic_bonus,
    penalty,
    top_alignment,
    watch_out,
    house_rules,
    academic_details;
END;
$$;

-- Function to find potential matches for a user
CREATE OR REPLACE FUNCTION find_potential_matches(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_min_score numeric DEFAULT 0.6
) RETURNS TABLE (
  user_id uuid,
  first_name text,
  university_name text,
  program_name text,
  compatibility_score numeric,
  academic_bonus numeric,
  top_alignment text,
  watch_out text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    p.first_name,
    univ.name as university_name,
    prog.name as program_name,
    cs.compatibility_score,
    cs.academic_bonus,
    cs.top_alignment,
    cs.watch_out
  FROM users u
  JOIN profiles p ON u.id = p.user_id
  JOIN user_academic ua ON u.id = ua.user_id
  JOIN universities univ ON ua.university_id = univ.id
  LEFT JOIN programs prog ON ua.program_id = prog.id
  CROSS JOIN LATERAL compute_compatibility_score(p_user_id, u.id) cs
  WHERE u.id != p_user_id
    AND u.is_active = true
    AND p.verification_status = 'verified'
    AND cs.compatibility_score >= p_min_score
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit;
END;
$$;

-- Function to create matches for a user
CREATE OR REPLACE FUNCTION create_matches_for_user(
  p_user_id uuid,
  p_batch_size integer DEFAULT 10
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_count integer := 0;
  potential_match record;
BEGIN
  -- Find potential matches
  FOR potential_match IN 
    SELECT user_id, compatibility_score, academic_bonus, top_alignment, watch_out
    FROM find_potential_matches(p_user_id, p_batch_size, 0.6)
  LOOP
    -- Check if match already exists
    IF NOT EXISTS (
      SELECT 1 FROM matches 
      WHERE (a_user = p_user_id AND b_user = potential_match.user_id) 
         OR (a_user = potential_match.user_id AND b_user = p_user_id)
    ) THEN
      -- Insert new match
      INSERT INTO matches (a_user, b_user, score, explanation, status)
      VALUES (
        p_user_id, 
        potential_match.user_id, 
        potential_match.compatibility_score,
        json_build_object(
          'academic_bonus', potential_match.academic_bonus,
          'top_alignment', potential_match.top_alignment,
          'watch_out', potential_match.watch_out,
          'created_by', 'matching_algorithm'
        ),
        'pending'
      );
      match_count := match_count + 1;
    END IF;
  END LOOP;
  
  RETURN match_count;
END;
$$;

-- Function to update user vector from questionnaire responses
CREATE OR REPLACE FUNCTION update_user_vector(
  p_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vector_array numeric[] := ARRAY[]::numeric[];
  response_record record;
  normalized_value numeric;
BEGIN
  -- Clear existing vector
  DELETE FROM user_vectors WHERE user_id = p_user_id;
  
  -- Build vector from responses
  FOR response_record IN 
    SELECT qi.key, qi.type, r.value
    FROM responses r
    JOIN question_items qi ON r.question_key = qi.key
    WHERE r.user_id = p_user_id
    ORDER BY qi.key
  LOOP
    -- Normalize different response types to 0-1 scale
    CASE response_record.type
      WHEN 'slider' THEN
        normalized_value := (response_record.value::numeric) / 10.0;
      WHEN 'boolean' THEN
        normalized_value := CASE WHEN response_record.value::boolean THEN 1.0 ELSE 0.0 END;
      WHEN 'single' THEN
        -- For single choice, map to numeric value based on options
        normalized_value := 0.5; -- Default middle value
      WHEN 'multiple' THEN
        -- For multiple choice, count selections
        normalized_value := CASE 
          WHEN response_record.value::text[] IS NOT NULL 
          THEN array_length(response_record.value::text[], 1)::numeric / 5.0
          ELSE 0.0
        END;
      ELSE
        normalized_value := 0.5; -- Default for text and other types
    END CASE;
    
    vector_array := vector_array || normalized_value;
  END LOOP;
  
  -- Pad or truncate to exactly 50 dimensions
  WHILE array_length(vector_array, 1) < 50 LOOP
    vector_array := vector_array || 0.0;
  END LOOP;
  
  WHILE array_length(vector_array, 1) > 50 LOOP
    vector_array := vector_array[1:array_length(vector_array, 1)-1];
  END LOOP;
  
  -- Insert normalized vector
  INSERT INTO user_vectors (user_id, vector)
  VALUES (p_user_id, vector_array::vector);
  
  RETURN true;
END;
$$;

-- Function to get match statistics for a user
CREATE OR REPLACE FUNCTION get_user_match_stats(
  p_user_id uuid
) RETURNS TABLE (
  total_matches integer,
  pending_matches integer,
  accepted_matches integer,
  rejected_matches integer,
  avg_compatibility_score numeric,
  highest_score numeric,
  lowest_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_matches,
    COUNT(*) FILTER (WHERE status = 'pending')::integer as pending_matches,
    COUNT(*) FILTER (WHERE status = 'accepted')::integer as accepted_matches,
    COUNT(*) FILTER (WHERE status = 'rejected')::integer as rejected_matches,
    AVG(score) as avg_compatibility_score,
    MAX(score) as highest_score,
    MIN(score) as lowest_score
  FROM matches
  WHERE a_user = p_user_id OR b_user = p_user_id;
END;
$$;

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION compute_compatibility_score(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION find_potential_matches(uuid, integer, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION create_matches_for_user(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_vector(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_match_stats(uuid) TO authenticated;
