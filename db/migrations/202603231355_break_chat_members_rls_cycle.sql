-- Break RLS recursion involving chat_members/chats/profiles.

CREATE OR REPLACE FUNCTION public.user_is_chat_member(target_chat_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM chat_members
    WHERE chat_id = target_chat_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_chat_owner(target_chat_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM chats
    WHERE id = target_chat_id
      AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.user_is_chat_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_chat_owner(UUID) TO authenticated;

DROP POLICY IF EXISTS "Chat members can read chats" ON chats;
DROP POLICY IF EXISTS "Chat members can update chats" ON chats;

CREATE POLICY "Chat members can read chats" ON chats
  FOR SELECT USING (user_is_chat_member(chats.id));

CREATE POLICY "Chat members can update chats" ON chats
  FOR UPDATE USING (user_is_chat_member(chats.id));

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_members'
  )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.chat_members', r.policyname);
  END LOOP;
END
$$;

CREATE POLICY "Chat members can manage membership" ON chat_members
  FOR ALL USING (
    user_id = auth.uid()
    OR user_is_chat_member(chat_id)
    OR is_chat_owner(chat_id)
  )
  WITH CHECK (
    user_id = auth.uid()
    OR is_chat_owner(chat_id)
  );

DROP POLICY IF EXISTS "Chat members can see each other's profiles" ON profiles;
CREATE POLICY "Chat members can see each other's profiles" ON profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR users_in_same_chat(user_id)
  );
