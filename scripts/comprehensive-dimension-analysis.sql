-- Comprehensive analysis to verify all dimensions are being used correctly
-- This will help identify why scores are clustering at 74% and 68%

-- Test 1: Get dimension values for multiple user pairs to see variation
WITH test_pairs AS (
  SELECT 
    '11111111-1111-4111-8111-111111111101'::uuid as user_a,
    '11111111-1111-4111-8111-111111111102'::uuid as user_b
  UNION ALL
  SELECT 
    '11111111-1111-4111-8111-111111111101'::uuid as user_a,
    (SELECT id FROM auth.users WHERE id != '11111111-1111-4111-8111-111111111101'::uuid LIMIT 1) as user_b
)
SELECT 
  'Dimension Values User A' as test_type,
  public.get_cleanliness_dimension(tp.user_a) as cleanliness,
  public.get_noise_dimension(tp.user_a) as noise,
  public.get_guests_dimension(tp.user_a) as guests,
  public.get_sleep_dimension(tp.user_a) as sleep,
  public.get_shared_spaces_dimension(tp.user_a) as shared_spaces,
  public.get_substances_dimension(tp.user_a) as substances,
  public.get_study_social_dimension(tp.user_a) as study_social,
  public.get_home_vibe_dimension(tp.user_a) as home_vibe
FROM test_pairs tp
LIMIT 1;

-- Test 2: Calculate dimension similarities for the test pair
SELECT 
  'Dimension Similarities' as test_type,
  public.calculate_dimension_similarity('cleanliness',
    public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as cleanliness_sim,
  public.calculate_dimension_similarity('noise',
    public.get_noise_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_noise_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as noise_sim,
  public.calculate_dimension_similarity('guests',
    public.get_guests_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_guests_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as guests_sim,
  public.calculate_dimension_similarity('sleep',
    public.get_sleep_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_sleep_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as sleep_sim,
  public.calculate_dimension_similarity('shared_spaces',
    public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as shared_spaces_sim,
  public.calculate_dimension_similarity('substances',
    public.get_substances_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_substances_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as substances_sim,
  public.calculate_dimension_similarity('study_social',
    public.get_study_social_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_study_social_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as study_social_sim,
  public.calculate_dimension_similarity('home_vibe',
    public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111101'::uuid),
    public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111102'::uuid)
  ) as home_vibe_sim;

-- Test 3: Calculate harmony score from the similarities
SELECT 
  'Harmony Score Breakdown' as test_type,
  public.calculate_harmony_score(
    public.calculate_dimension_similarity('cleanliness',
      public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    ),
    public.calculate_dimension_similarity('noise',
      public.get_noise_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_noise_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    ),
    public.calculate_dimension_similarity('guests',
      public.get_guests_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_guests_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    ),
    public.calculate_dimension_similarity('sleep',
      public.get_sleep_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_sleep_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    ),
    public.calculate_dimension_similarity('shared_spaces',
      public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    ),
    public.calculate_dimension_similarity('substances',
      public.get_substances_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_substances_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    ),
    public.calculate_dimension_similarity('study_social',
      public.get_study_social_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_study_social_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    ),
    public.calculate_dimension_similarity('home_vibe',
      public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111101'::uuid),
      public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111102'::uuid)
    )
  ) as harmony_score;

-- Test 4: Get full compatibility score breakdown
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  is_valid_match,
  dimension_scores_json,
  ROUND(compatibility_score::numeric * 100, 1) as compatibility_percent,
  ROUND(harmony_score::numeric * 100, 1) as harmony_percent,
  ROUND(context_score::numeric * 100, 1) as context_percent
FROM public.compute_compatibility_score(
  '11111111-1111-4111-8111-111111111101'::uuid,
  '11111111-1111-4111-8111-111111111102'::uuid
);

-- Test 5: Check compatibility scores across multiple pairs to see variation
SELECT 
  user_b.id::text as user_b_id,
  ROUND(cs.compatibility_score::numeric * 100, 1) as compatibility_percent,
  ROUND(cs.harmony_score::numeric * 100, 1) as harmony_percent,
  ROUND(cs.context_score::numeric * 100, 1) as context_percent,
  cs.dimension_scores_json
FROM auth.users user_b
CROSS JOIN LATERAL public.compute_compatibility_score(
  '11111111-1111-4111-8111-111111111101'::uuid,
  user_b.id
) cs
WHERE user_b.id != '11111111-1111-4111-8111-111111111101'::uuid
  AND cs.is_valid_match = true
ORDER BY cs.compatibility_score DESC
LIMIT 10;

