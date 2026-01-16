-- Fix: Update all match_suggestions that should be confirmed but aren't
-- This fixes existing matches where all members have accepted but status is still 'accepted'
-- Handles both pair and group matches

-- Update to 'confirmed' all suggestions (pair or group) where:
-- - Status is 'accepted' (not already confirmed)
-- - All members have accepted (accepted_by count = member_ids count)
-- - At least 2 members
UPDATE match_suggestions
SET status = 'confirmed'
WHERE status = 'accepted'
AND accepted_by IS NOT NULL
AND member_ids IS NOT NULL
AND array_length(accepted_by, 1) = array_length(member_ids, 1)
AND array_length(member_ids, 1) >= 2
-- Verify that every member_id is in accepted_by
AND (
    SELECT bool_and(member_id = ANY(accepted_by))
    FROM unnest(member_ids) AS member_id
) = true;
