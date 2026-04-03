-- Verify that dimension values actually vary between different users
-- If all users have the same dimension values, that explains the clustering

-- Check dimension values for 3 different users
SELECT 
  'User A dimensions' as user_label,
  public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111101'::uuid) as cleanliness,
  public.get_noise_dimension('11111111-1111-4111-8111-111111111101'::uuid) as noise,
  public.get_guests_dimension('11111111-1111-4111-8111-111111111101'::uuid) as guests,
  public.get_sleep_dimension('11111111-1111-4111-8111-111111111101'::uuid) as sleep,
  public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111101'::uuid) as shared_spaces,
  public.get_substances_dimension('11111111-1111-4111-8111-111111111101'::uuid) as substances,
  public.get_study_social_dimension('11111111-1111-4111-8111-111111111101'::uuid) as study_social,
  public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111101'::uuid) as home_vibe
UNION ALL
SELECT 
  'User B dimensions' as user_label,
  public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111102'::uuid) as cleanliness,
  public.get_noise_dimension('11111111-1111-4111-8111-111111111102'::uuid) as noise,
  public.get_guests_dimension('11111111-1111-4111-8111-111111111102'::uuid) as guests,
  public.get_sleep_dimension('11111111-1111-4111-8111-111111111102'::uuid) as sleep,
  public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111102'::uuid) as shared_spaces,
  public.get_substances_dimension('11111111-1111-4111-8111-111111111102'::uuid) as substances,
  public.get_study_social_dimension('11111111-1111-4111-8111-111111111102'::uuid) as study_social,
  public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111102'::uuid) as home_vibe
UNION ALL
SELECT 
  'User C dimensions' as user_label,
  public.get_cleanliness_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as cleanliness,
  public.get_noise_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as noise,
  public.get_guests_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as guests,
  public.get_sleep_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as sleep,
  public.get_shared_spaces_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as shared_spaces,
  public.get_substances_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as substances,
  public.get_study_social_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as study_social,
  public.get_home_vibe_dimension((SELECT id FROM auth.users WHERE id NOT IN ('11111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111102'::uuid) LIMIT 1)) as home_vibe;






