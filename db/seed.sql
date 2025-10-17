-- Seed data for Roommate Match MVP

-- Insert sample universities
INSERT INTO universities (id, name, slug, branding, eligibility_domains, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'University of Amsterdam', 'uva', 
   '{"primary_color": "#003082", "logo_url": "/logos/uva.png", "welcome_message": "Find your perfect roommate at UvA!"}', 
   '{"student.uva.nl", "uva.nl"}', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Delft University of Technology', 'tudelft', 
   '{"primary_color": "#00a6d6", "logo_url": "/logos/tudelft.png", "welcome_message": "Connect with fellow TU Delft students!"}', 
   '{"student.tudelft.nl", "tudelft.nl"}', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Erasmus University Rotterdam', 'eur', 
   '{"primary_color": "#003366", "logo_url": "/logos/eur.png", "welcome_message": "Your next roommate is waiting at EUR!"}', 
   '{"student.eur.nl", "eur.nl"}', true);

-- Insert sample admin users (these would be created through Supabase Auth in real usage)
INSERT INTO users (id, email, is_active) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'admin@uva.nl', true),
  ('650e8400-e29b-41d4-a716-446655440002', 'admin@tudelft.nl', true),
  ('650e8400-e29b-41d4-a716-446655440003', 'admin@eur.nl', true);

INSERT INTO admins (user_id, university_id, role) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'university_admin'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'university_admin'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'university_admin');

-- Insert sample student users
INSERT INTO users (id, email, is_active) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'student1@student.uva.nl', true),
  ('750e8400-e29b-41d4-a716-446655440002', 'student2@student.uva.nl', true),
  ('750e8400-e29b-41d4-a716-446655440003', 'student3@student.uva.nl', true),
  ('750e8400-e29b-41d4-a716-446655440004', 'student4@student.tudelft.nl', true),
  ('750e8400-e29b-41d4-a716-446655440005', 'student5@student.tudelft.nl', true),
  ('750e8400-e29b-41d4-a716-446655440006', 'student6@student.eur.nl', true);

-- Insert sample profiles
INSERT INTO profiles (user_id, university_id, first_name, degree_level, program, campus, languages, verification_status) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Emma', 'master', 'Computer Science', 'Science Park', '{"en", "nl"}', 'verified'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Liam', 'bachelor', 'Psychology', 'Roeterseiland', '{"en", "nl"}', 'verified'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Sophie', 'phd', 'Biology', 'Science Park', '{"en", "nl", "de"}', 'verified'),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Noah', 'master', 'Aerospace Engineering', 'Main Campus', '{"en", "nl"}', 'verified'),
  ('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Olivia', 'bachelor', 'Industrial Design', 'Main Campus', '{"en", "nl"}', 'verified'),
  ('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Lucas', 'master', 'Economics', 'Woudestein', '{"en", "nl"}', 'verified');

-- Insert questionnaire items
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
  ('guests_frequency', 'lifestyle', 'slider', '{"min": 0, "max": 10, "step": 1}', 1.0, false),
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

