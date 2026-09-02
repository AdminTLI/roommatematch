-- Exact occupancy lookup for university emails.
-- Uses lower(btrim(...)) so mixed-case and padded values match without ILIKE wildcards.

CREATE OR REPLACE FUNCTION public.find_university_email_holder_ids(p_email text)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id
  FROM public.users
  WHERE university_email IS NOT NULL
    AND lower(btrim(university_email)) = lower(btrim(p_email))
  UNION
  SELECT user_id
  FROM public.university_email_claims
  WHERE released_at IS NULL
    AND email_normalized = lower(btrim(p_email));
$$;

REVOKE ALL ON FUNCTION public.find_university_email_holder_ids(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_university_email_holder_ids(text) TO postgres, service_role;

COMMENT ON FUNCTION public.find_university_email_holder_ids(text) IS
  'Returns user ids currently holding a university email via users.university_email or an active claim.';
