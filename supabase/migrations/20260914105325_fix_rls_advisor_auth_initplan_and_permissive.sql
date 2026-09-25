-- Performance Advisor RLS fixes:
-- 1) auth_rls_initplan (0003): wrap bare auth.*() / current_setting() via private helpers
-- 2) multiple_permissive_policies (0006): drop duplicates / redundant service_role policies
--    and merge overlapping permissive policies per command

-- ---------------------------------------------------------------------------
-- Part 1: wrap auth.*() in all public/storage policies that still need it
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  policy_row record;
  new_qual text;
  new_check text;
  polcmd_char "char";
BEGIN
  FOR policy_row IN
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
      AND (
        qual ~ 'auth\.(uid|jwt|role)\(\)|current_setting\('
        OR with_check ~ 'auth\.(uid|jwt|role)\(\)|current_setting\('
      )
  LOOP
    polcmd_char := CASE policy_row.cmd
      WHEN 'SELECT' THEN 'r'::"char"
      WHEN 'INSERT' THEN 'a'::"char"
      WHEN 'UPDATE' THEN 'w'::"char"
      WHEN 'DELETE' THEN 'd'::"char"
      WHEN 'ALL' THEN '*'::"char"
      ELSE '*'::"char"
    END;
    new_qual := private.wrap_auth_in_rls(policy_row.qual);
    new_check := private.wrap_auth_in_rls(policy_row.with_check);

    IF new_qual IS NOT DISTINCT FROM policy_row.qual
       AND new_check IS NOT DISTINCT FROM policy_row.with_check THEN
      CONTINUE;
    END IF;

    PERFORM private.recreate_policy_with_wrapped_auth(
      policy_row.schemaname::name,
      policy_row.tablename::name,
      policy_row.policyname::name,
      policy_row.permissive,
      polcmd_char,
      policy_row.roles,
      new_qual,
      new_check
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- Part 2: drop exact duplicates and realtime mirrors
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "chats_members_can_view" ON public.chats;
DROP POLICY IF EXISTS "Users can see their matches" ON public.matches;
DROP POLICY IF EXISTS "realtime_matches_select_participant" ON public.matches;
DROP POLICY IF EXISTS "Users can see messages in their chats" ON public.messages_unpartitioned_old;
DROP POLICY IF EXISTS "Admins can read verifications in university" ON public.verifications;
DROP POLICY IF EXISTS "Users can read own verifications" ON public.verifications;
DROP POLICY IF EXISTS "Users can upsert their own academic data" ON public.user_academic;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can create their own events" ON public.app_events_unpartitioned_old;
DROP POLICY IF EXISTS "realtime_match_suggestions_own" ON public.match_suggestions;
DROP POLICY IF EXISTS "realtime_notifications_insert_own" ON public.notifications;
DROP POLICY IF EXISTS "Super admins can read all roles" ON public.user_roles;

-- service_role bypasses RLS (FORCE RLS is off). These policies only create
-- overlapping permissive evaluations for other roles.
DROP POLICY IF EXISTS "Service role can manage Domu AI chat log" ON public.domu_ai_chat_log;
DROP POLICY IF EXISTS "Service role can manage dsar requests" ON public.dsar_requests;
DROP POLICY IF EXISTS "programmes_service_role" ON public.programmes;
DROP POLICY IF EXISTS "programs_service_role" ON public.programs;
DROP POLICY IF EXISTS "group_compatibility_scores_modify" ON public.group_compatibility_scores;
DROP POLICY IF EXISTS "Service role manages system health state" ON public.system_health_state;
DROP POLICY IF EXISTS "Service role can insert system ops events" ON public.system_ops_events;
DROP POLICY IF EXISTS "Service role can manage consents" ON public.user_consents;
DROP POLICY IF EXISTS "Service role can manage webhooks" ON public.verification_webhooks;
DROP POLICY IF EXISTS "Service role can manage verifications" ON public.verifications;

-- ---------------------------------------------------------------------------
-- Part 3: consolidate remaining overlapping permissive policies
-- Pattern: one SELECT (OR of prior rules); write policies without SELECT overlap
-- ---------------------------------------------------------------------------

-- admins: super_admin ALL overlaps admin SELECT
DROP POLICY IF EXISTS "Super admins can manage admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can read admin data" ON public.admins;
CREATE POLICY "Admins can read admin data" ON public.admins
  AS PERMISSIVE FOR SELECT
  USING (
    (user_id = (select auth.uid()))
    OR private.is_admin_in_university(university_id)
    OR private.is_super_admin()
  );
CREATE POLICY "Super admins can insert admins" ON public.admins
  AS PERMISSIVE FOR INSERT
  WITH CHECK (private.is_super_admin());
CREATE POLICY "Super admins can update admins" ON public.admins
  AS PERMISSIVE FOR UPDATE
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());
CREATE POLICY "Super admins can delete admins" ON public.admins
  AS PERMISSIVE FOR DELETE
  USING (private.is_super_admin());

