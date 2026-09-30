-- Email waitlist for locked / coming-soon features (e.g. professional sign-up)

create table if not exists public.feature_waitlist (
  id uuid primary key default gen_random_uuid(),
  feature text not null,
  email text not null,
  created_at timestamptz not null default now(),
  constraint feature_waitlist_feature_email_unique unique (feature, email),
  constraint feature_waitlist_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

create index if not exists feature_waitlist_feature_created_at_idx
  on public.feature_waitlist (feature, created_at desc);

alter table public.feature_waitlist enable row level security;

-- No direct client access; service role only via API
create policy "Service role full access feature_waitlist"
  on public.feature_waitlist
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

comment on table public.feature_waitlist is
  'Opt-in emails for features that are not yet available (e.g. professional cohort sign-up).';
