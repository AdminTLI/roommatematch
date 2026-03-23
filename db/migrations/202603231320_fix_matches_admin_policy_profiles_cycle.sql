-- Break profiles <-> matches RLS cycle.
-- profiles SELECT policy reads matches; the old matches admin policy read profiles.

DROP POLICY IF EXISTS "Admins can read anonymized matches" ON matches;

CREATE POLICY "Admins can read anonymized matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM admins a
      WHERE a.user_id = auth.uid()
        AND (
          EXISTS (
            SELECT 1
            FROM user_academic ua
            WHERE ua.user_id = matches.a_user
              AND ua.university_id = a.university_id
          )
          OR EXISTS (
            SELECT 1
            FROM user_academic ua
            WHERE ua.user_id = matches.b_user
              AND ua.university_id = a.university_id
          )
        )
    )
  );
