-- Create programs table (WO research programmes)
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null,
  croho_code text not null unique,
  name text not null, -- NL name
  name_en text, -- EN translation
  degree_level text not null check (degree_level in ('Bachelor', 'Master', 'Pre-Master')),
  language_codes text[] default '{}'::text[], -- e.g. ['nl', 'en']
  faculty text, -- Faculty/department name
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  foreign key (university_id) references public.universities(id) on delete cascade
);

-- Create user_academic table (student academic profile)
create table public.user_academic (
  user_id uuid primary key,
  university_id uuid not null,
  degree_level text not null check (degree_level in ('Bachelor', 'Master', 'Pre-Master')),
  program_id uuid,
  undecided_program boolean default false,
  study_start_year integer not null check (study_start_year >= 2000 and study_start_year <= 2100),
  last_edited_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  foreign key (user_id) references auth.users(id) on delete cascade,
  foreign key (university_id) references public.universities(id) on delete restrict,
  foreign key (program_id) references public.programs(id) on delete set null
);

-- Create computed view: user_study_year
create or replace view public.user_study_year_v as
select
  ua.user_id,
  ua.university_id,
  ua.degree_level,
  ua.program_id,
  ua.study_start_year,
  extract(year from now())::integer - ua.study_start_year as study_year,
  ua.created_at,
  ua.updated_at
from public.user_academic ua;

-- Create trigger function for 30-day edit cooldown on user_academic
create or replace function public.check_user_academic_cooldown()
returns trigger as $$
begin
  if (
    select (now() - last_edited_at) < interval '30 days'
    from public.user_academic
    where user_id = new.user_id
  ) then
    -- Check if bypass role (admin) exists; admins can skip cooldown
    if current_user != 'postgres' and not exists(
      select 1 from public.user_roles where user_id = new.user_id and role = 'admin'
    ) then
      raise exception 'Cannot edit academic profile within 30 days of last edit';
    end if;
  end if;
  
  new.last_edited_at = now();
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to user_academic updates
create trigger user_academic_cooldown_trigger
before update on public.user_academic
for each row
execute function public.check_user_academic_cooldown();

-- Auto-update timestamp on insert/update
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger programs_updated_at_trigger
before update on public.programs
for each row
execute function public.update_timestamp();

-- RLS Policies for programs table (read-only, publicly visible for active programs)
alter table public.programs enable row level security;

create policy "programs_public_read" on public.programs
for select using (active = true);

create policy "programs_admin_all" on public.programs
using (auth.uid() in (select user_id from public.user_roles where role = 'admin'));

-- RLS Policies for user_academic table
alter table public.user_academic enable row level security;

create policy "user_academic_self_read" on public.user_academic
for select using (auth.uid() = user_id);

create policy "user_academic_self_write" on public.user_academic
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_academic_self_insert" on public.user_academic
for insert with check (auth.uid() = user_id);

create policy "user_academic_admin_all" on public.user_academic
using (auth.uid() in (select user_id from public.user_roles where role = 'admin'));

-- Create indexes for performance
create index programs_university_idx on public.programs(university_id);
create index programs_degree_level_idx on public.programs(degree_level);
create index programs_active_idx on public.programs(active) where active = true;
create index user_academic_university_idx on public.user_academic(university_id);
create index user_academic_program_idx on public.user_academic(program_id);
create index user_academic_study_start_idx on public.user_academic(study_start_year);

-- Grants (assuming public role for read-only access to active programs)
grant select on public.programs to anon;
grant select on public.user_study_year_v to authenticated;
