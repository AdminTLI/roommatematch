-- Domu Lab: global wish board — all verified students see and vote on all wishes

DROP POLICY IF EXISTS lab_wishes_select_same_uni ON public.lab_wishes;
DROP POLICY IF EXISTS lab_wishes_select_visible ON public.lab_wishes;
CREATE POLICY lab_wishes_select_visible
  ON public.lab_wishes
  FOR SELECT
  TO authenticated
  USING (
    merged_into_id IS NULL
    AND status <> 'wont_do'
  );

DROP POLICY IF EXISTS lab_wish_votes_select ON public.lab_wish_votes;
CREATE POLICY lab_wish_votes_select
  ON public.lab_wish_votes
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.lab_wishes w
      WHERE w.id = lab_wish_votes.wish_id
        AND w.merged_into_id IS NULL
        AND w.status <> 'wont_do'
    )
  );

DROP POLICY IF EXISTS lab_wish_votes_insert_own ON public.lab_wish_votes;
CREATE POLICY lab_wish_votes_insert_own
  ON public.lab_wish_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.lab_wishes w
      WHERE w.id = wish_id
        AND w.merged_into_id IS NULL
        AND w.status IN ('open', 'looking')
        AND w.user_id <> auth.uid()
    )
  );

DROP POLICY IF EXISTS lab_wish_reports_insert_own ON public.lab_wish_reports;
CREATE POLICY lab_wish_reports_insert_own
  ON public.lab_wish_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.lab_wishes w
      WHERE w.id = wish_id
        AND w.merged_into_id IS NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_lab_wishes_global_top_rank
  ON public.lab_wishes (use_this_count DESC, vote_count DESC, created_at DESC)
  WHERE merged_into_id IS NULL AND status NOT IN ('wont_do');
