-- Migration: Add consistency check function for match_suggestions
-- Date: 2024-12-XX
-- Description: Creates functions to check and fix data inconsistencies
-- Can be called periodically via cron job to ensure data integrity

-- Function to check for and report inconsistencies
CREATE OR REPLACE FUNCTION check_match_suggestions_consistency()
RETURNS TABLE (
    issue_type TEXT,
    issue_count BIGINT,
    issue_details JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    
    -- Issue 1: Confirmed matches where not all members have accepted
    SELECT 
        'confirmed_not_all_accepted'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'member_ids', member_ids,
                    'accepted_by', accepted_by,
                    'member_count', array_length(member_ids, 1),
                    'accepted_count', array_length(accepted_by, 1)
                )
            )
        )
    FROM match_suggestions
    WHERE status = 'confirmed'
    AND (
        accepted_by IS NULL
        OR array_length(accepted_by, 1) != array_length(member_ids, 1)
        OR NOT (
            SELECT bool_and(member_id = ANY(accepted_by))
            FROM unnest(member_ids) AS member_id
        )
    )
    GROUP BY 1
    
    UNION ALL
    
    -- Issue 2: Accepted matches where all members have accepted (should be confirmed)
    SELECT 
        'all_accepted_not_confirmed'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'member_ids', member_ids,
                    'accepted_by', accepted_by,
                    'created_at', created_at
                )
            )
        )
    FROM match_suggestions
    WHERE status = 'accepted'
    AND accepted_by IS NOT NULL
    AND member_ids IS NOT NULL
    AND array_length(accepted_by, 1) = array_length(member_ids, 1)
    AND array_length(member_ids, 1) >= 2
    AND (
        SELECT bool_and(member_id = ANY(accepted_by))
        FROM unnest(member_ids) AS member_id
    ) = true
    GROUP BY 1
    
    UNION ALL
    
    -- Issue 3: accepted_by contains IDs not in member_ids
    SELECT 
        'invalid_accepted_by_ids'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'member_ids', member_ids,
                    'accepted_by', accepted_by,
                    'invalid_ids', (
                        SELECT jsonb_agg(id)
                        FROM unnest(accepted_by) AS id
                        WHERE id != ALL(member_ids)
                    )
                )
            )
        )
    FROM match_suggestions
    WHERE accepted_by IS NOT NULL
    AND member_ids IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM unnest(accepted_by) AS id
        WHERE id != ALL(member_ids)
    )
    GROUP BY 1
    
    UNION ALL
    
    -- Issue 4: Duplicate member IDs
    SELECT 
        'duplicate_member_ids'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'member_ids', member_ids,
                    'member_count', array_length(member_ids, 1),
                    'unique_count', (
                        SELECT COUNT(DISTINCT id)
                        FROM unnest(member_ids) AS id
                    )
                )
            )
        )
    FROM match_suggestions
    WHERE member_ids IS NOT NULL
    AND array_length(member_ids, 1) > (
        SELECT COUNT(DISTINCT id)
        FROM unnest(member_ids) AS id
    )
    GROUP BY 1
    
    UNION ALL
    
    -- Issue 5: Declined matches where all members have accepted (shouldn't happen)
    SELECT 
        'declined_but_all_accepted'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'member_ids', member_ids,
                    'accepted_by', accepted_by
                )
            )
        )
    FROM match_suggestions
    WHERE status = 'declined'
    AND accepted_by IS NOT NULL
    AND member_ids IS NOT NULL
    AND array_length(accepted_by, 1) = array_length(member_ids, 1)
    AND (
        SELECT bool_and(member_id = ANY(accepted_by))
        FROM unnest(member_ids) AS member_id
    ) = true
    GROUP BY 1;
END;
$$;

-- Function to automatically fix common issues
CREATE OR REPLACE FUNCTION fix_match_suggestions_consistency()
RETURNS TABLE (
    action TEXT,
    fixed_count INTEGER,
    details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    fixed_accepted INTEGER := 0;
    fixed_accepted_by INTEGER := 0;
    v_result RECORD;
BEGIN
    -- Fix 1: Update accepted matches where all members have accepted to confirmed
    WITH to_fix AS (
        SELECT id
        FROM match_suggestions
        WHERE status = 'accepted'
        AND accepted_by IS NOT NULL
        AND member_ids IS NOT NULL
        AND array_length(accepted_by, 1) = array_length(member_ids, 1)
        AND array_length(member_ids, 1) >= 2
        AND (
            SELECT bool_and(member_id = ANY(accepted_by))
            FROM unnest(member_ids) AS member_id
        ) = true
    )
    UPDATE match_suggestions
    SET status = 'confirmed'
    WHERE id IN (SELECT id FROM to_fix);
    
    GET DIAGNOSTICS fixed_accepted = ROW_COUNT;
    
    -- Fix 2: Remove invalid IDs from accepted_by
    -- This is more complex, so we'll update each one individually
    FOR v_result IN 
        SELECT 
            id,
            member_ids,
            accepted_by,
            ARRAY(
                SELECT id
                FROM unnest(accepted_by) AS id
                WHERE id = ANY(member_ids)
            ) AS cleaned_accepted_by
        FROM match_suggestions
        WHERE accepted_by IS NOT NULL
        AND member_ids IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM unnest(accepted_by) AS id
            WHERE id != ALL(member_ids)
        )
    LOOP
        UPDATE match_suggestions
        SET accepted_by = v_result.cleaned_accepted_by
        WHERE id = v_result.id;
        
        fixed_accepted_by := fixed_accepted_by + 1;
    END LOOP;
    
    -- Return results
    RETURN QUERY SELECT 
        'updated_accepted_to_confirmed'::TEXT,
        fixed_accepted,
        jsonb_build_object('fixed', fixed_accepted);
    
    RETURN QUERY SELECT
        'cleaned_invalid_accepted_by'::TEXT,
        fixed_accepted_by,
        jsonb_build_object('fixed', fixed_accepted_by);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_match_suggestions_consistency() TO authenticated;
GRANT EXECUTE ON FUNCTION fix_match_suggestions_consistency() TO authenticated;

-- Add comments
COMMENT ON FUNCTION check_match_suggestions_consistency IS 'Checks for data inconsistencies in match_suggestions table. Returns issues grouped by type.';
COMMENT ON FUNCTION fix_match_suggestions_consistency IS 'Automatically fixes common data consistency issues in match_suggestions table. Safe to run periodically.';
