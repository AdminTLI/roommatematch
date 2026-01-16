-- Migration: Add database constraints and validation for match_suggestions
-- Date: 2024-12-XX
-- Description: Adds constraints and validation functions to prevent invalid states
-- and ensure data consistency in the match_suggestions system

-- 1. Add check constraint to ensure accepted_by only contains valid member_ids
-- This prevents data corruption where accepted_by contains IDs not in member_ids
CREATE OR REPLACE FUNCTION validate_accepted_by_members()
RETURNS TRIGGER AS $$
DECLARE
    invalid_user_id UUID;
BEGIN
    -- If accepted_by is NULL or empty, it's valid
    IF NEW.accepted_by IS NULL OR array_length(NEW.accepted_by, 1) IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- If member_ids is NULL, we can't validate (shouldn't happen due to NOT NULL constraint)
    IF NEW.member_ids IS NULL THEN
        RAISE EXCEPTION 'member_ids cannot be NULL';
    END IF;
    
    -- Check that every user in accepted_by is also in member_ids
    SELECT id INTO invalid_user_id
    FROM unnest(NEW.accepted_by) AS id
    WHERE id != ALL(NEW.member_ids)
    LIMIT 1;
    
    IF invalid_user_id IS NOT NULL THEN
        RAISE EXCEPTION 'accepted_by contains user_id % that is not in member_ids', invalid_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate accepted_by on insert/update
DROP TRIGGER IF EXISTS trigger_validate_accepted_by_members ON match_suggestions;
CREATE TRIGGER trigger_validate_accepted_by_members
    BEFORE INSERT OR UPDATE ON match_suggestions
    FOR EACH ROW
    WHEN (NEW.accepted_by IS NOT NULL AND NEW.member_ids IS NOT NULL)
    EXECUTE FUNCTION validate_accepted_by_members();

-- 2. Add check constraint to prevent status inconsistencies
-- If status is 'confirmed', all members must be in accepted_by
CREATE OR REPLACE FUNCTION validate_confirmed_status()
RETURNS TRIGGER AS $$
DECLARE
    missing_user_id UUID;
    all_accepted BOOLEAN;
BEGIN
    -- If status is 'confirmed', verify all members have accepted
    IF NEW.status = 'confirmed' THEN
        -- Check that accepted_by is not NULL
        IF NEW.accepted_by IS NULL THEN
            RAISE EXCEPTION 'status cannot be confirmed if accepted_by is NULL';
        END IF;
        
        -- Check that all members are in accepted_by
        IF NEW.member_ids IS NOT NULL THEN
            SELECT bool_and(member_id = ANY(NEW.accepted_by))
            INTO all_accepted
            FROM unnest(NEW.member_ids) AS member_id;
            
            IF NOT all_accepted THEN
                RAISE EXCEPTION 'status cannot be confirmed if not all members are in accepted_by';
            END IF;
            
            -- Also verify counts match
            IF array_length(NEW.accepted_by, 1) != array_length(NEW.member_ids, 1) THEN
                RAISE EXCEPTION 'status cannot be confirmed: accepted_by count (%) does not match member_ids count (%)', 
                    array_length(NEW.accepted_by, 1), 
                    array_length(NEW.member_ids, 1);
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate confirmed status
DROP TRIGGER IF EXISTS trigger_validate_confirmed_status ON match_suggestions;
CREATE TRIGGER trigger_validate_confirmed_status
    BEFORE INSERT OR UPDATE ON match_suggestions
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed')
    EXECUTE FUNCTION validate_confirmed_status();

-- 3. Add constraint to prevent declined status if users have accepted
-- If status is 'declined', accepted_by should not contain all members
CREATE OR REPLACE FUNCTION validate_declined_status()
RETURNS TRIGGER AS $$
DECLARE
    all_accepted BOOLEAN;
BEGIN
    IF NEW.status = 'declined' THEN
        -- If accepted_by contains all members, this shouldn't be declined
        IF NEW.accepted_by IS NOT NULL 
           AND NEW.member_ids IS NOT NULL
           AND array_length(NEW.accepted_by, 1) = array_length(NEW.member_ids, 1) THEN
            
            SELECT bool_and(member_id = ANY(NEW.accepted_by))
            INTO all_accepted
            FROM unnest(NEW.member_ids) AS member_id;
            
            IF all_accepted THEN
                RAISE EXCEPTION 'status cannot be declined if all members have accepted (should be confirmed)';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate declined status
DROP TRIGGER IF EXISTS trigger_validate_declined_status ON match_suggestions;
CREATE TRIGGER trigger_validate_declined_status
    BEFORE INSERT OR UPDATE ON match_suggestions
    FOR EACH ROW
    WHEN (NEW.status = 'declined')
    EXECUTE FUNCTION validate_declined_status();

-- 4. Add check constraint to ensure member_ids has at least 2 members
ALTER TABLE match_suggestions 
    DROP CONSTRAINT IF EXISTS match_suggestions_member_ids_min_length;

ALTER TABLE match_suggestions
    ADD CONSTRAINT match_suggestions_member_ids_min_length 
    CHECK (array_length(member_ids, 1) >= 2);

-- 5. Add check constraint to ensure no duplicate member IDs
CREATE OR REPLACE FUNCTION validate_no_duplicate_members()
RETURNS TRIGGER AS $$
DECLARE
    member_count INTEGER;
    unique_count INTEGER;
BEGIN
    IF NEW.member_ids IS NOT NULL THEN
        member_count := array_length(NEW.member_ids, 1);
        unique_count := (SELECT COUNT(DISTINCT id) FROM unnest(NEW.member_ids) AS id);
        
        IF member_count != unique_count THEN
            RAISE EXCEPTION 'member_ids cannot contain duplicate user IDs';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate no duplicate members
DROP TRIGGER IF EXISTS trigger_validate_no_duplicate_members ON match_suggestions;
CREATE TRIGGER trigger_validate_no_duplicate_members
    BEFORE INSERT OR UPDATE ON match_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION validate_no_duplicate_members();

-- 6. Add comments for documentation
COMMENT ON FUNCTION validate_accepted_by_members IS 'Ensures accepted_by only contains user IDs that are in member_ids';
COMMENT ON FUNCTION validate_confirmed_status IS 'Ensures confirmed status is only set when all members have accepted';
COMMENT ON FUNCTION validate_declined_status IS 'Ensures declined status is not set when all members have accepted';
COMMENT ON FUNCTION validate_no_duplicate_members IS 'Ensures member_ids does not contain duplicate user IDs';
