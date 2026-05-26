-- Fix "Database error saving new user" on Supabase Auth invite
--
-- Root cause: apply_pending_role_assignments runs on auth.users INSERT and
-- inserts into public.admins, which FK's public.users(id). If handle_new_user
-- has not created the users row yet (or failed silently), the trigger aborts
-- the entire auth user insert.
--
-- Fix:
-- 1) Ensure public.users exists before promoting roles.
-- 2) Never fail auth user creation from the auth.users trigger (log + defer).
-- 3) Grant handle_new_user to supabase_auth_admin (auth trigger invoker).

CREATE OR REPLACE FUNCTION public.apply_pending_role_assignments_for_user_id(
  p_user_id uuid,
  p_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_assignment public.admin_role_assignments%ROWTYPE;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN;
  END IF;

  -- admins.user_id references public.users(id) in most environments.
  INSERT INTO public.users (id, email, is_active, created_at, updated_at)
  VALUES (
    p_user_id,
    lower(trim(p_email)),
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  SELECT *
    INTO v_assignment
    FROM public.admin_role_assignments
   WHERE email_normalized = lower(p_email)
     AND status = 'pending'
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.admin_role_assignments
     SET user_id = p_user_id,
         status = 'active',
         activated_at = now(),
         updated_at = now()
   WHERE id = v_assignment.id;

  INSERT INTO public.user_roles (user_id, role)
       VALUES (p_user_id, v_assignment.role)
  ON CONFLICT (user_id) DO UPDATE
       SET role = EXCLUDED.role,
           updated_at = now();

  IF v_assignment.role = 'super_admin' THEN
    DELETE FROM public.admins WHERE user_id = p_user_id;
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (p_user_id, NULL, 'super_admin', now());
  ELSIF v_assignment.role IN ('admin', 'university_admin')
        AND v_assignment.institution_id IS NOT NULL THEN
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (p_user_id, v_assignment.institution_id, 'university_admin', now())
    ON CONFLICT (user_id, university_id) DO UPDATE
         SET role = EXCLUDED.role,
             updated_at = now();
  ELSIF v_assignment.role = 'moderator'
        AND v_assignment.institution_id IS NOT NULL THEN
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (p_user_id, v_assignment.institution_id, 'moderator', now())
    ON CONFLICT (user_id, university_id) DO UPDATE
         SET role = EXCLUDED.role,
             updated_at = now();
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_pending_role_assignments_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  BEGIN
    PERFORM public.apply_pending_role_assignments_for_user_id(NEW.id, NEW.email);
  EXCEPTION
    WHEN OTHERS THEN
      -- Do not block auth.users INSERT (invite/signup). Promotion can be retried
      -- via RPC from the admin API or on email confirmation.
      RAISE WARNING
        'apply_pending_role_assignments_for_user failed for %: % (SQLSTATE: %)',
        NEW.id,
        SQLERRM,
        SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.apply_pending_role_assignments_for_user_id(uuid, text) OWNER TO postgres;
ALTER FUNCTION public.apply_pending_role_assignments_for_user() OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.apply_pending_role_assignments_for_user_id(uuid, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_pending_role_assignments_for_user_id(uuid, text)
  TO postgres;

-- Auth triggers are invoked by supabase_auth_admin; ensure handle_new_user can run.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
  END IF;
END $$;
