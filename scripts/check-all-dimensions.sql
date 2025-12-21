-- Check what dimension values are actually being returned
-- This will help us see if values are defaulting or if there's limited variation

-- Get all dimension values for user A
SELECT 
  'User A' as user_label,
  'cleanliness' as dimension,
  public.get_cleanliness_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value
UNION ALL
SELECT 
  'User A' as user_label,
  'noise' as dimension,
  public.get_noise_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value
UNION ALL
SELECT 
  'User A' as user_label,
  'guests' as dimension,
  public.get_guests_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value
UNION ALL
SELECT 
  'User A' as user_label,
  'sleep' as dimension,
  public.get_sleep_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value
UNION ALL
SELECT 
  'User A' as user_label,
  'shared_spaces' as dimension,
  public.get_shared_spaces_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value
UNION ALL
SELECT 
  'User A' as user_label,
  'substances' as dimension,
  public.get_substances_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value
UNION ALL
SELECT 
  'User A' as user_label,
  'study_social' as dimension,
  public.get_study_social_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value
UNION ALL
SELECT 
  'User A' as user_label,
  'home_vibe' as dimension,
  public.get_home_vibe_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as value;

