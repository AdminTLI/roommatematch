-- Seed question items for matching algorithm
INSERT INTO question_items (key, section, type, weight, is_hard) VALUES
  -- Lifestyle (high weight)
  ('sleep_start', 'lifestyle', 'slider', 1.0, false),
  ('sleep_end', 'lifestyle', 'slider', 1.0, false),
  ('cleanliness_room', 'lifestyle', 'slider', 1.0, false),
  ('cleanliness_kitchen', 'lifestyle', 'slider', 1.0, false),
  ('noise_tolerance', 'lifestyle', 'slider', 1.0, false),
  ('study_intensity', 'lifestyle', 'slider', 1.0, false),
  
  -- Social (medium weight)
  ('guests_frequency', 'social', 'slider', 1.0, false),
  ('parties_frequency', 'social', 'slider', 1.0, false),
  ('social_level', 'social', 'slider', 1.0, false),
  ('food_sharing', 'social', 'slider', 1.0, false),
  ('utensils_sharing', 'social', 'slider', 1.0, false),
  
  -- Personality (high weight)
  ('extraversion', 'personality', 'slider', 1.0, false),
  ('agreeableness', 'personality', 'slider', 1.0, false),
  ('conscientiousness', 'personality', 'slider', 1.0, false),
  ('neuroticism', 'personality', 'slider', 1.0, false),
  ('openness', 'personality', 'slider', 1.0, false),
  
  -- Communication
  ('conflict_style', 'communication', 'slider', 1.0, false),
  ('communication_preference', 'communication', 'slider', 1.0, false),
  
  -- Deal-breakers
  ('smoking', 'dealbreakers', 'boolean', 1.0, true),
  ('pets_allowed', 'dealbreakers', 'boolean', 1.0, true),
  ('alcohol_at_home', 'dealbreakers', 'slider', 1.0, false),
  ('chores_preference', 'lifestyle', 'slider', 1.0, false),
  ('pets_tolerance', 'dealbreakers', 'slider', 1.0, false)
ON CONFLICT (key) DO NOTHING;
