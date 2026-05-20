-- Add score drift observability to match consistency checks (sample-based, no full recompute)

CREATE OR REPLACE FUNCTION public.check_match_suggestions_consistency()
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

    -- Issue 5: Declined but all members accepted
    SELECT
        'declined_but_all_accepted'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'status', status,
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
    GROUP BY 1

    UNION ALL

    -- Issue 6: fit_index / fit_score internal inconsistency
    SELECT
        'fit_index_fit_score_mismatch'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'fit_index', fit_index,
                    'fit_score', fit_score
                )
            )
        )
    FROM match_suggestions
    WHERE kind = 'pair'
    AND fit_index IS NOT NULL
    AND fit_score IS NOT NULL
    AND ABS(fit_index - ROUND(fit_score * 100)) > 1
    GROUP BY 1

    UNION ALL

    -- Issue 7: Missing or zero scores on active pending/accepted suggestions (staleness signal)
    SELECT
        'missing_or_zero_fit_score'::TEXT,
        COUNT(*)::BIGINT,
        jsonb_build_object(
            'suggestions', jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'status', status,
                    'fit_index', fit_index,
                    'fit_score', fit_score,
                    'created_at', created_at
                )
            )
        )
    FROM match_suggestions
    WHERE kind = 'pair'
    AND status IN ('pending', 'accepted')
    AND (fit_index IS NULL OR fit_index = 0 OR fit_score IS NULL OR fit_score = 0)
    AND expires_at > NOW()
    GROUP BY 1;
END;
$$;

COMMENT ON FUNCTION public.check_match_suggestions_consistency() IS
  'Checks match_suggestions status integrity and stored score snapshot health (no live recompute).';