-- Insert sample responses
INSERT INTO responses (user_id, question_key, value) VALUES
  -- Emma's responses
  ('750e8400-e29b-41d4-a716-446655440001', 'degree_level', '"master"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'program', '"Computer Science"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'campus', '"Science Park"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'budget_min', '"600"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'budget_max', '"900"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'commute_max', '"30"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'sleep_start', '"23"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'sleep_end', '"8"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'study_intensity', '8'),
  ('750e8400-e29b-41d4-a716-446655440001', 'cleanliness_room', '8'),
  ('750e8400-e29b-41d4-a716-446655440001', 'cleanliness_kitchen', '7'),
  ('750e8400-e29b-41d4-a716-446655440001', 'noise_tolerance', '6'),
  ('750e8400-e29b-41d4-a716-446655440001', 'guests_frequency', '5'),
  ('750e8400-e29b-41d4-a716-446655440001', 'parties_frequency', '3'),
  ('750e8400-e29b-41d4-a716-446655440001', 'social_level', '7'),
  ('750e8400-e29b-41d4-a716-446655440001', 'extraversion', '6'),
  ('750e8400-e29b-41d4-a716-446655440001', 'agreeableness', '8'),
  ('750e8400-e29b-41d4-a716-446655440001', 'conscientiousness', '9'),
  ('750e8400-e29b-41d4-a716-446655440001', 'neuroticism', '3'),
  ('750e8400-e29b-41d4-a716-446655440001', 'openness', '8'),
  ('750e8400-e29b-41d4-a716-446655440001', 'languages_daily', '["en", "nl"]'),
  ('750e8400-e29b-41d4-a716-446655440001', 'smoking', 'false'),
  ('750e8400-e29b-41d4-a716-446655440001', 'pets_allowed', 'true'),
  
  -- Liam's responses
  ('750e8400-e29b-41d4-a716-446655440002', 'degree_level', '"bachelor"'),
  ('750e8400-e29b-41d4-a716-446655440002', 'program', '"Psychology"'),
  ('750e8400-e29b-41d4-a716-446655440002', 'campus', '"Roeterseiland"'),
  ('750e8400-e29b-41d4-a716-446655440001', 'budget_min', '"500"'),
  ('750e8400-e29b-41d4-a716-446655440002', 'budget_max', '"800"'),
  ('750e8400-e29b-41d4-a716-446655440002', 'commute_max', '"45"'),
  ('750e8400-e29b-41d4-a716-446655440002', 'sleep_start', '"22"'),
  ('750e8400-e29b-41d4-a716-446655440002', 'sleep_end', '"7"'),
  ('750e8400-e29b-41d4-a716-446655440002', 'study_intensity', '6'),
  ('750e8400-e29b-41d4-a716-446655440002', 'cleanliness_room', '6'),
  ('750e8400-e29b-41d4-a716-446655440002', 'cleanliness_kitchen', '5'),
  ('750e8400-e29b-41d4-a716-446655440002', 'noise_tolerance', '7'),
  ('750e8400-e29b-41d4-a716-446655440002', 'guests_frequency', '6'),
  ('750e8400-e29b-41d4-a716-446655440002', 'parties_frequency', '4'),
  ('750e8400-e29b-41d4-a716-446655440002', 'social_level', '8'),
  ('750e8400-e29b-41d4-a716-446655440002', 'extraversion', '7'),
  ('750e8400-e29b-41d4-a716-446655440002', 'agreeableness', '9'),
  ('750e8400-e29b-41d4-a716-446655440002', 'conscientiousness', '7'),
  ('750e8400-e29b-41d4-a716-446655440002', 'neuroticism', '4'),
  ('750e8400-e29b-41d4-a716-446655440002', 'openness', '7'),
  ('750e8400-e29b-41d4-a716-446655440002', 'languages_daily', '["en", "nl"]'),
  ('750e8400-e29b-41d4-a716-446655440002', 'smoking', 'false'),
  ('750e8400-e29b-41d4-a716-446655440002', 'pets_allowed', 'true'),
  
  -- Noah's responses (TU Delft)
  ('750e8400-e29b-41d4-a716-446655440004', 'degree_level', '"master"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'program', '"Aerospace Engineering"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'campus', '"Main Campus"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'budget_min', '"700"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'budget_max', '"1000"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'commute_max', '"30"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'sleep_start', '"23"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'sleep_end', '"8"'),
  ('750e8400-e29b-41d4-a716-446655440004', 'study_intensity', '9'),
  ('750e8400-e29b-41d4-a716-446655440004', 'cleanliness_room', '9'),
  ('750e8400-e29b-41d4-a716-446655440004', 'cleanliness_kitchen', '8'),
  ('750e8400-e29b-41d4-a716-446655440004', 'noise_tolerance', '5'),
  ('750e8400-e29b-41d4-a716-446655440004', 'guests_frequency', '4'),
  ('750e8400-e29b-41d4-a716-446655440004', 'parties_frequency', '2'),
  ('750e8400-e29b-41d4-a716-446655440004', 'social_level', '5'),
  ('750e8400-e29b-41d4-a716-446655440004', 'extraversion', '4'),
  ('750e8400-e29b-41d4-a716-446655440004', 'agreeableness', '7'),
  ('750e8400-e29b-41d4-a716-446655440004', 'conscientiousness', '9'),
  ('750e8400-e29b-41d4-a716-446655440004', 'neuroticism', '3'),
  ('750e8400-e29b-41d4-a716-446655440004', 'openness', '6'),
  ('750e8400-e29b-41d4-a716-446655440004', 'languages_daily', '["en", "nl"]'),
  ('750e8400-e29b-41d4-a716-446655440004', 'smoking', 'false'),
  ('750e8400-e29b-41d4-a716-446655440004', 'pets_allowed', 'false');

-- Generate user vectors (simplified for seed data)
INSERT INTO user_vectors (user_id, vector) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', array_fill(0.5, ARRAY[50])::vector),
  ('750e8400-e29b-41d4-a716-446655440002', array_fill(0.6, ARRAY[50])::vector),
  ('750e8400-e29b-41d4-a716-446655440003', array_fill(0.7, ARRAY[50])::vector),
  ('750e8400-e29b-41d4-a716-446655440004', array_fill(0.4, ARRAY[50])::vector),
  ('750e8400-e29b-41d4-a716-446655440005', array_fill(0.8, ARRAY[50])::vector),
  ('750e8400-e29b-41d4-a716-446655440006', array_fill(0.5, ARRAY[50])::vector);

-- Insert sample announcements
INSERT INTO announcements (university_id, title, body, starts_at, ends_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Welcome to UvA Roommate Match!', 
   'We are excited to help you find your perfect roommate. Complete your profile and questionnaire to get started with matching!', 
   NOW(), NOW() + INTERVAL '30 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'TU Delft Housing Support', 
   'Need help with housing? Check out our resources and connect with fellow students through roommate matching.', 
   NOW(), NOW() + INTERVAL '30 days');

-- Insert eligibility rules
INSERT INTO eligibility_rules (university_id, domain_allowlist) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '{"student.uva.nl", "uva.nl"}'),
  ('550e8400-e29b-41d4-a716-446655440002', '{"student.tudelft.nl", "tudelft.nl"}'),
  ('550e8400-e29b-41d4-a716-446655440003', '{"student.eur.nl", "eur.nl"}');

-- Insert sample forum posts
INSERT INTO forum_posts (university_id, author_id, title, body, is_anonymous) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 
   'Best areas to live near Science Park?', 
   'Looking for recommendations on neighborhoods close to Science Park campus. Any insights on public transport and amenities?', false),
  ('550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 
   'Moving to Amsterdam - tips needed', 
   'First time moving to Amsterdam, any tips for international students?', false);

-- Insert sample app events
INSERT INTO app_events (user_id, name, props) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'profile_completed', '{"sections_completed": 5}'),
  ('750e8400-e29b-41d4-a716-446655440002', 'questionnaire_started', '{"section": "basics"}'),
  ('750e8400-e29b-41d4-a716-446655440003', 'verification_completed', '{"method": "id_upload"}'),
  ('750e8400-e29b-41d4-a716-446655440004', 'match_viewed', '{"match_id": "sample_match_1"}');
