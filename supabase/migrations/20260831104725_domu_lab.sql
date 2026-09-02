-- Domu Lab: university-scoped, text-only feature wish board

-- ── Notification type ─────────────────────────────────────────────────────────
DO $$
BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'lab_wish_shipped';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── lab_wishes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lab_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  title VARCHAR(80) NOT NULL,
  body VARCHAR(600) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'looking', 'shipped', 'wont_do')
  ),
  merged_into_id UUID REFERENCES public.lab_wishes(id) ON DELETE SET NULL,
  focus_group_opt_in BOOLEAN NOT NULL DEFAULT false,
  vote_count INTEGER NOT NULL DEFAULT 0,
  use_this_count INTEGER NOT NULL DEFAULT 0,
  shipped_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_wishes_university_id ON public.lab_wishes(university_id);
CREATE INDEX IF NOT EXISTS idx_lab_wishes_user_id ON public.lab_wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_wishes_status ON public.lab_wishes(status);
CREATE INDEX IF NOT EXISTS idx_lab_wishes_created_at ON public.lab_wishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_wishes_merged_into ON public.lab_wishes(merged_into_id)
  WHERE merged_into_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lab_wishes_top_rank ON public.lab_wishes(university_id, vote_count DESC, use_this_count DESC, created_at DESC)
  WHERE merged_into_id IS NULL AND status NOT IN ('wont_do');

COMMENT ON TABLE public.lab_wishes IS
  'Domu Lab feature wishes — global, text-only, upvotable problem/wish board. user_id is stored for moderation; only exposed to super admins via admin API.';

-- ── lab_wish_votes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lab_wish_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id UUID NOT NULL REFERENCES public.lab_wishes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intensity VARCHAR(16) NOT NULL CHECK (intensity IN ('use_this', 'nice_to_have')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (wish_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lab_wish_votes_wish_id ON public.lab_wish_votes(wish_id);
CREATE INDEX IF NOT EXISTS idx_lab_wish_votes_user_id ON public.lab_wish_votes(user_id);

-- ── lab_prompt_dismissals ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lab_prompt_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_key VARCHAR(32) NOT NULL CHECK (
    prompt_key IN ('onboarding_complete', 'first_match', 'empty_matches')
  ),
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, prompt_key)
);

CREATE INDEX IF NOT EXISTS idx_lab_prompt_dismissals_user_id ON public.lab_prompt_dismissals(user_id);

