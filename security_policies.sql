-- Security policies for Domu Match AI chat logs
-- This script is intended to be run in the Supabase SQL editor.
-- It assumes a table `public.chat_logs` with at least:
--   - id       uuid primary key
--   - user_id  uuid referencing auth.users(id)
--   - ...      other columns for messages / metadata

-- 1. Enable Row Level Security (RLS) on chat_logs
alter table public.chat_logs
  enable row level security;


-- 2. Allow the backend (Service Role) to INSERT rows
-- Note: In Supabase, the service_role key bypasses RLS by default,
-- but this policy makes the intent explicit if JWT-based access is used.
create policy "Allow service role inserts into chat_logs"
  on public.chat_logs
  for insert
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- 3. Restrict SELECT so users can only see their own chat history
-- This policy is for future authenticated access (role = 'authenticated').
create policy "Allow users to view their own chat logs"
  on public.chat_logs
  for select
  using (
    auth.role() = 'authenticated'
    and user_id = auth.uid()
  );

-- By default, without additional policies:
-- - anon users cannot select from chat_logs
-- - authenticated users only see rows where user_id = auth.uid()
-- - service_role can still bypass RLS when using the service key

