-- Add missing columns to profiles table
-- Add last_name, phone, and bio columns that the user wants

-- Add missing columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);

-- Update the schema comments
COMMENT ON COLUMN profiles.last_name IS 'User last name';
COMMENT ON COLUMN profiles.phone IS 'User phone number';
COMMENT ON COLUMN profiles.bio IS 'User biography/about me text';