-- announcement_views: two FOR ALL
DROP POLICY IF EXISTS "Admins can access all announcement views" ON public.announcement_views;
DROP POLICY IF EXISTS "Users can manage their own announcement views" ON public.announcement_views;
CREATE POLICY "announcement_views_access" ON public.announcement_views
  AS PERMISSIVE FOR ALL
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- announcements: admin ALL + two SELECT
DROP POLICY IF EXISTS "Admins can access all announcements" ON public.announcements;
DROP POLICY IF EXISTS "University members can read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can view active announcements" ON public.announcements;
CREATE POLICY "announcements_select" ON public.announcements
  AS PERMISSIVE FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.university_id = announcements.university_id
    )
    OR (
      is_active = true
      AND (start_date IS NULL OR start_date <= now())
      AND (end_date IS NULL OR end_date >= now())
    )
  );
CREATE POLICY "announcements_admin_insert" ON public.announcements
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "announcements_admin_update" ON public.announcements
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "announcements_admin_delete" ON public.announcements
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- campus_ambassadors
DROP POLICY IF EXISTS "Admins can access all ambassadors" ON public.campus_ambassadors;
DROP POLICY IF EXISTS "Users can view their own ambassador status" ON public.campus_ambassadors;
CREATE POLICY "campus_ambassadors_select" ON public.campus_ambassadors
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "campus_ambassadors_admin_insert" ON public.campus_ambassadors
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "campus_ambassadors_admin_update" ON public.campus_ambassadors
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "campus_ambassadors_admin_delete" ON public.campus_ambassadors
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- chats: merge SELECT and UPDATE
DROP POLICY IF EXISTS "Chat members can read chats" ON public.chats;
DROP POLICY IF EXISTS "chats_creator_can_view" ON public.chats;
DROP POLICY IF EXISTS "Chat members can update chats" ON public.chats;
DROP POLICY IF EXISTS "chats_creator_can_update" ON public.chats;
CREATE POLICY "chats_select" ON public.chats
  AS PERMISSIVE FOR SELECT
  USING (
    created_by = (select auth.uid())
    OR private.user_is_chat_member(id)
  );
CREATE POLICY "chats_update" ON public.chats
  AS PERMISSIVE FOR UPDATE
  USING (
    created_by = (select auth.uid())
    OR private.user_is_chat_member(id)
  );

-- dsar_requests: merge SELECT
DROP POLICY IF EXISTS "Admins can read all dsar requests" ON public.dsar_requests;
DROP POLICY IF EXISTS "Users can read own dsar requests" ON public.dsar_requests;
CREATE POLICY "dsar_requests_select" ON public.dsar_requests
  AS PERMISSIVE FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- eligibility_rules
DROP POLICY IF EXISTS "Admins can manage eligibility rules" ON public.eligibility_rules;
DROP POLICY IF EXISTS "University members can read eligibility rules" ON public.eligibility_rules;
CREATE POLICY "eligibility_rules_select" ON public.eligibility_rules
  AS PERMISSIVE FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.university_id = eligibility_rules.university_id
    )
    OR EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = eligibility_rules.university_id
    )
  );
CREATE POLICY "eligibility_rules_admin_insert" ON public.eligibility_rules
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = eligibility_rules.university_id
    )
  );
CREATE POLICY "eligibility_rules_admin_update" ON public.eligibility_rules
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = eligibility_rules.university_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = eligibility_rules.university_id
    )
  );
