-- Admin Role Assignments
-- ----------------------------------------------------------------------------
-- Adds support for Super Admins to manually grant elevated roles (Admin,
-- Super Admin, Moderator, University Admin) by email, with metadata
-- (first/last name, institution, department/title, notes) and an invite
-- flow for emails that have not yet registered.
--
-- New role values are appended to the existing `public.user_role` enum so the
-- existing `user_roles` table can store them without schema breaks.
-- ----------------------------------------------------------------------------

-- 1) Extend user_role enum with `moderator` and `university_admin`
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block in
-- older Postgres versions, so these statements are intentionally OUTSIDE
-- the BEGIN/COMMIT below. Each one is idempotent via IF NOT EXISTS.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'moderator'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'moderator';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'university_admin'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'university_admin';
  END IF;
END $$;

BEGIN;

-- 2) admin_role_assignments table
--    One row per email-to-role grant created manually by a Super Admin.
--    Becomes 'active' once a matching auth user exists; until then it is
--    'pending' and the assignment can drive an invite email.
CREATE TABLE IF NOT EXISTS public.admin_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text GENERATED ALWAYS AS (lower(email)) STORED,
  role public.user_role NOT NULL CHECK (role <> 'user'),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  institution_id uuid REFERENCES public.universities (id) ON DELETE SET NULL,
  department_title text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  invite_sent_at timestamptz,
  activated_at timestamptz,
  assigned_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_admin_role_assignments_email_normalized
  ON public.admin_role_assignments (email_normalized);

CREATE INDEX IF NOT EXISTS idx_admin_role_assignments_user_id
  ON public.admin_role_assignments (user_id);

CREATE INDEX IF NOT EXISTS idx_admin_role_assignments_status
  ON public.admin_role_assignments (status);

-- 3) RLS — only Super Admins may read/write this table
ALTER TABLE public.admin_role_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins manage role assignments" ON public.admin_role_assignments;
CREATE POLICY "Super admins manage role assignments"
  ON public.admin_role_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'::public.user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'::public.user_role
    )
  );

-- 4) Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_admin_role_assignment_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_role_assignments_touch ON public.admin_role_assignments;
CREATE TRIGGER trg_admin_role_assignments_touch
  BEFORE UPDATE ON public.admin_role_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_admin_role_assignment_updated_at();

-- 5) Auto-promotion trigger
--    When a new auth user is created (or an existing one verifies their
--    email), match by lowercased email and promote any pending assignment
--    to 'active'. Also upsert into user_roles and the admins table so the
--    rest of the app sees the elevated role immediately.
CREATE OR REPLACE FUNCTION public.apply_pending_role_assignments_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_assignment public.admin_role_assignments%ROWTYPE;
  v_admins_role text;
BEGIN
  -- Only act when we actually have an email
  IF NEW.email IS NULL OR length(trim(NEW.email)) = 0 THEN
    RETURN NEW;
  END IF;

  SELECT *
    INTO v_assignment
    FROM public.admin_role_assignments
   WHERE email_normalized = lower(NEW.email)
     AND status = 'pending'
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Mark the assignment active and link to the user
  UPDATE public.admin_role_assignments
     SET user_id = NEW.id,
         status = 'active',
         activated_at = now(),
         updated_at = now()
   WHERE id = v_assignment.id;

  -- Upsert platform role
  INSERT INTO public.user_roles (user_id, role)
       VALUES (NEW.id, v_assignment.role)
  ON CONFLICT (user_id) DO UPDATE
       SET role = EXCLUDED.role,
           updated_at = now();

  -- Map platform role onto the admins table contract:
  --   super_admin     -> ('super_admin', university_id = NULL)
  --   university_admin-> ('university_admin', uses institution_id from assignment)
  --   admin           -> ('university_admin', uses institution_id from assignment)
  --   moderator       -> ('moderator', university_id from assignment if any)
  IF v_assignment.role = 'super_admin' THEN
    v_admins_role := 'super_admin';
    DELETE FROM public.admins WHERE user_id = NEW.id;
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (NEW.id, NULL, v_admins_role, now());
  ELSIF v_assignment.role IN ('admin', 'university_admin') THEN
    v_admins_role := 'university_admin';
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (NEW.id, v_assignment.institution_id, v_admins_role, now())
    ON CONFLICT (user_id, university_id) DO UPDATE
         SET role = EXCLUDED.role,
             updated_at = now();
  ELSIF v_assignment.role = 'moderator' THEN
    v_admins_role := 'moderator';
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (NEW.id, v_assignment.institution_id, v_admins_role, now())
    ON CONFLICT (user_id, university_id) DO UPDATE
         SET role = EXCLUDED.role,
             updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_pending_role_assignments_on_user_insert ON auth.users;
CREATE TRIGGER trg_apply_pending_role_assignments_on_user_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_pending_role_assignments_for_user();

-- Run the same logic when an existing user confirms their email (covers
-- pre-existing accounts whose role was assigned later by a Super Admin).
CREATE OR REPLACE FUNCTION public.apply_pending_role_assignments_on_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    PERFORM public.apply_pending_role_assignments_for_user_id(NEW.id, NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

-- Helper used by the confirm trigger and by API endpoints that need to
-- reconcile after creating an admin_role_assignments row for an email
-- that already has a registered user.
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
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN;
  END IF;

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
  ELSIF v_assignment.role IN ('admin', 'university_admin') THEN
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (p_user_id, v_assignment.institution_id, 'university_admin', now())
    ON CONFLICT (user_id, university_id) DO UPDATE
         SET role = EXCLUDED.role,
             updated_at = now();
  ELSIF v_assignment.role = 'moderator' THEN
    INSERT INTO public.admins (user_id, university_id, role, updated_at)
         VALUES (p_user_id, v_assignment.institution_id, 'moderator', now())
    ON CONFLICT (user_id, university_id) DO UPDATE
         SET role = EXCLUDED.role,
             updated_at = now();
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_pending_role_assignments_on_confirm ON auth.users;
CREATE TRIGGER trg_apply_pending_role_assignments_on_confirm
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_pending_role_assignments_on_confirm();

-- 6) Grants — the helper function is also callable via PostgREST from the
--    POST /api/admin/role-assignments endpoint (service_role).
GRANT EXECUTE ON FUNCTION public.apply_pending_role_assignments_for_user_id(uuid, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_pending_role_assignments_for_user_id(uuid, text)
  TO postgres;

COMMENT ON TABLE public.admin_role_assignments IS
  'Manually-created role grants by Super Admins. Drives the new Role Management UI '
  'and auto-promotes the linked auth user (or invitee) into user_roles/admins.';

COMMIT;
