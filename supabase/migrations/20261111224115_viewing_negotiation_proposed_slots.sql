-- Viewing negotiation: store multiple proposed time slots until both parties agree

ALTER TABLE public.tour_bookings
  ADD COLUMN IF NOT EXISTS proposed_slots TIMESTAMPTZ[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.tour_bookings.proposed_slots IS
  'Candidate viewing times awaiting agreement. scheduled_for is the primary/highlighted proposal.';

-- Backfill existing rows so hosts/students still see the current scheduled time as a slot
UPDATE public.tour_bookings
SET proposed_slots = ARRAY[scheduled_for]
WHERE cardinality(proposed_slots) = 0
  AND scheduled_for IS NOT NULL;
