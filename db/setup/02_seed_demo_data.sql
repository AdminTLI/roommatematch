-- Enhanced Seed Data for Roommate Match with Complete Demo User Profile
-- This file contains comprehensive seed data including a full demo profile for testing

-- ============================================
-- 1. UNIVERSITIES
-- ============================================

INSERT INTO universities (id, name, slug, branding, eligibility_domains, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'University of Amsterdam', 'uva', 
   '{"primary_color": "#003082", "logo_url": "/logos/uva.png", "welcome_message": "Find your perfect roommate at UvA!"}', 
   '{"student.uva.nl", "uva.nl"}', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Delft University of Technology', 'tudelft', 
   '{"primary_color": "#00a6d6", "logo_url": "/logos/tudelft.png", "welcome_message": "Connect with fellow TU Delft students!"}', 
   '{"student.tudelft.nl", "tudelft.nl"}', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Erasmus University Rotterdam', 'eur', 
   '{"primary_color": "#003366", "logo_url": "/logos/eur.png", "welcome_message": "Your next roommate is waiting at EUR!"}', 
   '{"student.eur.nl", "eur.nl"}', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Utrecht University', 'uu', 
   '{"primary_color": "#003c71", "logo_url": "/logos/uu.png", "welcome_message": "Join the UU community!"}', 
   '{"student.uu.nl", "uu.nl"}', true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Leiden University', 'leiden', 
   '{"primary_color": "#c41230", "logo_url": "/logos/leiden.png", "welcome_message": "Find your perfect match at Leiden!"}', 
   '{"student.leiden.edu", "leiden.edu"}', true);

-- ============================================
-- 2. PROGRAMS
-- ============================================

INSERT INTO programs (id, university_id, croho_code, name, name_en, degree_level, language_codes, faculty, active) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '56901', 'Computer Science', 'Computer Science', 'master', '{"en", "nl"}', 'Faculty of Science', true),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '56501', 'Psychology', 'Psychology', 'bachelor', '{"nl", "en"}', 'Faculty of Social and Behavioural Sciences', true),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '56601', 'Biology', 'Biology', 'master', '{"en", "nl"}', 'Faculty of Science', true),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '56982', 'Aerospace Engineering', 'Aerospace Engineering', 'master', '{"en"}', 'Faculty of Aerospace Engineering', true),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '56995', 'Industrial Design', 'Industrial Design', 'bachelor', '{"en", "nl"}', 'Faculty of Industrial Design Engineering', true),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '56801', 'Economics', 'Economics', 'master', '{"en", "nl"}', 'Erasmus School of Economics', true),
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '56811', 'Business Administration', 'Business Administration', 'master', '{"en", "nl"}', 'Amsterdam Business School', true),
  ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', '56901', 'Computer Science', 'Computer Science', 'bachelor', '{"nl", "en"}', 'Faculty of Science', true);

-- ============================================
-- 3. QUESTIONNAIRE ITEMS
-- ============================================