-- ── lab_co_creator_badges ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lab_co_creator_badges (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wish_id UUID REFERENCES public.lab_wishes(id) ON DELETE SET NULL,
  wish_title VARCHAR(80) NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── lab_wish_reports ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lab_wish_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id UUID NOT NULL REFERENCES public.lab_wishes(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(trim(reason)) >= 5 AND char_length(reason) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (wish_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_lab_wish_reports_wish_id ON public.lab_wish_reports(wish_id);

-- ── Vote count trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_lab_wish_vote_counts(p_wish_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.lab_wishes w
  SET
    vote_count = (
      SELECT COUNT(*)::INTEGER FROM public.lab_wish_votes v WHERE v.wish_id = p_wish_id
    ),
    use_this_count = (
      SELECT COUNT(*)::INTEGER
      FROM public.lab_wish_votes v
      WHERE v.wish_id = p_wish_id AND v.intensity = 'use_this'
    ),
    updated_at = NOW()
  WHERE w.id = p_wish_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_lab_wish_votes_refresh_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_lab_wish_vote_counts(OLD.wish_id);
    RETURN OLD;
  END IF;
  PERFORM public.refresh_lab_wish_vote_counts(NEW.wish_id);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_lab_wish_vote_counts(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_lab_wish_vote_counts(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_lab_wish_vote_counts(UUID) TO postgres, service_role;

REVOKE ALL ON FUNCTION public.trg_lab_wish_votes_refresh_counts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_lab_wish_votes_refresh_counts() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trg_lab_wish_votes_refresh_counts() TO postgres, service_role;

DROP TRIGGER IF EXISTS trg_lab_wish_votes_refresh ON public.lab_wish_votes;
CREATE TRIGGER trg_lab_wish_votes_refresh
  AFTER INSERT OR UPDATE OR DELETE ON public.lab_wish_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_lab_wish_votes_refresh_counts();

-- ── updated_at on lab_wishes ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_lab_wishes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_lab_wishes_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_lab_wishes_updated_at() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_lab_wishes_updated_at() TO postgres, service_role;

DROP TRIGGER IF EXISTS trg_lab_wishes_updated_at ON public.lab_wishes;
CREATE TRIGGER trg_lab_wishes_updated_at
  BEFORE UPDATE ON public.lab_wishes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lab_wishes_updated_at();

-- ── RLS helper: same university via user_academic ─────────────────────────────
CREATE OR REPLACE FUNCTION public.lab_user_university_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT ua.university_id
  FROM public.user_academic ua
  WHERE ua.user_id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lab_user_university_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lab_user_university_id() TO authenticated, service_role;

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.lab_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_wish_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_prompt_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_co_creator_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_wish_reports ENABLE ROW LEVEL SECURITY;

-- lab_wishes: students read all visible wishes (global board)
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

-- lab_wishes: no direct writes from clients (API uses service role)
DROP POLICY IF EXISTS lab_wishes_no_client_write ON public.lab_wishes;
DROP POLICY IF EXISTS lab_wishes_no_client_insert ON public.lab_wishes;
DROP POLICY IF EXISTS lab_wishes_no_client_update ON public.lab_wishes;
DROP POLICY IF EXISTS lab_wishes_no_client_delete ON public.lab_wishes;
CREATE POLICY lab_wishes_no_client_insert
  ON public.lab_wishes
  FOR INSERT
  TO authenticated
  WITH CHECK (false);
CREATE POLICY lab_wishes_no_client_update
  ON public.lab_wishes
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);
CREATE POLICY lab_wishes_no_client_delete
  ON public.lab_wishes
  FOR DELETE
  TO authenticated
  USING (false);

-- lab_wish_votes: read own votes + votes on visible wishes in same uni
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

DROP POLICY IF EXISTS lab_wish_votes_delete_own ON public.lab_wish_votes;
CREATE POLICY lab_wish_votes_delete_own
  ON public.lab_wish_votes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- lab_prompt_dismissals: own rows only
DROP POLICY IF EXISTS lab_prompt_dismissals_own ON public.lab_prompt_dismissals;
CREATE POLICY lab_prompt_dismissals_own
  ON public.lab_prompt_dismissals
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- lab_co_creator_badges: read own badge only
DROP POLICY IF EXISTS lab_co_creator_badges_select_own ON public.lab_co_creator_badges;
CREATE POLICY lab_co_creator_badges_select_own
  ON public.lab_co_creator_badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS lab_co_creator_badges_no_client_write ON public.lab_co_creator_badges;
DROP POLICY IF EXISTS lab_co_creator_badges_no_client_insert ON public.lab_co_creator_badges;
DROP POLICY IF EXISTS lab_co_creator_badges_no_client_update ON public.lab_co_creator_badges;
DROP POLICY IF EXISTS lab_co_creator_badges_no_client_delete ON public.lab_co_creator_badges;
CREATE POLICY lab_co_creator_badges_no_client_insert
  ON public.lab_co_creator_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (false);
CREATE POLICY lab_co_creator_badges_no_client_update
  ON public.lab_co_creator_badges
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);
CREATE POLICY lab_co_creator_badges_no_client_delete
  ON public.lab_co_creator_badges
  FOR DELETE
  TO authenticated
  USING (false);

-- lab_wish_reports: insert own; no client read
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

DROP POLICY IF EXISTS lab_wish_reports_no_select ON public.lab_wish_reports;
CREATE POLICY lab_wish_reports_no_select
  ON public.lab_wish_reports
  FOR SELECT
  TO authenticated
  USING (false);

-- Grants
GRANT SELECT ON public.lab_wishes TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.lab_wish_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_prompt_dismissals TO authenticated;
GRANT SELECT ON public.lab_co_creator_badges TO authenticated;
GRANT INSERT ON public.lab_wish_reports TO authenticated;
