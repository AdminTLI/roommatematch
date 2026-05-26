-- Institution Admin Profiles
-- Contact / organisation metadata for invited institution-scoped admins.
-- Separate from student `profiles` to keep admin PII isolated.

BEGIN;

CREATE TABLE IF NOT EXISTS public.institution_admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.universities (id) ON DELETE RESTRICT,
  first_name text NOT NULL,
  last_name text NOT NULL,
  job_title text NOT NULL,
  work_email text NOT NULL,
  phone text,
  department text,
  topics text[] DEFAULT '{}',
  notes_for_support text,
  contact_consent boolean NOT NULL DEFAULT false,
  contact_consent_at timestamptz,
  privacy_notice_accepted_at timestamptz NOT NULL,
  terms_accepted_at timestamptz,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institution_admin_profiles_institution_id
  ON public.institution_admin_profiles (institution_id);

ALTER TABLE public.institution_admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Institution admins manage own profile" ON public.institution_admin_profiles;
CREATE POLICY "Institution admins manage own profile"
  ON public.institution_admin_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins manage institution admin profiles" ON public.institution_admin_profiles;
CREATE POLICY "Super admins manage institution admin profiles"
  ON public.institution_admin_profiles
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

CREATE OR REPLACE FUNCTION public.touch_institution_admin_profile_updated_at()
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

DROP TRIGGER IF EXISTS trg_institution_admin_profiles_touch ON public.institution_admin_profiles;
CREATE TRIGGER trg_institution_admin_profiles_touch
  BEFORE UPDATE ON public.institution_admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_institution_admin_profile_updated_at();

COMMENT ON TABLE public.institution_admin_profiles IS
  'Contact and organisation metadata for institution-scoped admins (directors, housing staff, etc.).';

COMMIT;
