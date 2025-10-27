-- Add missing columns to profiles table
-- These columns exist in the complete schema but are missing from the deployed schema

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.last_name IS 'User last name';
COMMENT ON COLUMN profiles.phone IS 'User phone number';
COMMENT ON COLUMN profiles.bio IS 'User bio/description';