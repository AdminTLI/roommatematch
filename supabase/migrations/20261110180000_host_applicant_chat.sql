-- Host↔applicant chat link + accepted status (Accept unlocks chat before formal offer)

ALTER TABLE public.housing_applications
  ADD COLUMN IF NOT EXISTS host_chat_id UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS housing_application_id UUID REFERENCES public.housing_applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_housing_applications_host_chat
  ON public.housing_applications(host_chat_id);

CREATE INDEX IF NOT EXISTS idx_chats_housing_application
  ON public.chats(housing_application_id);

ALTER TABLE public.housing_applications DROP CONSTRAINT IF EXISTS housing_applications_status_check;
ALTER TABLE public.housing_applications
  ADD CONSTRAINT housing_applications_status_check
  CHECK (status IN (
    'submitted', 'under_review', 'shortlisted', 'accepted',
    'offer_pending', 'offer_accepted', 'offer_declined',
    'approved', 'rejected', 'withdrawn'
  ));
