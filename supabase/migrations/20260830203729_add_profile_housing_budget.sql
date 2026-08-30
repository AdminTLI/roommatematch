-- Add housing budget range to profiles (editable from Settings → Housing Status).
-- Used in Match Insights so both users can compare room budgets in euros.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS budget_min integer,
  ADD COLUMN IF NOT EXISTS budget_max integer,
  ADD COLUMN IF NOT EXISTS budget_unknown boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_budget_range_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_budget_range_check
  CHECK (
    budget_unknown = true
    OR budget_min IS NULL
    OR budget_max IS NULL
    OR budget_min <= budget_max
  );

COMMENT ON COLUMN public.profiles.budget_min IS 'Monthly room budget minimum in euros';
COMMENT ON COLUMN public.profiles.budget_max IS 'Monthly room budget maximum in euros';
COMMENT ON COLUMN public.profiles.budget_unknown IS 'True when the user checked that they do not know their budget yet';
