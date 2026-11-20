-- Allow multiple applications to the same listing from one user
-- (different roommate parties), while keeping one active individual apply.

ALTER TABLE public.housing_applications
  DROP CONSTRAINT IF EXISTS housing_applications_listing_id_user_id_key;

-- At most one active solo application per user per listing
CREATE UNIQUE INDEX IF NOT EXISTS housing_applications_one_individual_per_listing
  ON public.housing_applications (listing_id, user_id)
  WHERE application_type = 'individual'
    AND status IS DISTINCT FROM 'withdrawn';

-- Same housing group chat cannot apply twice while the prior app is active
CREATE UNIQUE INDEX IF NOT EXISTS housing_applications_one_group_chat_per_listing
  ON public.housing_applications (listing_id, user_id, chat_id)
  WHERE application_type = 'group'
    AND chat_id IS NOT NULL
    AND status IS DISTINCT FROM 'withdrawn';

-- Same ad-hoc party (sorted group_members) cannot re-apply while active
CREATE UNIQUE INDEX IF NOT EXISTS housing_applications_one_party_per_listing
  ON public.housing_applications (listing_id, user_id, group_members)
  WHERE application_type = 'group'
    AND status IS DISTINCT FROM 'withdrawn';

CREATE INDEX IF NOT EXISTS housing_applications_listing_user_type_idx
  ON public.housing_applications (listing_id, user_id, application_type);