CREATE POLICY "eligibility_rules_admin_delete" ON public.eligibility_rules
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = eligibility_rules.university_id
    )
  );

-- experiment_assignments
DROP POLICY IF EXISTS "Admins can access experiment assignments" ON public.experiment_assignments;
DROP POLICY IF EXISTS "Users can view their own experiment assignments" ON public.experiment_assignments;
CREATE POLICY "experiment_assignments_select" ON public.experiment_assignments
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "experiment_assignments_admin_insert" ON public.experiment_assignments
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "experiment_assignments_admin_update" ON public.experiment_assignments
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "experiment_assignments_admin_delete" ON public.experiment_assignments
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- forum_comments: admin ALL overlaps insert/select/update
DROP POLICY IF EXISTS "Admins can manage forum comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Verified users can create forum comments" ON public.forum_comments;
DROP POLICY IF EXISTS "University members can read forum comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Authors can update their forum comments" ON public.forum_comments;
CREATE POLICY "forum_comments_select" ON public.forum_comments
  AS PERMISSIVE FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.forum_posts fp
      JOIN public.admins a ON a.university_id = fp.university_id
      WHERE fp.id = forum_comments.post_id
        AND a.user_id = (select auth.uid())
    )
    OR (
      status = 'published'::post_status
      AND EXISTS (
        SELECT 1
        FROM public.forum_posts fp
        JOIN public.profiles p ON p.university_id = fp.university_id
        WHERE fp.id = forum_comments.post_id
          AND p.user_id = (select auth.uid())
      )
    )
  );
CREATE POLICY "forum_comments_insert" ON public.forum_comments
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.forum_posts fp
      JOIN public.admins a ON a.university_id = fp.university_id
      WHERE fp.id = forum_comments.post_id
        AND a.user_id = (select auth.uid())
    )
    OR (
      author_id = (select auth.uid())
      AND EXISTS (
        SELECT 1
        FROM public.forum_posts fp
        JOIN public.profiles p ON p.university_id = fp.university_id
        WHERE fp.id = forum_comments.post_id
          AND p.user_id = (select auth.uid())
          AND p.verification_status = 'verified'::verification_status
      )
    )
  );
CREATE POLICY "forum_comments_update" ON public.forum_comments
  AS PERMISSIVE FOR UPDATE
  USING (
    author_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.forum_posts fp
      JOIN public.admins a ON a.university_id = fp.university_id
      WHERE fp.id = forum_comments.post_id
        AND a.user_id = (select auth.uid())
    )
  );
CREATE POLICY "forum_comments_admin_delete" ON public.forum_comments
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.forum_posts fp
      JOIN public.admins a ON a.university_id = fp.university_id
      WHERE fp.id = forum_comments.post_id
        AND a.user_id = (select auth.uid())
    )
  );

-- forum_posts
DROP POLICY IF EXISTS "Admins can manage forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Verified users can create forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "University members can read forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Authors can update their forum posts" ON public.forum_posts;
CREATE POLICY "forum_posts_select" ON public.forum_posts
  AS PERMISSIVE FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = forum_posts.university_id
    )
    OR (
      status = 'published'::post_status
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = (select auth.uid())
          AND p.university_id = forum_posts.university_id
      )
    )
  );
CREATE POLICY "forum_posts_insert" ON public.forum_posts
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = forum_posts.university_id
    )
    OR (
      author_id = (select auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = (select auth.uid())
          AND p.university_id = forum_posts.university_id
          AND p.verification_status = 'verified'::verification_status
      )
    )
  );
CREATE POLICY "forum_posts_update" ON public.forum_posts
  AS PERMISSIVE FOR UPDATE
  USING (
    author_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = forum_posts.university_id
    )
  );
CREATE POLICY "forum_posts_admin_delete" ON public.forum_posts
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = forum_posts.university_id
    )
  );

-- group_feedback
DROP POLICY IF EXISTS "group_feedback_view_admin" ON public.group_feedback;
DROP POLICY IF EXISTS "group_feedback_view_own" ON public.group_feedback;
CREATE POLICY "group_feedback_select" ON public.group_feedback
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- group_suggestions
DROP POLICY IF EXISTS "Admins can read group suggestions" ON public.group_suggestions;
DROP POLICY IF EXISTS "Group members can read their suggestions" ON public.group_suggestions;
CREATE POLICY "group_suggestions_select" ON public.group_suggestions
  AS PERMISSIVE FOR SELECT
  USING (
    (select auth.uid()) = ANY (member_ids)
    OR EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = group_suggestions.university_id
    )
  );

