-- Verify that dimension values actually vary between different users
-- If all users have the same dimension values, that explains the clustering

-- Check dimension values for 3 different users
SELECT 
  'User A dimensions' as user_label,
  public.get_cleanliness_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as cleanliness,
  public.get_noise_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as noise,
  public.get_guests_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as guests,
  public.get_sleep_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as sleep,
  public.get_shared_spaces_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as shared_spaces,
  public.get_substances_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as substances,
  public.get_study_social_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as study_social,
  public.get_home_vibe_dimension('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as home_vibe
UNION ALL
SELECT 
  'User B dimensions' as user_label,
  public.get_cleanliness_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as cleanliness,
  public.get_noise_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as noise,
  public.get_guests_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as guests,
  public.get_sleep_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as sleep,
  public.get_shared_spaces_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as shared_spaces,
  public.get_substances_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as substances,
  public.get_study_social_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as study_social,
  public.get_home_vibe_dimension('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) as home_vibe
UNION ALL
SELECT 
  'User C dimensions' as user_label,
  public.get_cleanliness_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as cleanliness,
  public.get_noise_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as noise,
  public.get_guests_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as guests,
  public.get_sleep_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as sleep,
  public.get_shared_spaces_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as shared_spaces,
  public.get_substances_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as substances,
  public.get_study_social_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as study_social,
  public.get_home_vibe_dimension((SELECT id FROM auth.users WHERE id NOT IN ('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid, '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid) LIMIT 1)) as home_vibe;






