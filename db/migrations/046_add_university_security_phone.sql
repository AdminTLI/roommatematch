-- Migration: Add security_phone column to universities table
-- This enables displaying university-specific security/emergency contact numbers

-- Add security_phone column
ALTER TABLE universities 
ADD COLUMN IF NOT EXISTS security_phone VARCHAR(20);

-- Add comment for clarity
COMMENT ON COLUMN universities.security_phone IS 'University security/emergency contact phone number for students';

-- Update existing universities with their security phone numbers
-- University of Amsterdam
UPDATE universities 
SET security_phone = '+31 20 525 9111'
WHERE slug = 'uva' AND security_phone IS NULL;

-- TU Delft (Delft University of Technology)
UPDATE universities 
SET security_phone = '+31 15 27 88888'
WHERE slug = 'tudelft' AND security_phone IS NULL;

-- Erasmus University Rotterdam
UPDATE universities 
SET security_phone = '+31 10 408 1100'
WHERE slug = 'eur' AND security_phone IS NULL;

-- Utrecht University
UPDATE universities 
SET security_phone = '+31 30 253 4444'
WHERE slug = 'uu' AND security_phone IS NULL;

-- Leiden University
UPDATE universities 
SET security_phone = '+31 71 527 7272'
WHERE slug = 'leiden' AND security_phone IS NULL;

-- Avans Hogeschool (if exists)
UPDATE universities 
SET security_phone = '+31 76 523 8000'
WHERE slug = 'avans' AND security_phone IS NULL;

-- Vrije Universiteit Amsterdam (if exists)
UPDATE universities 
SET security_phone = '+31 20 598 2222'
WHERE slug = 'vu' AND security_phone IS NULL;

