-- Cache AI match explanations per unordered pair *and* reader (viewer), so tone can match cohort.
-- Clears legacy rows (regenerated on next compatibility fetch).

DELETE FROM public.match_pair_ai_explanations;

ALTER TABLE public.match_pair_ai_explanations
  DROP CONSTRAINT IF EXISTS match_pair_ai_explanations_user_low_id_user_high_id_key;

ALTER TABLE public.match_pair_ai_explanations
  ADD COLUMN reader_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE;

ALTER TABLE public.match_pair_ai_explanations
  ADD CONSTRAINT match_pair_ai_explanations_pair_reader_key
  UNIQUE (user_low_id, user_high_id, reader_user_id);
