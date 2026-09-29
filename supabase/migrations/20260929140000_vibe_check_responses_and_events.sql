-- Anonymous vibe-check responses + engagement events for funnel analytics

create table if not exists public.vibe_check_responses (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  university text,
  university_other text,
  city text,
  answers jsonb not null default '{}'::jsonb,
  module_scores jsonb,
  archetype_title text,
  overall_harmony numeric,
  lifestyle_fit_percent integer,
  match_count integer,
  created_at timestamptz not null default now()
);

create index if not exists vibe_check_responses_created_at_idx
  on public.vibe_check_responses (created_at desc);

create index if not exists vibe_check_responses_session_id_idx
  on public.vibe_check_responses (session_id);

create table if not exists public.vibe_check_events (
  id uuid primary key default gen_random_uuid(),
  response_id uuid references public.vibe_check_responses (id) on delete set null,
  session_id text,
  event_name text not null,
  event_properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint vibe_check_events_name_check check (
    event_name in (
      'vibe_check_completed',
      'vibe_check_meet_cta',
      'vibe_check_share',
      'vibe_check_download'
    )
  )
);

create index if not exists vibe_check_events_name_created_at_idx
  on public.vibe_check_events (event_name, created_at desc);

create index if not exists vibe_check_events_response_id_idx
  on public.vibe_check_events (response_id);

alter table public.vibe_check_responses enable row level security;
alter table public.vibe_check_events enable row level security;

-- No direct client access; service role / admin only via API
create policy "Service role full access vibe_check_responses"
  on public.vibe_check_responses
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role full access vibe_check_events"
  on public.vibe_check_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