-- housing_applications: user ALL + admin SELECT
DROP POLICY IF EXISTS "Users can manage their own housing applications" ON public.housing_applications;
DROP POLICY IF EXISTS "Admins can read housing applications" ON public.housing_applications;
CREATE POLICY "housing_applications_select" ON public.housing_applications
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.admins a
      JOIN public.profiles p ON p.university_id = a.university_id
      WHERE a.user_id = (select auth.uid())
        AND p.user_id = housing_applications.user_id
    )
  );
CREATE POLICY "housing_applications_insert" ON public.housing_applications
  AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "housing_applications_update" ON public.housing_applications
  AS PERMISSIVE FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "housing_applications_delete" ON public.housing_applications
  AS PERMISSIVE FOR DELETE
  USING (user_id = (select auth.uid()));

-- housing_listings
DROP POLICY IF EXISTS "housing_listings_admin_write" ON public.housing_listings;
DROP POLICY IF EXISTS "housing_listings_read" ON public.housing_listings;
CREATE POLICY "housing_listings_select" ON public.housing_listings
  AS PERMISSIVE FOR SELECT
  USING (
    (status)::text = 'active'::text
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "housing_listings_admin_insert" ON public.housing_listings
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "housing_listings_admin_update" ON public.housing_listings
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "housing_listings_admin_delete" ON public.housing_listings
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- institution_admin_profiles: two ALL
DROP POLICY IF EXISTS "Institution admins manage own profile" ON public.institution_admin_profiles;
DROP POLICY IF EXISTS "Super admins manage institution admin profiles" ON public.institution_admin_profiles;
CREATE POLICY "institution_admin_profiles_access" ON public.institution_admin_profiles
  AS PERMISSIVE FOR ALL
  USING (
    (select auth.uid()) = user_id
    OR private.is_super_admin((select auth.uid()))
  )
  WITH CHECK (
    (select auth.uid()) = user_id
    OR private.is_super_admin((select auth.uid()))
  );

-- matches: keep one participant SELECT + admin SELECT merged
DROP POLICY IF EXISTS "Admins can read anonymized matches" ON public.matches;
DROP POLICY IF EXISTS "Users can read their matches" ON public.matches;
CREATE POLICY "matches_select" ON public.matches
  AS PERMISSIVE FOR SELECT
  USING (
    a_user = (select auth.uid())
    OR b_user = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND (
          EXISTS (
            SELECT 1 FROM public.user_academic ua
            WHERE ua.user_id = matches.a_user
              AND ua.university_id = a.university_id
          )
          OR EXISTS (
            SELECT 1 FROM public.user_academic ua
            WHERE ua.user_id = matches.b_user
              AND ua.university_id = a.university_id
          )
        )
    )
  );

-- matching_quality_metrics
DROP POLICY IF EXISTS "Admins can access quality metrics" ON public.matching_quality_metrics;
DROP POLICY IF EXISTS "Users can view their own quality metrics" ON public.matching_quality_metrics;
CREATE POLICY "matching_quality_metrics_select" ON public.matching_quality_metrics
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "matching_quality_metrics_admin_insert" ON public.matching_quality_metrics
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "matching_quality_metrics_admin_update" ON public.matching_quality_metrics
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "matching_quality_metrics_admin_delete" ON public.matching_quality_metrics
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- message_reads: user ALL + chat-member SELECT
DROP POLICY IF EXISTS "Users can manage their read receipts" ON public.message_reads;
DROP POLICY IF EXISTS "Chat members can read read receipts" ON public.message_reads;
CREATE POLICY "message_reads_select" ON public.message_reads
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.messages m
      JOIN public.chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reads.message_id
        AND cm.user_id = (select auth.uid())
    )
  );
CREATE POLICY "message_reads_insert" ON public.message_reads
  AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "message_reads_update" ON public.message_reads
  AS PERMISSIVE FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "message_reads_delete" ON public.message_reads
  AS PERMISSIVE FOR DELETE
  USING (user_id = (select auth.uid()));

