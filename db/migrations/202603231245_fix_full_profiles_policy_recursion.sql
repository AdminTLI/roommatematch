-- Fix recursion in "Full profiles visible with accepted matches" policy.
-- The previous policy joined profiles from inside a profiles policy.

DROP POLICY IF EXISTS "Full profiles visible with accepted matches" ON profiles;

CREATE POLICY "Full profiles visible with accepted matches" ON profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM matches m
      WHERE (
        (m.a_user = auth.uid() AND m.b_user = profiles.user_id)
        OR (m.b_user = auth.uid() AND m.a_user = profiles.user_id)
      )
      AND m.status = 'accepted'
    )
    OR EXISTS (
      SELECT 1
      FROM group_suggestions gs
      WHERE gs.university_id IN (
        SELECT ua.university_id
        FROM user_academic ua
        WHERE ua.user_id = auth.uid()
      )
      AND profiles.user_id = ANY(gs.member_ids)
      AND auth.uid() = ANY(gs.member_ids)
      AND gs.status = 'accepted'
    )
  );
