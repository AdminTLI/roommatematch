-- Create table for careers applications
create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  track text not null check (track in ('experienced','student')),
  name text not null,
  email text not null,
  skills text not null,
  tools text not null default '',
  time_commitment text not null,
  example_project text not null,
  notes text not null default '',
  status text not null default 'new'
);

comment on table public.career_applications is 'Volunteer applications for the careers page';

-- Indexes
create index if not exists idx_career_applications_created_at on public.career_applications (created_at desc);
create index if not exists idx_career_applications_track on public.career_applications (track);
create index if not exists idx_career_applications_status on public.career_applications (status);

-- RLS
alter table public.career_applications enable row level security;

drop policy if exists career_applications_insert_anon on public.career_applications;

create policy career_applications_insert_anon
  on public.career_applications
  for insert
  to anon
  with check (true);

-- Deny selects by default; explicit read access only to authenticated service roles
-- (No select policy for anon/auth roles)


