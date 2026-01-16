-- Migration: Auto-confirm matches when all members have accepted
-- This trigger ensures that match_suggestions are automatically updated to 'confirmed'
-- status when all members have accepted, preventing the issue from occurring in the future
--
-- This is a preventive measure that runs automatically at the database level,
-- so even if the API code has issues, the database will ensure consistency

-- Function to auto-confirm matches when all members accept
CREATE OR REPLACE FUNCTION auto_confirm_match_on_accept()
RETURNS TRIGGER AS $$
DECLARE
    all_accepted BOOLEAN := false;
BEGIN
    -- Only process if status is 'accepted' or 'pending'
    -- (Don't override 'confirmed', 'declined', or 'expired')
    IF NEW.status NOT IN ('accepted', 'pending') THEN
        RETURN NEW;
    END IF;
    
    -- Check if all members have accepted
    IF NEW.accepted_by IS NOT NULL 
       AND NEW.member_ids IS NOT NULL
       AND array_length(NEW.accepted_by, 1) = array_length(NEW.member_ids, 1)
       AND array_length(NEW.member_ids, 1) >= 2 THEN
        
        -- Verify that every member_id is in accepted_by
        SELECT bool_and(member_id = ANY(NEW.accepted_by))
        INTO all_accepted
        FROM unnest(NEW.member_ids) AS member_id;
        
        -- If all members have accepted, update status to 'confirmed'
        IF all_accepted THEN
            NEW.status := 'confirmed';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-confirm on INSERT
DROP TRIGGER IF EXISTS trigger_auto_confirm_match_insert ON match_suggestions;
CREATE TRIGGER trigger_auto_confirm_match_insert
    BEFORE INSERT ON match_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_match_on_accept();

-- Create trigger to auto-confirm on UPDATE (when accepted_by changes)
DROP TRIGGER IF EXISTS trigger_auto_confirm_match_update ON match_suggestions;
CREATE TRIGGER trigger_auto_confirm_match_update
    BEFORE UPDATE ON match_suggestions
    FOR EACH ROW
    WHEN (
        -- Only trigger when accepted_by or status changes
        (OLD.accepted_by IS DISTINCT FROM NEW.accepted_by)
        OR (OLD.status IS DISTINCT FROM NEW.status)
    )
    EXECUTE FUNCTION auto_confirm_match_on_accept();

-- Add comment
COMMENT ON FUNCTION auto_confirm_match_on_accept IS 'Automatically updates match_suggestion status to confirmed when all members have accepted. This prevents the issue where matches remain in accepted status even when both users have accepted.';
