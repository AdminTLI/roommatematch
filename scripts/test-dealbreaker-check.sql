-- Test the dealbreaker check directly
-- Replace with your actual user IDs

-- Test 1: Check what preferences each user has
SELECT 
  'User A' as user_label,
  resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)->'M8_Q8' as M8_Q8,
  resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)->'M8_Q14' as M8_Q14,
  resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)->'M8_Q15' as M8_Q15,
  resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)->'M8_Q16' as M8_Q16,
  resolve_user_preferences('2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid)->'M8_Q17' as M8_Q17

UNION ALL

SELECT 
  'User B' as user_label,
  resolve_user_preferences('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid)->'M8_Q8' as M8_Q8,
  resolve_user_preferences('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid)->'M8_Q14' as M8_Q14,
  resolve_user_preferences('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid)->'M8_Q15' as M8_Q15,
  resolve_user_preferences('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid)->'M8_Q16' as M8_Q16,
  resolve_user_preferences('39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid)->'M8_Q17' as M8_Q17;

-- Test 2: Check if dealbreaker check passes
SELECT 
  check_hard_constraints(
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid,
    '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid
  ) as passes_dealbreakers;

-- Test 3: Check in reverse order (sometimes order matters)
SELECT 
  check_hard_constraints(
    '39288c03-775f-4c7f-a27c-6dd5ddc6e5db'::uuid,
    '2763f0a1-91fd-482c-81ed-f830327b2c2c'::uuid
  ) as passes_dealbreakers_reverse;













