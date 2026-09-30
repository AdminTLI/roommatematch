-- Persist cohort (student | professional) chosen at sign-up onto public.users
-- so onboarding can skip /onboarding/path when user_type is already set.
--
-- Source of truth at insert time: auth.users.raw_user_meta_data->>'user_type'
-- (passed via supabase.auth.signUp({ options: { data: { user_type } } })).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_type text;
BEGIN
  v_user_type := NULLIF(lower(btrim(COALESCE(NEW.raw_user_meta_data->>'user_type', ''))), '');

  IF v_user_type IS DISTINCT FROM 'student' AND v_user_type IS DISTINCT FROM 'professional' THEN
    v_user_type := NULL;
  END IF;

  INSERT INTO public.users (id, email, user_type, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    v_user_type,
    true,
    public.now(),
    public.now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(EXCLUDED.email, public.users.email),
    -- Only fill user_type when the existing row has none (do not overwrite later choices)
    user_type = COALESCE(public.users.user_type, EXCLUDED.user_type),
    updated_at = public.now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Error in handle_new_user trigger: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates public.users on auth signup; copies user_type from raw_user_meta_data when student|professional.';
