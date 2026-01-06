-- Check which notifications still have names and why they weren't updated

SELECT 
  n.id,
  n.user_id,
  n.message,
  n.created_at,
  n.metadata->>'match_id' as match_id_from_metadata,
  -- Check if it's a suggestion ID
  ms_suggestion.id as suggestion_id,
  ms_suggestion.status as suggestion_status,
  ms_suggestion.accepted_by as suggestion_accepted_by,
  ms_suggestion.member_ids as suggestion_member_ids,
  -- Check if it's a match ID
  m_match.id as match_id,
  m_match.a_user as match_a_user,
  m_match.b_user as match_b_user,
  -- Determine why it wasn't updated
  CASE
    WHEN ms_suggestion.id IS NOT NULL AND ms_suggestion.status = 'confirmed' 
      AND ms_suggestion.accepted_by IS NOT NULL
      AND array_length(ms_suggestion.accepted_by, 1) >= 2
      AND ms_suggestion.member_ids[1] = ANY(ms_suggestion.accepted_by)
      AND ms_suggestion.member_ids[2] = ANY(ms_suggestion.accepted_by)
    THEN 'LEGITIMATE - Both users accepted (confirmed suggestion)'
    WHEN ms_suggestion.id IS NOT NULL
    THEN 'SHOULD BE FIXED - Suggestion exists but not confirmed or not both accepted'
    WHEN m_match.id IS NOT NULL
    THEN 'SHOULD BE FIXED - Match exists but no confirmed suggestion found'
    ELSE 'UNKNOWN - No suggestion or match found'
  END as status_reason
FROM notifications n
LEFT JOIN match_suggestions ms_suggestion ON n.metadata->>'match_id' = ms_suggestion.id::text
LEFT JOIN matches m_match ON n.metadata->>'match_id' = m_match.id::text
WHERE n.type = 'match_created'
  AND n.message LIKE '%You have a new match with%'
  AND n.message NOT LIKE '%someone%'
ORDER BY n.created_at DESC;

