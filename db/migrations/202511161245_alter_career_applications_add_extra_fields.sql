alter table public.career_applications
  add column if not exists preferred_area text,
  add column if not exists course_program text;