-- messages_unpartitioned_old: after duplicate drop, only one SELECT remains (OK)

-- profiles: user ALL + multiple SELECT - split writes, one SELECT
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read profiles in their university" ON public.profiles;
DROP POLICY IF EXISTS "Chat members can see each other's profiles" ON public.profiles;
DROP POLICY IF EXISTS "Full profiles visible with accepted matches" ON public.profiles;
DROP POLICY IF EXISTS "Minimal public profiles visible to university members" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.admins a
      WHERE a.user_id = (select auth.uid())
        AND a.university_id = profiles.university_id
    )
    OR private.users_in_same_chat(user_id)
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE (
        ((m.a_user = (select auth.uid()) AND m.b_user = profiles.user_id)
          OR (m.b_user = (select auth.uid()) AND m.a_user = profiles.user_id))
        AND m.status = 'accepted'::match_status
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.group_suggestions gs
      WHERE gs.university_id IN (
          SELECT ua.university_id FROM public.user_academic ua
          WHERE ua.user_id = (select auth.uid())
        )
        AND profiles.user_id = ANY (gs.member_ids)
        AND (select auth.uid()) = ANY (gs.member_ids)
        AND gs.status = 'accepted'::match_status
    )
    OR (
      minimal_public = true
      AND private.can_view_minimal_profile(university_id)
    )
  );
CREATE POLICY "profiles_insert" ON public.profiles
  AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "profiles_update" ON public.profiles
  AS PERMISSIVE FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "profiles_delete" ON public.profiles
  AS PERMISSIVE FOR DELETE
  USING (user_id = (select auth.uid()));

-- programmes / programs: service_role dropped; public SELECT only (OK)

-- question_items: admin ALL + public SELECT true
DROP POLICY IF EXISTS "Question items are writable by admins only" ON public.question_items;
-- keep readable-by-everyone SELECT; add write-only admin policies
CREATE POLICY "question_items_admin_insert" ON public.question_items
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "question_items_admin_update" ON public.question_items
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "question_items_admin_delete" ON public.question_items
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- referral_codes
DROP POLICY IF EXISTS "Admins can access all referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can create their own referral codes" ON public.referral_codes;
DROP POLICY IF EXISTS "Users can view their own referral codes" ON public.referral_codes;
CREATE POLICY "referral_codes_select" ON public.referral_codes
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "referral_codes_insert" ON public.referral_codes
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "referral_codes_admin_update" ON public.referral_codes
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "referral_codes_admin_delete" ON public.referral_codes
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- referrals
DROP POLICY IF EXISTS "Admins can access all referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "referrals_select" ON public.referrals
  AS PERMISSIVE FOR SELECT
  USING (
    referrer_id = (select auth.uid())
    OR referred_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "referrals_insert" ON public.referrals
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    referrer_id = (select auth.uid())
    OR referred_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "referrals_admin_update" ON public.referrals
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "referrals_admin_delete" ON public.referrals
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- reports
DROP POLICY IF EXISTS "Admins can manage reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can read their own reports" ON public.reports;
CREATE POLICY "reports_select" ON public.reports
  AS PERMISSIVE FOR SELECT
  USING (
    reporter_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.admins a
      JOIN public.profiles p ON p.university_id = a.university_id
      WHERE a.user_id = (select auth.uid())
        AND (
          p.user_id = reports.reporter_id
          OR p.user_id = reports.target_user_id
          OR reports.target_user_id IS NULL
        )
    )
  );
CREATE POLICY "reports_insert" ON public.reports
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    reporter_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.admins a
      JOIN public.profiles p ON p.university_id = a.university_id
      WHERE a.user_id = (select auth.uid())
        AND (
          p.user_id = reports.reporter_id
          OR p.user_id = reports.target_user_id
          OR reports.target_user_id IS NULL
        )
    )
  );
CREATE POLICY "reports_admin_update" ON public.reports
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.admins a
      JOIN public.profiles p ON p.university_id = a.university_id
      WHERE a.user_id = (select auth.uid())
        AND (
          p.user_id = reports.reporter_id
          OR p.user_id = reports.target_user_id
          OR reports.target_user_id IS NULL
        )
    )
  );
