-- Test context scores across different user pairs to see if they're clustering

-- Test 1: Get context scores for user A vs multiple other users
SELECT 
  user_b.id::text as user_b_id,
  ROUND(
    public.calculate_context_score(
      (SELECT university_id FROM public.user_academic WHERE user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid),
      ua.university_id,
      (SELECT program_id FROM public.user_academic WHERE user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid),
      ua.program_id,
      (SELECT p.faculty FROM public.user_academic ua2 LEFT JOIN public.programs p ON ua2.program_id = p.id WHERE ua2.user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid),
      (SELECT p.faculty FROM public.user_academic ua2 LEFT JOIN public.programs p ON ua2.program_id = p.id WHERE ua2.user_id = u.id),
      (SELECT COALESCE(usy.study_year, 1) FROM public.user_study_year_v usy WHERE usy.user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid),
      COALESCE(usy.study_year, 1)
    )::numeric * 100, 1
  ) as context_percent,
  ua.university_id = (SELECT university_id FROM public.user_academic WHERE user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as same_university,
  ua.program_id = (SELECT program_id FROM public.user_academic WHERE user_id = '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid) as same_program
FROM auth.users u
JOIN public.user_academic ua ON u.id = ua.user_id
LEFT JOIN public.user_study_year_v usy ON u.id = usy.user_id
WHERE u.id != '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid
  AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = u.id AND verification_status = 'verified')
LIMIT 10;