INSERT INTO question_items (key, section, type, options, weight, is_hard) VALUES
  -- Basics section
  ('degree_level', 'basics', 'single', '["bachelor", "master", "phd", "exchange", "other"]', 1.0, true),
  ('program', 'basics', 'text', null, 1.0, false),
  ('campus', 'basics', 'text', null, 1.0, false),
  ('move_in_window', 'basics', 'single', '["immediate", "within_month", "within_3_months", "flexible"]', 1.0, false),
  
  -- Logistics section
  ('budget_min', 'logistics', 'single', '["300", "400", "500", "600", "700", "800", "900", "1000"]', 1.0, true),
  ('budget_max', 'logistics', 'single', '["400", "500", "600", "700", "800", "900", "1000", "1200", "1500"]', 1.0, true),
  ('commute_max', 'logistics', 'single', '["15", "30", "45", "60", "90"]', 1.0, true),
  ('lease_length', 'logistics', 'single', '["3_months", "6_months", "12_months", "flexible"]', 1.0, false),
  ('room_type', 'logistics', 'multiple', '["single", "shared", "studio", "flexible"]', 1.0, false),
  
  -- Lifestyle section
  ('sleep_start', 'lifestyle', 'single', '["20", "21", "22", "23", "24", "1", "2"]', 1.0, false),
  ('sleep_end', 'lifestyle', 'single', '["6", "7", "8", "9", "10", "11", "12"]', 1.0, false),
  ('study_intensity', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('cleanliness_room', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('cleanliness_kitchen', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('noise_tolerance', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('guests_frequency', 'lifestyle', 'slider', '{"min": 0, "max": 10, "three": 1}', 1.0, false),
  ('parties_frequency', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('chores_preference', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('alcohol_at_home', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('pets_tolerance', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  
  -- Social section
  ('social_level', 'social', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('food_sharing', 'social', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('utensils_sharing', 'social', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  
  -- Personality section (Big Five)
  ('extraversion', 'personality', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('agreeableness', 'personality', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('conscientiousness', 'personality', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('neuroticism', 'personality', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('openness', 'personality', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  
  -- Communication section
  ('conflict_style', 'communication', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  ('communication_preference', 'communication', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
  
  -- Languages
  ('languages_daily', 'languages', 'multiple', '["en", "nl", "de", "fr", "es", "other"]', 1.0, true),
  
  -- Deal breakers
  ('smoking', 'deal_breakers', 'boolean', null, 1.0, true),
  ('pets_allowed', 'deal_breakers', 'boolean', null, 1.0, true),
  ('parties_max', 'deal_breakers', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, true),
  ('guests_max', 'deal_breakers', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, true);

-- ============================================
-- 4. DEMO USER SETUP
-- ============================================

-- First, we need to get the demo user ID from auth.users (this will be done after the user is created in Supabase Auth)
-- For now, we'll use a placeholder that needs to be updated with the actual demo user ID

-- Demo user entry in users table (replace with actual demo user ID from auth.users)
-- INSERT INTO users (id, email, is_active) VALUES
--   ('[DEMO_USER_ID]', 'demo@account.com', true);

-- Demo user profile (replace with actual demo user ID)
-- INSERT INTO profiles (user_id, university_id, first_name, degree_level, program, campus, languages, verification_status) VALUES
--   ('[DEMO_USER_ID]', '550e8400-e29b-41d4-a716-446655440001', 'Demo Student', 'master', 'Computer Science', 'Science Park', '{"en", "nl"}', 'verified');

-- Demo user academic data (replace with actual demo user ID)
-- INSERT INTO user_academic (user_id, university_id, degree_level, program_id, study_start_year) VALUES
--   ('[DEMO_USER_ID]', '550e8400-e29b-41d4-a716-446655440001', 'master', '660e8400-e29b-41d4-a716-446655440001', 2024);

-- ============================================
-- 5. DEMO USER QUESTIONNAIRE RESPONSES
-- ============================================

-- Complete questionnaire responses for demo user (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO responses (user_id, question_key, value) VALUES
--   -- Basics
--   ('[DEMO_USER_ID]', 'degree_level', '"master"'),
--   ('[DEMO_USER_ID]', 'program', '"Computer Science"'),
--   ('[DEMO_USER_ID]', 'campus', '"Science Park"'),
--   ('[DEMO_USER_ID]', 'move_in_window', '"within_month"'),
  
--   -- Logistics
--   ('[DEMO_USER_ID]', 'budget_min', '"600"'),
--   ('[DEMO_USER_ID]', 'budget_max', '"900"'),
--   ('[DEMO_USER_ID]', 'commute_max', '"30"'),
--   ('[DEMO_USER_ID]', 'lease_length', '"12_months"'),
--   ('[DEMO_USER_ID]', 'room_type', '["single", "shared"]'),
  
--   -- Lifestyle
--   ('[DEMO_USER_ID]', 'sleep_start', '"23"'),
--   ('[DEMO_USER_ID]', 'sleep_end', '"8"'),
--   ('[DEMO_USER_ID]', 'study_intensity', '8'),
--   ('[DEMO_USER_ID]', 'cleanliness_room', '8'),
--   ('[DEMO_USER_ID]', 'cleanliness_kitchen', '7'),
--   ('[DEMO_USER_ID]', 'noise_tolerance', '6'),
--   ('[DEMO_USER_ID]', 'guests_frequency', '5'),
--   ('[DEMO_USER_ID]', 'parties_frequency', '3'),
--   ('[DEMO_USER_ID]', 'chores_preference', '7'),
--   ('[DEMO_USER_ID]', 'alcohol_at_home', '4'),
--   ('[DEMO_USER_ID]', 'pets_tolerance', '6'),
  
--   -- Social
--   ('[DEMO_USER_ID]', 'social_level', '7'),
--   ('[DEMO_USER_ID]', 'food_sharing', '5'),
--   ('[DEMO_USER_ID]', 'utensils_sharing', '6'),
  
--   -- Personality (Big Five)
--   ('[DEMO_USER_ID]', 'extraversion', '7'),
--   ('[DEMO_USER_ID]', 'agreeableness', '8'),
--   ('[DEMO_USER_ID]', 'conscientiousness', '8'),
--   ('[DEMO_USER_ID]', 'neuroticism', '3'),
--   ('[DEMO_USER_ID]', 'openness', '7'),
  
--   -- Communication
--   ('[DEMO_USER_ID]', 'conflict_style', '6'),
--   ('[DEMO_USER_ID]', 'communication_preference', '7'),
  
--   -- Languages
--   ('[DEMO_USER_ID]', 'languages_daily', '["en", "nl"]'),
  
--   -- Deal breakers
--   ('[DEMO_USER_ID]', 'smoking', 'false'),
--   ('[DEMO_USER_ID]', 'pets_allowed', 'true'),
--   ('[DEMO_USER_ID]', 'parties_max', '5'),
--   ('[DEMO_USER_ID]', 'guests_max', '6');

-- ============================================
-- 6. DEMO USER VECTOR
-- ============================================

-- Demo user vector for matching (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO user_vectors (user_id, vector) VALUES
--   ('[DEMO_USER_ID]', '[0.8, 0.7, 0.6, 0.8, 0.5, 0.7, 0.6, 0.8, 0.7, 0.4, 0.6, 0.7, 0.5, 0.6, 0.7, 0.8, 0.8, 0.3, 0.7, 0.6, 0.7, 0.6, 0.7, 0.8, 0.8, 0.3, 0.7, 0.6, 0.7, 0.6, 0.7, 0.8, 0.8, 0.3, 0.7, 0.6, 0.7, 0.6, 0.7, 0.8, 0.8, 0.3, 0.7, 0.6, 0.7, 0.6, 0.7, 0.8, 0.8, 0.3]');

-- ============================================
-- 7. DEMO USER HOUSING PREFERENCES
-- ============================================

-- Demo user housing preferences (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO user_housing_preferences (
--   user_id, preferred_cities, max_commute_minutes, near_university,
--   preferred_property_types, preferred_room_type, min_square_meters, max_square_meters,
--   max_rent_monthly, utilities_preference, required_amenities, preferred_amenities,
--   pet_friendly_required, smoking_preference, min_stay_months, max_stay_months,
--   move_in_flexibility_days, prefer_matched_roommates, max_roommates, gender_preference
-- ) VALUES (
--   '[DEMO_USER_ID]',
--   '{"Amsterdam", "Amstelveen"}',
--   30,
--   true,
--   '{"apartment", "studio"}',
--   'shared',
--   12,
--   25,
--   900.00,
--   'included',
--   '{"wifi", "heating", "washing_machine"}',
--   '{"balcony", "parking", "dishwasher"}',
--   true,
--   'no_smoking',
--   12,
--   24,
--   30,
--   true,
--   2,
--   'any'
-- );

-- ============================================
-- 8. SAMPLE HOUSING LISTINGS
-- ============================================

INSERT INTO housing_listings (
  id, title, description, address, city, postal_code, latitude, longitude,
  property_type, room_type, total_rooms, available_rooms, total_bathrooms, square_meters,
  rent_monthly, utilities_included, utilities_cost, deposit_amount,
  available_from, min_stay_months, max_stay_months,
  amenities, pet_friendly, smoking_allowed, furnished, parking_available,
  university_id, verified_by_university, verification_date,
  landlord_name, landlord_email, landlord_phone,
  photos, status, moderation_status
) VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  'Cozy shared room in Amsterdam Science Park',
  'Beautiful shared room in a modern apartment near University of Amsterdam Science Park campus. Perfect for students who want a comfortable living space with easy access to university facilities.',
  'Science Park 904, 1098 XH Amsterdam',
  'Amsterdam',
  '1098XH',
  52.3547,
  4.9556,
  'apartment',
  'shared',
  3,
  1,
  2.0,
  18,
  750.00,
  true,
  0.00,
  1500.00,
  '2024-02-01',
  12,
  24,
  '{"wifi", "heating", "washing_machine", "dishwasher", "balcony"}',
  true,
  false,
  true,
  true,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  NOW(),
  'Maria van der Berg',
  'maria@example.com',
  '+31612345678',
  '{"https://example.com/photo1.jpg", "https://example.com/photo2.jpg"}',
  'active',
  'approved'
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  'Private room in student house near UvA',
  'Spacious private room in a lively student house. Great location with excellent public transport connections to UvA campuses.',
  'Kruislaan 123, 1098 SM Amsterdam',
  'Amsterdam',
  '1098SM',
  52.3567,
  4.9576,
  'house',
  'private',
  5,
  1,
  2.0,
  20,
  850.00,
  false,
  150.00,
  1700.00,
  '2024-01-15',
  6,
  18,
  '{"wifi", "heating", "washing_machine", "garden"}',
  false,
  false,
  true,
  false,
  '550e8400-e29b-41d4-a716-446655440001',
  true,
  NOW(),
  'Jan de Vries',
  'jan@example.com',
  '+31623456789',
  '{"https://example.com/photo3.jpg", "https://example.com/photo4.jpg"}',
  'active',
  'approved'
);

-- ============================================
-- 9. SAMPLE MATCHES (for demonstration)
-- ============================================

-- Sample matches for demo user (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO matches (a_user, b_user, score, explanation, status) VALUES
--   ('[DEMO_USER_ID]', '750e8400-e29b-41d4-a716-446655440002', 0.89, '{"compatibility": "high", "reasons": ["same_university", "similar_cleanliness", "compatible_schedule"]}', 'pending'),
--   ('[DEMO_USER_ID]', '750e8400-e29b-41d4-a716-446655440003', 0.92, '{"compatibility": "very_high", "reasons": ["same_program", "excellent_match"]}', 'pending'),
--   ('750e8400-e29b-41d4-a716-446655440002', '[DEMO_USER_ID]', 0.89, '{"compatibility": "high", "reasons": ["same_university", "similar_cleanliness", "compatible_schedule"]}', 'pending'),
--   ('750e8400-e29b-41d4-a716-446655440003', '[DEMO_USER_ID]', 0.92, '{"compatibility": "very_high", "reasons": ["same_program", "excellent_match"]}', 'pending');

-- ============================================
-- 10. SAMPLE APP EVENTS
-- ============================================

-- Sample app events for demo user (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO app_events (user_id, name, props) VALUES
--   ('[DEMO_USER_ID]', 'profile_created', '{"university": "uva", "degree_level": "master"}'),
--   ('[DEMO_USER_ID]', 'questionnaire_completed', '{"sections_completed": 6, "total_questions": 30}'),
--   ('[DEMO_USER_ID]', 'housing_preferences_set', '{"max_rent": 900, "preferred_cities": ["Amsterdam"]}'),
--   ('[DEMO_USER_ID]', 'matches_viewed', '{"match_count": 2}'),
--   ('[DEMO_USER_ID]', 'housing_listing_viewed', '{"listing_id": "770e8400-e29b-41d4-a716-446655440001"}');

-- ============================================
-- 11. ADDITIONAL SAMPLE DATA
-- ============================================

-- Sample endorsements (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO endorsements (endorser_id, endorsee_id, endorsement_type, category, rating, comment, context, is_anonymous, is_verified, verified_by, verified_at, created_at, updated_at) VALUES
--   ('750e8400-e29b-41d4-a716-446655440001', '[DEMO_USER_ID]', 'roommate', 'cleanliness', 5, 'Always keeps the shared spaces spotless!', 'Spring 2024', false, true, NULL, NOW(), NOW(), NOW()),
--   ('750e8400-e29b-41d4-a716-446655440002', '[DEMO_USER_ID]', 'roommate', 'communication', 4, 'Great at communicating about shared responsibilities', 'Spring 2024', false, true, NULL, NOW(), NOW(), NOW());

-- Sample references (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO user_references (
--   referrer_id, referee_id, reference_type, relationship_duration, relationship_context,
--   overall_rating, cleanliness_rating, communication_rating, responsibility_rating,
--   respect_rating, reliability_rating, financial_trust_rating,
--   testimonial, strengths, areas_for_improvement,
--   contact_verified, status
-- ) VALUES (
--   '750e8400-e29b-41d4-a716-446655440002', '[DEMO_USER_ID]', 'roommate', '6 months',
--   'We lived together in a shared apartment near UvA Science Park',
--   5, 5, 4, 5, 5, 4, 5,
--   'Demo Student is an excellent roommate. Always respectful, clean, and reliable. Would definitely recommend living with them!',
--   '{"cleanliness", "respect", "reliability"}',
--   '{"could_be_more_social"}',
--   true, 'approved'
-- );

-- Sample trust badges (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO trust_badges (user_id, badge_type, badge_level, earned_at, criteria_met) VALUES
--   ('[DEMO_USER_ID]', 'clean_living', 'gold', NOW(), '{"cleanliness_rating": 4.8, "endorsements_count": 3}'),
--   ('[DEMO_USER_ID]', 'reliable_tenant', 'silver', NOW(), '{"responsibility_rating": 4.5, "references_count": 1}'),
--   ('[DEMO_USER_ID]', 'verified_roommate', 'bronze', NOW(), '{"university_verified": true, "profile_complete": true}');

-- Sample reputation scores (replace [DEMO_USER_ID] with actual ID)
-- INSERT INTO reputation_scores (
--   user_id, overall_score, cleanliness_score, communication_score, responsibility_score,
--   respect_score, reliability_score, financial_trust_score,
--   total_endorsements, total_references, average_rating
-- ) VALUES (
--   '[DEMO_USER_ID]', 87.5, 92.0, 85.0, 88.0, 90.0, 86.0, 89.0, 3, 1, 4.6
-- );

-- ============================================
-- INSTRUCTIONS FOR DEMO USER SETUP
-- ============================================

-- After creating the demo user in Supabase Auth (demo@account.com / Testing123),
-- you need to:
-- 1. Get the user ID from the auth.users table
-- 2. Replace all instances of '[DEMO_USER_ID]' in this file with the actual user ID
-- 3. Run the INSERT statements for the demo user data

-- To get the demo user ID, run this query in Supabase SQL Editor:
-- SELECT id FROM auth.users WHERE email = 'demo@account.com';

-- Then update this file and run the INSERT statements for the demo user.
