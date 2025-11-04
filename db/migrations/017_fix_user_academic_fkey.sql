-- Fix user_academic foreign key to reference public.users instead of auth.users
-- This allows PostgREST to see the relationship for API joins

-- Drop existing constraint that references auth.users
ALTER TABLE user_academic 
DROP CONSTRAINT IF EXISTS user_academic_user_id_fkey;

-- Add new constraint that references public.users
ALTER TABLE user_academic 
ADD CONSTRAINT user_academic_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add comment explaining the change
COMMENT ON CONSTRAINT user_academic_user_id_fkey ON user_academic IS 
'References public.users instead of auth.users so PostgREST can expose the relationship';
