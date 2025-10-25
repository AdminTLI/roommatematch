-- This migration should be run manually in Supabase SQL Editor
-- It will backfill any auth.users that don't have corresponding public.users records

-- First, check the trigger exists and is enabled
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- If trigger is disabled (tgenabled = 'D'), enable it:
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Backfill missing users (this is safe to run multiple times)
INSERT INTO public.users (id, email, is_active, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  true,
  COALESCE(au.created_at, NOW()),
  COALESCE(au.updated_at, NOW())
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the backfill
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as public_users_count,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.users u ON u.id = au.id WHERE u.id IS NULL) as missing_count;