CREATE POLICY "reports_admin_delete" ON public.reports
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.admins a
      JOIN public.profiles p ON p.university_id = a.university_id
      WHERE a.user_id = (select auth.uid())
        AND (
          p.user_id = reports.reporter_id
          OR p.user_id = reports.target_user_id
          OR reports.target_user_id IS NULL
        )
    )
  );

-- responses: user ALL + admin SELECT
DROP POLICY IF EXISTS "Users can manage their own responses" ON public.responses;
DROP POLICY IF EXISTS "Admins can read analytics responses" ON public.responses;
CREATE POLICY "responses_select" ON public.responses
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.admins a
      JOIN public.profiles p ON p.university_id = a.university_id
      WHERE a.user_id = (select auth.uid())
        AND p.user_id = responses.user_id
    )
  );
CREATE POLICY "responses_insert" ON public.responses
  AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "responses_update" ON public.responses
  AS PERMISSIVE FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "responses_delete" ON public.responses
  AS PERMISSIVE FOR DELETE
  USING (user_id = (select auth.uid()));

-- support_tickets: two ALL
DROP POLICY IF EXISTS "Admins can access all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can manage their own tickets" ON public.support_tickets;
CREATE POLICY "support_tickets_access" ON public.support_tickets
  AS PERMISSIVE FOR ALL
  USING (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- system_health_state: service dropped; admin SELECT only (OK)

-- ticket_attachments
DROP POLICY IF EXISTS "Admins can access all attachments" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to their tickets" ON public.ticket_attachments;
DROP POLICY IF EXISTS "Users can view attachments in their tickets" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_select" ON public.ticket_attachments
  AS PERMISSIVE FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = ticket_attachments.ticket_id
        AND support_tickets.user_id = (select auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "ticket_attachments_insert" ON public.ticket_attachments
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = ticket_attachments.ticket_id
        AND support_tickets.user_id = (select auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "ticket_attachments_admin_update" ON public.ticket_attachments
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "ticket_attachments_admin_delete" ON public.ticket_attachments
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- ticket_messages
DROP POLICY IF EXISTS "Admins can access all messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can create messages in their tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Users can view messages in their tickets" ON public.ticket_messages;
CREATE POLICY "ticket_messages_select" ON public.ticket_messages
  AS PERMISSIVE FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
    OR (
      is_internal = false
      AND EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE support_tickets.id = ticket_messages.ticket_id
          AND support_tickets.user_id = (select auth.uid())
      )
    )
  );
CREATE POLICY "ticket_messages_insert" ON public.ticket_messages
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
        AND support_tickets.user_id = (select auth.uid())
    )
  );
CREATE POLICY "ticket_messages_admin_update" ON public.ticket_messages
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "ticket_messages_admin_delete" ON public.ticket_messages
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- universities: admin ALL + public SELECT
DROP POLICY IF EXISTS "Universities are writable by admins only" ON public.universities;
DROP POLICY IF EXISTS "Universities are readable by everyone" ON public.universities;
CREATE POLICY "universities_select" ON public.universities
  AS PERMISSIVE FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
        AND admins.university_id = universities.id
    )
  );
CREATE POLICY "universities_admin_insert" ON public.universities
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
        AND admins.university_id = universities.id
    )
  );
CREATE POLICY "universities_admin_update" ON public.universities
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
        AND admins.university_id = universities.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
        AND admins.university_id = universities.id
    )
  );
CREATE POLICY "universities_admin_delete" ON public.universities
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = (select auth.uid())
        AND admins.university_id = universities.id
    )
  );

-- updates: admin ALL + SELECT true
DROP POLICY IF EXISTS "Admins can manage updates" ON public.updates;
-- keep "Users can view updates"; add write-only admin
CREATE POLICY "updates_admin_insert" ON public.updates
  AS PERMISSIVE FOR INSERT
  WITH CHECK (private.is_admin_user());
CREATE POLICY "updates_admin_update" ON public.updates
  AS PERMISSIVE FOR UPDATE
  USING (private.is_admin_user())
  WITH CHECK (private.is_admin_user());
