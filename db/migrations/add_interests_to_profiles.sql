-- Add interests column to profiles table
-- This allows users to store their hobbies and interests as an array of strings

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN profiles.interests IS 'User interests/hobbies as an array of strings';

