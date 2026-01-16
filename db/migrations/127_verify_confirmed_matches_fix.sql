-- Migration: Verify confirmed matches fix
-- Date: 2024-12-XX
-- Description: This migration verifies that all confirmed match fixes are working correctly
-- It checks for any remaining issues and provides diagnostic information

-- 1. Check for any remaining matches that should be confirmed but aren't
-- This should return 0 rows after migrations 118 and 119 are applied
DO $$
DECLARE
    remaining_issues INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_issues
    FROM match_suggestions
    WHERE status = 'accepted'
    AND accepted_by IS NOT NULL
    AND member_ids IS NOT NULL
    AND array_length(accepted_by, 1) = array_length(member_ids, 1)
    AND array_length(member_ids, 1) >= 2
    AND (
        SELECT bool_and(member_id = ANY(accepted_by))
        FROM unnest(member_ids) AS member_id
    ) = true;
    
    IF remaining_issues > 0 THEN
        RAISE WARNING 'Found % match suggestions that should be confirmed but are still in accepted status. Please run migration 118 again or check the trigger.', remaining_issues;
    ELSE
        RAISE NOTICE '✓ All matches that should be confirmed are properly marked as confirmed.';
    END IF;
END $$;

-- 2. Verify the trigger exists and is active
DO $$
DECLARE
    trigger_exists BOOLEAN;
    function_exists BOOLEAN;
BEGIN
    -- Check if the trigger function exists
    SELECT EXISTS(
        SELECT 1 FROM pg_proc 
        WHERE proname = 'auto_confirm_match_on_accept'
    ) INTO function_exists;
    
    IF NOT function_exists THEN
        RAISE WARNING 'Trigger function auto_confirm_match_on_accept does not exist. Migration 119 may not have been applied.';
    ELSE
        RAISE NOTICE '✓ Trigger function auto_confirm_match_on_accept exists.';
    END IF;
    
    -- Check if the triggers exist
    SELECT EXISTS(
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_auto_confirm_match_insert'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        RAISE WARNING 'Trigger trigger_auto_confirm_match_insert does not exist.';
    ELSE
        RAISE NOTICE '✓ Trigger trigger_auto_confirm_match_insert exists.';
    END IF;
    
    SELECT EXISTS(
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_auto_confirm_match_update'
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        RAISE WARNING 'Trigger trigger_auto_confirm_match_update does not exist.';
    ELSE
        RAISE NOTICE '✓ Trigger trigger_auto_confirm_match_update exists.';
    END IF;
END $$;

-- 3. Verify the get_deduplicated_suggestions function includes confirmed matches correctly
DO $$
DECLARE
    function_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_deduplicated_suggestions'
    ) INTO function_exists;
    
    IF NOT function_exists THEN
        RAISE WARNING 'Function get_deduplicated_suggestions does not exist. Migration 114 may not have been applied.';
    ELSE
        RAISE NOTICE '✓ Function get_deduplicated_suggestions exists.';
    END IF;
END $$;

-- 4. Provide summary statistics
DO $$
DECLARE
    total_confirmed INTEGER;
    total_accepted INTEGER;
    total_pending INTEGER;
    total_declined INTEGER;
    pairs_confirmed INTEGER;
    groups_confirmed INTEGER;
BEGIN
    -- Count matches by status
    SELECT COUNT(*) INTO total_confirmed FROM match_suggestions WHERE status = 'confirmed';
    SELECT COUNT(*) INTO total_accepted FROM match_suggestions WHERE status = 'accepted';
    SELECT COUNT(*) INTO total_pending FROM match_suggestions WHERE status = 'pending';
    SELECT COUNT(*) INTO total_declined FROM match_suggestions WHERE status = 'declined';
    
    -- Count confirmed matches by kind
    SELECT COUNT(*) INTO pairs_confirmed FROM match_suggestions WHERE status = 'confirmed' AND kind = 'pair';
    SELECT COUNT(*) INTO groups_confirmed FROM match_suggestions WHERE status = 'confirmed' AND kind = 'group';
    
    RAISE NOTICE '=== Match Suggestions Summary ===';
    RAISE NOTICE 'Total Confirmed: % (Pairs: %, Groups: %)', total_confirmed, pairs_confirmed, groups_confirmed;
    RAISE NOTICE 'Total Accepted: %', total_accepted;
    RAISE NOTICE 'Total Pending: %', total_pending;
    RAISE NOTICE 'Total Declined: %', total_declined;
END $$;

-- 5. Create a view for easy monitoring of confirmed matches
CREATE OR REPLACE VIEW confirmed_matches_summary AS
SELECT 
    kind,
    COUNT(*) as count,
    MIN(created_at) as oldest_confirmed,
    MAX(created_at) as newest_confirmed,
    AVG(array_length(member_ids, 1)) as avg_members
FROM match_suggestions
WHERE status = 'confirmed'
GROUP BY kind;

COMMENT ON VIEW confirmed_matches_summary IS 'Summary view of confirmed matches by kind. Useful for monitoring and verification.';

-- Grant access to authenticated users (optional, adjust based on your RLS policies)
-- GRANT SELECT ON confirmed_matches_summary TO authenticated;
