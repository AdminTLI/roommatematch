-- Pairwise RPCs had search_path = '' with unqualified table names,
-- so progress always looked like 0/0 and unlock checks were wrong.
CREATE OR REPLACE FUNCTION public.get_pairwise_match_progress(p_chat_id UUID)
RETURNS TABLE (
  total_pairs INTEGER,
  accepted_pairs INTEGER,
  pending_pairs INTEGER,
  rejected_pairs INTEGER
)
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_pairs,
    COUNT(*) FILTER (WHERE status = 'accepted')::INTEGER as accepted_pairs,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_pairs,
    COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER as rejected_pairs
  FROM public.group_pairwise_matches
  WHERE chat_id = p_chat_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_group_unlock(p_chat_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  pending_count INTEGER;
  rejected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pending_count
  FROM public.group_pairwise_matches
  WHERE chat_id = p_chat_id AND status = 'pending';

  SELECT COUNT(*) INTO rejected_count
  FROM public.group_pairwise_matches
  WHERE chat_id = p_chat_id AND status = 'rejected';

  RETURN pending_count = 0 AND rejected_count = 0;
END;
$$;
