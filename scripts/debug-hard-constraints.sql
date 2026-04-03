-- Debug which hard constraint is failing
-- This will help identify why is_valid_match is false

-- Test check_hard_constraints directly
SELECT 
  'Hard constraints check' as test,
  public.check_hard_constraints(
    '11111111-1111-4111-8111-111111111101'::uuid,
    '11111111-1111-4111-8111-111111111102'::uuid
  ) as passes_constraints;

-- Check resolved preferences for both users to see what values they have
SELECT 
  'User A resolved prefs (sample)' as test,
  jsonb_object_keys(resolved) as key,
  resolved->jsonb_object_keys(resolved) as value
FROM (
  SELECT public.resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid) as resolved
) t
WHERE jsonb_object_keys(resolved) IN ('M8_Q8', 'M8_Q14', 'M8_Q15', 'M8_Q16', 'M8_Q17')
LIMIT 10;

SELECT 
  'User B resolved prefs (sample)' as test,
  jsonb_object_keys(resolved) as key,
  resolved->jsonb_object_keys(resolved) as value
FROM (
  SELECT public.resolve_user_preferences('11111111-1111-4111-8111-111111111102'::uuid) as resolved
) t
WHERE jsonb_object_keys(resolved) IN ('M8_Q8', 'M8_Q14', 'M8_Q15', 'M8_Q16', 'M8_Q17')
LIMIT 10;

-- Check budget and lease preferences
SELECT 
  'User A budget/lease' as test,
  uhp.max_rent_monthly as budget,
  uhp.min_stay_months as min_stay,
  uhp.max_stay_months as max_stay
FROM public.user_housing_preferences uhp
WHERE uhp.user_id = '11111111-1111-4111-8111-111111111101'::uuid;

SELECT 
  'User B budget/lease' as test,
  uhp.max_rent_monthly as budget,
  uhp.min_stay_months as min_stay,
  uhp.max_stay_months as max_stay
FROM public.user_housing_preferences uhp
WHERE uhp.user_id = '11111111-1111-4111-8111-111111111102'::uuid;

