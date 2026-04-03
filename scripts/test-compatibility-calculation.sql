-- Test the full compatibility calculation to see where the clustering comes from

-- Test 1: Get actual dimension values for two users
SELECT 
  'User A dimensions' as label,
  public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111101'::uuid) as cleanliness,
  public.get_noise_dimension('11111111-1111-4111-8111-111111111101'::uuid) as noise,
  public.get_guests_dimension('11111111-1111-4111-8111-111111111101'::uuid) as guests,
  public.get_sleep_dimension('11111111-1111-4111-8111-111111111101'::uuid) as sleep,
  public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111101'::uuid) as shared_spaces,
  public.get_substances_dimension('11111111-1111-4111-8111-111111111101'::uuid) as substances,
  public.get_study_social_dimension('11111111-1111-4111-8111-111111111101'::uuid) as study_social,
  public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111101'::uuid) as home_vibe;

-- Test 2: Get dimension values for user B
SELECT 
  'User B dimensions' as label,
  public.get_cleanliness_dimension('11111111-1111-4111-8111-111111111102'::uuid) as cleanliness,
  public.get_noise_dimension('11111111-1111-4111-8111-111111111102'::uuid) as noise,
  public.get_guests_dimension('11111111-1111-4111-8111-111111111102'::uuid) as guests,
  public.get_sleep_dimension('11111111-1111-4111-8111-111111111102'::uuid) as sleep,
  public.get_shared_spaces_dimension('11111111-1111-4111-8111-111111111102'::uuid) as shared_spaces,
  public.get_substances_dimension('11111111-1111-4111-8111-111111111102'::uuid) as substances,
  public.get_study_social_dimension('11111111-1111-4111-8111-111111111102'::uuid) as study_social,
  public.get_home_vibe_dimension('11111111-1111-4111-8111-111111111102'::uuid) as home_vibe;

-- Test 3: Calculate dimension similarities
SELECT 
  'Dimension Similarities' as label,
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

-- Test 4: Calculate harmony score
SELECT 
  'Harmony Score' as label,
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

-- Test 5: Get full compatibility score breakdown
SELECT 
  compatibility_score,
  harmony_score,
  context_score,
  personality_score,
  schedule_score,
  lifestyle_score,
  social_score,
  ROUND(compatibility_score::numeric * 100, 0) as compatibility_percent,
  ROUND(harmony_score::numeric * 100, 0) as harmony_percent,
  ROUND(context_score::numeric * 100, 0) as context_percent
FROM public.compute_compatibility_score(
  '11111111-1111-4111-8111-111111111101'::uuid,
  '11111111-1111-4111-8111-111111111102'::uuid
);

