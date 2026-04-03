-- Test the dealbreaker check directly
-- Replace with your actual user IDs

-- Test 1: Check what preferences each user has
SELECT 
  'User A' as user_label,
  resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid)->'M8_Q8' as M8_Q8,
  resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid)->'M8_Q14' as M8_Q14,
  resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid)->'M8_Q15' as M8_Q15,
  resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid)->'M8_Q16' as M8_Q16,
  resolve_user_preferences('11111111-1111-4111-8111-111111111101'::uuid)->'M8_Q17' as M8_Q17

UNION ALL

SELECT 
  'User B' as user_label,
  resolve_user_preferences('11111111-1111-4111-8111-111111111102'::uuid)->'M8_Q8' as M8_Q8,
  resolve_user_preferences('11111111-1111-4111-8111-111111111102'::uuid)->'M8_Q14' as M8_Q14,
  resolve_user_preferences('11111111-1111-4111-8111-111111111102'::uuid)->'M8_Q15' as M8_Q15,
  resolve_user_preferences('11111111-1111-4111-8111-111111111102'::uuid)->'M8_Q16' as M8_Q16,
  resolve_user_preferences('11111111-1111-4111-8111-111111111102'::uuid)->'M8_Q17' as M8_Q17;

-- Test 2: Check if dealbreaker check passes
SELECT 
  check_hard_constraints(
    '11111111-1111-4111-8111-111111111101'::uuid,
    '11111111-1111-4111-8111-111111111102'::uuid
  ) as passes_dealbreakers;

-- Test 3: Check in reverse order (sometimes order matters)
SELECT 
  check_hard_constraints(
    '11111111-1111-4111-8111-111111111102'::uuid,
    '11111111-1111-4111-8111-111111111101'::uuid
  ) as passes_dealbreakers_reverse;















