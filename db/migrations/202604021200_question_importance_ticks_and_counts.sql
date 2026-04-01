-- Per-user “this question matters” ticks + aggregate counts per questionnaire item_id.
-- Counts are maintained by triggers on question_importance_ticks.

CREATE TABLE IF NOT EXISTS public.question_importance_ticks (
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_question_importance_ticks_item_id
  ON public.question_importance_ticks (item_id);

COMMENT ON TABLE public.question_importance_ticks IS 'One row per user per item when the user marks “this topic matters more to me”; used only for product research aggregates.';

CREATE TABLE IF NOT EXISTS public.question_importance_counts (
  item_id TEXT         PRIMARY KEY,
  tick_count BIGINT    NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT question_importance_counts_tick_count_nonnegative CHECK (tick_count >= 0)
);

COMMENT ON TABLE public.question_importance_counts IS 'Denormalized count of distinct users who ticked importance for each item_id; updated by triggers on question_importance_ticks.';

-- Keep counts in sync (SECURITY DEFINER so RLS on counts does not block triggers).
CREATE OR REPLACE FUNCTION public.sync_question_importance_counts ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.question_importance_counts (item_id, tick_count, updated_at)
    VALUES (NEW.item_id, 1, now())
    ON CONFLICT (item_id) DO UPDATE
    SET tick_count = public.question_importance_counts.tick_count + 1,
        updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.question_importance_counts
    SET tick_count = GREATEST(0, tick_count - 1),
        updated_at = now()
    WHERE item_id = OLD.item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_question_importance_counts_ins ON public.question_importance_ticks;
CREATE TRIGGER trg_question_importance_counts_ins
  AFTER INSERT ON public.question_importance_ticks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_question_importance_counts ();

DROP TRIGGER IF EXISTS trg_question_importance_counts_del ON public.question_importance_ticks;
CREATE TRIGGER trg_question_importance_counts_del
  AFTER DELETE ON public.question_importance_ticks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_question_importance_counts ();

-- RLS: users manage only their own ticks; aggregate counts are not exposed to clients.
ALTER TABLE public.question_importance_ticks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_importance_counts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS question_importance_ticks_insert_own ON public.question_importance_ticks;
CREATE POLICY question_importance_ticks_insert_own
  ON public.question_importance_ticks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS question_importance_ticks_select_own ON public.question_importance_ticks;
CREATE POLICY question_importance_ticks_select_own
  ON public.question_importance_ticks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS question_importance_ticks_update_own ON public.question_importance_ticks;
CREATE POLICY question_importance_ticks_update_own
  ON public.question_importance_ticks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS question_importance_ticks_delete_own ON public.question_importance_ticks;
CREATE POLICY question_importance_ticks_delete_own
  ON public.question_importance_ticks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
