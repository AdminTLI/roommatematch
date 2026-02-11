-- Domu AI chat log for storing user messages and assistant replies
create table if not exists public.domu_ai_chat_log (
  id uuid primary key default gen_random_uuid(),
  user_message text not null,
  assistant_reply text not null,
  created_at timestamptz not null default now()
);

comment on table public.domu_ai_chat_log is 'Chat log for Domu AI API (Flask serverless function)';

create index if not exists idx_domu_ai_chat_log_created_at on public.domu_ai_chat_log (created_at desc);

-- RLS: service role bypasses RLS; restrict anon/auth from direct access
alter table public.domu_ai_chat_log enable row level security;

-- No policies for anon/authenticated - only service role (API) can insert/read
-- Service role automatically bypasses RLS in Supabase
