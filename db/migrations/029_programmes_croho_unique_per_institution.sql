-- CROHO identifies a national programme type, not a single university offering.
-- Allow the same croho_code at multiple institutions; uniqueness is per institution.

DROP INDEX IF EXISTS public.idx_programmes_croho_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_programmes_institution_croho_unique
  ON public.programmes (institution_slug, croho_code)
  WHERE croho_code IS NOT NULL;

COMMENT ON INDEX public.idx_programmes_institution_croho_unique IS
  'CROHO is unique per institution offering, not globally';

ALTER TABLE public.programs DROP CONSTRAINT IF EXISTS programs_croho_code_key;
DROP INDEX IF EXISTS public.programs_croho_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_programs_university_croho_unique
  ON public.programs (university_id, croho_code)
  WHERE croho_code IS NOT NULL;

ALTER TABLE public.programmes DROP CONSTRAINT IF EXISTS programmes_rio_code_key;
DROP INDEX IF EXISTS public.programmes_rio_code_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_programmes_institution_rio_unique
  ON public.programmes (institution_slug, rio_code)
  WHERE rio_code IS NOT NULL;
