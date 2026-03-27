-- Fix SECURITY DEFINER helper to use schema-qualified user_roles.
-- Prevents errors when search_path is restricted or differs between contexts.

BEGIN;

CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'::public.user_role
  );
END;
$$;

COMMIT;

