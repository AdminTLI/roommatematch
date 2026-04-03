-- Cached Gemini-generated roommate compatibility blurbs per unordered user pair.
-- Written by server routes using the Supabase service role; not exposed to clients.

CREATE TABLE IF NOT EXISTS public.match_pair_ai_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_low_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  user_high_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  explanation_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT match_pair_ai_explanations_distinct CHECK (user_low_id <> user_high_id),
  UNIQUE (user_low_id, user_high_id)
);

COMMENT ON TABLE public.match_pair_ai_explanations IS
  'Cached AI-generated compatibility explanations for user pairs (Gemini). Canonical order: user_low_id < user_high_id textually.';

CREATE INDEX IF NOT EXISTS idx_match_pair_ai_explanations_pair
  ON public.match_pair_ai_explanations (user_low_id, user_high_id);

ALTER TABLE public.match_pair_ai_explanations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage match pair AI explanations"
  ON public.match_pair_ai_explanations;

CREATE POLICY "Service role can manage match pair AI explanations"
  ON public.match_pair_ai_explanations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
