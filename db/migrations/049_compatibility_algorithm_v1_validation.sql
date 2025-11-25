-- ============================================
-- Validation Queries for Compatibility Algorithm v1.0
-- ============================================
-- These queries help verify the implementation works correctly
-- Run these after applying migration 049_compatibility_algorithm_v1.sql

-- Test 1: Verify function exists and returns correct structure
SELECT 
  p.proname as function_name,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'compute_compatibility_score';

-- Test 2: Verify helper functions exist
SELECT 
  p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_dimension_value',
    'resolve_user_preferences',
    'check_hard_constraints',
    'get_cleanliness_dimension',
    'get_noise_dimension',
    'get_guests_dimension',
    'get_sleep_dimension',
    'get_shared_spaces_dimension',
    'get_substances_dimension',
    'get_study_social_dimension',
    'get_home_vibe_dimension',
    'calculate_dimension_similarity',
    'calculate_harmony_score',
    'calculate_context_score',
    'generate_watch_out_messages',
    'generate_top_alignment'
  )
ORDER BY p.proname;

-- Test 3: Verify tables exist
SELECT 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('match_interactions')
ORDER BY tablename;

-- Test 4: Verify columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'inconsistency_flags';

-- Test 5: Sample query to test compatibility score (requires test users)
-- Uncomment and modify user IDs to test:
/*
SELECT * FROM compute_compatibility_score(
  '00000000-0000-0000-0000-000000000001'::UUID,
  '00000000-0000-0000-0000-000000000002'::UUID
);
*/

-- Test 6: Verify find_potential_matches uses is_valid_match filter
-- Check that the function includes the dealbreaker filter
SELECT 
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'find_potential_matches';

-- Expected: The function should contain "cs.is_valid_match = true"

-- Test 7: Verify indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'match_interactions'
ORDER BY indexname;

-- Test 8: Verify RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'match_interactions'
ORDER BY policyname;

-- ============================================
-- Manual Test Cases (requires test data)
-- ============================================

-- Test Case 1: Identical users should have high scores
-- Expected: harmony_score ≈ 1.0, context_score ≈ 1.0, compatibility_score ≈ 1.0
-- (Requires two users with identical answers)

-- Test Case 2: Opposite harmony but same context
-- Expected: harmony_score low (close to 0), context_score high, compatibility_score still relatively low
-- (Requires users with opposite answers on all 8 harmony dimensions but same university/programme)

-- Test Case 3: Dealbreaker violation
-- Expected: is_valid_match = false, compatibility_score = 0
-- (Requires pair that violates hard constraint, e.g., pet allergy vs pet owner)

-- Test Case 4: Strict rule + NULL data
-- Expected: is_valid_match = false (strict constraints require explicit data)
-- (Requires user with strict no-smoking rule matched with user who has NULL smoking data)

-- Test Case 5: No strict rule + NULL data
-- Expected: Neutral similarity (0.5) for missing dimensions
-- (Requires users with missing data but no strict constraints)

-- ============================================
-- New Test Cases for Gap Fixes
-- ============================================

-- Test Case 6: Contradiction Detection - Pet Conflict
-- Expected: inconsistency_flags populated with pets_conflict entry
-- (Requires user with M8_Q14 < 0.3 AND (M8_Q15 OR M8_Q16 OR M8_Q17 = true))
/*
SELECT 
  user_id,
  inconsistency_flags
FROM profiles
WHERE inconsistency_flags != '[]'::jsonb
  AND inconsistency_flags @> '[{"type": "pets_conflict"}]'::jsonb;
*/

-- Test Case 7: Budget Dealbreaker - Mismatch
-- Expected: is_valid_match = false when budgets differ by >50%
-- (Requires two users with max_rent_monthly values that differ significantly)
/*
SELECT 
  check_hard_constraints(
    'user_a_id'::UUID,
    'user_b_id'::UUID
  ) as passes_constraints;
-- Expected: false if budgets differ by >50%
*/

-- Test Case 8: Budget Dealbreaker - Strict + Unknown
-- Expected: is_valid_match = false when one user has strict budget (>=1000) and other is NULL
-- (Requires user with max_rent_monthly >= 1000 matched with user with NULL budget)

-- Test Case 9: Lease Length Dealbreaker - No Overlap
-- Expected: is_valid_match = false when min_stay > other user's max_stay
-- (Requires userA with min_stay_months=12 and userB with max_stay_months=6)

-- Test Case 10: Lease Length Dealbreaker - Strict + Unknown
-- Expected: is_valid_match = false when one user has strict long-term (>=6 months) and other has no preference
-- (Requires user with min_stay_months >= 6 matched with user with NULL lease preferences)

-- Test Case 11: Gender Preference Dealbreaker
-- Expected: is_valid_match = false when preferences conflict
-- (Requires userA with gender_preference='same' and gender='M' matched with userB gender='F')
-- Note: Only enforced when both users have explicit preferences and genders are known

-- Test Case 12: Single Source of Truth Verification
-- Expected: Dimension helpers return consistent values when called multiple times
-- Verify that resolve_user_preferences is used consistently
/*
SELECT 
  get_cleanliness_dimension('user_id'::UUID) as cleanliness_1,
  get_cleanliness_dimension('user_id'::UUID) as cleanliness_2;
-- Expected: cleanliness_1 = cleanliness_2 (consistent results)
*/

