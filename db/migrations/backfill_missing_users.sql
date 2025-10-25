-- Backfill users table for any auth.users that don't have a corresponding users record
INSERT INTO public.users (id, email, is_active, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  true,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
