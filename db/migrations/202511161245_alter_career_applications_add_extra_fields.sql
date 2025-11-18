-- Add preferred_area column if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'career_applications' 
    and column_name = 'preferred_area'
  ) then
    alter table public.career_applications add column preferred_area text;
  end if;
end $$;

-- Add course_program column if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'career_applications' 
    and column_name = 'course_program'
  ) then
    alter table public.career_applications add column course_program text;
  end if;
end $$;