CREATE POLICY "updates_admin_delete" ON public.updates
  AS PERMISSIVE FOR DELETE
  USING (private.is_admin_user());

-- user_academic: own ALL + admin SELECT
DROP POLICY IF EXISTS "user_academic_own" ON public.user_academic;
DROP POLICY IF EXISTS "user_academic_admin_read" ON public.user_academic;
CREATE POLICY "user_academic_select" ON public.user_academic
  AS PERMISSIVE FOR SELECT
  USING (
    (select auth.uid()) = user_id
    OR private.is_user_admin((select auth.uid()))
  );
CREATE POLICY "user_academic_insert" ON public.user_academic
  AS PERMISSIVE FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "user_academic_update" ON public.user_academic
  AS PERMISSIVE FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "user_academic_delete" ON public.user_academic
  AS PERMISSIVE FOR DELETE
  USING ((select auth.uid()) = user_id);

-- user_consents: service dropped; per-command user policies remain (OK if one each)

-- user_journey_events: admin ALL overlaps user INSERT
DROP POLICY IF EXISTS "Admins can access user journey events" ON public.user_journey_events;
DROP POLICY IF EXISTS "Users can insert their own journey events" ON public.user_journey_events;
CREATE POLICY "user_journey_events_select" ON public.user_journey_events
  AS PERMISSIVE FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "user_journey_events_insert" ON public.user_journey_events
  AS PERMISSIVE FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "user_journey_events_admin_update" ON public.user_journey_events
  AS PERMISSIVE FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );
CREATE POLICY "user_journey_events_admin_delete" ON public.user_journey_events
  AS PERMISSIVE FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE admins.user_id = (select auth.uid()))
  );

-- user_roles: super ALL + own SELECT
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR private.is_super_admin((select auth.uid()))
  );
CREATE POLICY "user_roles_super_insert" ON public.user_roles
  AS PERMISSIVE FOR INSERT
  WITH CHECK (private.is_super_admin((select auth.uid())));
CREATE POLICY "user_roles_super_update" ON public.user_roles
  AS PERMISSIVE FOR UPDATE
  USING (private.is_super_admin((select auth.uid())))
  WITH CHECK (private.is_super_admin((select auth.uid())));
CREATE POLICY "user_roles_super_delete" ON public.user_roles
  AS PERMISSIVE FOR DELETE
  USING (private.is_super_admin((select auth.uid())));

-- user_vectors: user ALL + system SELECT
DROP POLICY IF EXISTS "Users can manage their own vectors" ON public.user_vectors;
DROP POLICY IF EXISTS "System can read vectors for matching" ON public.user_vectors;
CREATE POLICY "user_vectors_select" ON public.user_vectors
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.university_id = (
          SELECT p2.university_id FROM public.profiles p2
          WHERE p2.user_id = user_vectors.user_id
        )
    )
  );
CREATE POLICY "user_vectors_insert" ON public.user_vectors
  AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "user_vectors_update" ON public.user_vectors
  AS PERMISSIVE FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "user_vectors_delete" ON public.user_vectors
  AS PERMISSIVE FOR DELETE
  USING (user_id = (select auth.uid()));

-- users: merge SELECT
DROP POLICY IF EXISTS "Admins can read users in their university" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
CREATE POLICY "users_select" ON public.users
  AS PERMISSIVE FOR SELECT
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.admins a ON a.university_id = p.university_id
      WHERE p.user_id = users.id
        AND a.user_id = (select auth.uid())
    )
  );

-- verifications: own ALL + admin SELECT
DROP POLICY IF EXISTS "verifications_own" ON public.verifications;
DROP POLICY IF EXISTS "Admins can read verifications in their university" ON public.verifications;
CREATE POLICY "verifications_select" ON public.verifications
  AS PERMISSIVE FOR SELECT
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.admins a ON a.university_id = p.university_id
      WHERE p.user_id = verifications.user_id
        AND a.user_id = (select auth.uid())
    )
  );
CREATE POLICY "verifications_insert" ON public.verifications
  AS PERMISSIVE FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "verifications_update" ON public.verifications
  AS PERMISSIVE FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "verifications_delete" ON public.verifications
  AS PERMISSIVE FOR DELETE
  USING (user_id = (select auth.uid()));
