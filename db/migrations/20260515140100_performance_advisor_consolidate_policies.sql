-- Performance Advisor: multiple_permissive_policies (lint 0006)
-- Merge overlapping permissive policies per table/role/action where logic is equivalent.
-- Preserves stricter or broader access: FOR ALL policies subsume per-command duplicates.

-- notifications: notifications_users_own (FOR ALL) covers per-user SELECT/UPDATE
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "read_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "realtime_notifications_select_own" ON public.notifications;

-- chats: keep chats_users_can_create, drop legacy duplicate INSERT policy
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;

-- verifications: verifications_own (FOR ALL) covers read-own SELECT policy
DROP POLICY IF EXISTS "Users can read their own verifications" ON public.verifications;

-- profiles: one self-service policy instead of three per-command policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can upsert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles
  AS PERMISSIVE
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- support_tickets: one user policy instead of three
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;

DROP POLICY IF EXISTS "Users can manage their own tickets" ON public.support_tickets;
CREATE POLICY "Users can manage their own tickets" ON public.support_tickets
  AS PERMISSIVE
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- announcement_views: merge user SELECT/INSERT/UPDATE into one policy
DROP POLICY IF EXISTS "Users can view their own announcement views" ON public.announcement_views;
DROP POLICY IF EXISTS "Users can create their own announcement views" ON public.announcement_views;
DROP POLICY IF EXISTS "Users can update their own announcement views" ON public.announcement_views;

DROP POLICY IF EXISTS "Users can manage their own announcement views" ON public.announcement_views;
CREATE POLICY "Users can manage their own announcement views" ON public.announcement_views
  AS PERMISSIVE
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- responses: already FOR ALL in schema; drop duplicate if present
DROP POLICY IF EXISTS "Users can read their own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can insert their own responses" ON public.responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON public.responses;
