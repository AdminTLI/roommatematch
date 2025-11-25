# Compatibility Algorithm v1.0 Implementation Summary

## Overview

This document summarizes the implementation of the production-ready 4-layer compatibility algorithm for Domu Match roommate matching platform.

**Algorithm Version:** v1.0  
**Migration File:** `db/migrations/049_compatibility_algorithm_v1.sql`  
**Status:** Ready for deployment

## Architecture

The algorithm implements a 4-layer compatibility engine:

1. **Dealbreaker Filter** (hard constraints) - Filters out incompatible pairs before scoring
2. **Harmony Score** (core living compatibility, 8 dimensions) - Risk-aware living compatibility
3. **Context Score** (academic + lifestyle context) - Soft bonus for shared academic context
4. **Global Score** (final compatibility) - Weighted combination: 75% harmony + 25% context

## Key Features

### Phase 0: Safeguards & Robustness

- **Contradiction Detection**: `resolve_user_preferences()` normalizes conflicting answers
- **Strict Preference Handling**: Strict rules + unknown data → hard fail (Phase 0.2)
- **Stable Question-Key Mapping**: `get_dimension_value()` uses stable question IDs (M4_Q1, etc.) instead of hardcoded JSON paths
- **Asymmetric Dimensions**: NOISE, GUESTS, SUBSTANCES, SLEEP apply stronger penalties for high-sensitivity + high-activity conflicts
- **Fairness Safeguards**: No protected attributes used; gender constraints opt-in only
- **Algorithm Versioning**: All scores include `algorithm_version = 'v1.0'` for future interpretability
- **Performance**: Pre-filtering and proper indexes for O(1) scoring per pair
- **Explanation Templates**: User-friendly messages for `watch_out` and `top_alignment`

### Harmony Dimensions (8 dimensions, weighted)

1. **CLEANLINESS** (0.18) - Kitchen, bathroom, living area standards
2. **NOISE** (0.14) - Sensitivity to noise, background sounds, volume preferences
3. **GUESTS** (0.14) - Daytime and overnight guest frequency
4. **SLEEP** (0.12) - Chronotype, sleep schedules, quiet hours
5. **SHARED SPACES** (0.10) - Door policy, study in common areas, socializing preferences
6. **SUBSTANCES** (0.12) - Alcohol comfort level, smoking preferences
7. **STUDY/SOCIAL BALANCE** (0.10) - Balance between study time and social activities
8. **HOME VIBE** (0.10) - Home identity (social hub vs quiet retreat)

**Harmony Score Formula:**
```
harmony_score = 0.7 * weighted_avg + 0.3 * ((worst + second_worst) / 2.0)
```

### Context Score Components

- **University Match** (0.40): Same university → 1.0, else 0.0
- **Programme/Faculty** (0.35): Same programme → 1.0, same faculty → 0.6, else 0.0
- **Study Year** (0.25): Year difference ≤2 → 1.0, ≥6 → 0.0, else linear interpolation

### Dealbreaker Constraints

- **Smoking**: M8_Q8 "No smoking/vaping indoors" (strict) → fails if other user smokes or data unknown
- **Pets**: M8_Q14 "Prefer no pets" + M8_Q15/M8_Q16/M8_Q17 → fails if incompatible or unknown
- **Budget/Lease**: TODO - Implement when schema fields confirmed
- **Gender Preference**: Only if explicit and legally compliant

## Database Changes

### New Tables

- `match_interactions` - For future ML logging (includes `algorithm_version`)

### Schema Extensions

- `profiles.inconsistency_flags` (JSONB) - Stores contradiction detection flags

### New Functions

**Core Functions:**
- `compute_compatibility_score(user_a_id, user_b_id)` - Main compatibility function
- `check_hard_constraints(user_a_id, user_b_id)` - Dealbreaker filter
- `find_potential_matches(user_id, limit, min_score)` - Updated to filter by dealbreakers

**Helper Functions:**
- `get_dimension_value(user_id, question_key)` - Stable question-key mapping
- `resolve_user_preferences(user_id)` - Contradiction detection and normalization
- `get_cleanliness_dimension(user_id)` - Extract cleanliness dimension
- `get_noise_dimension(user_id)` - Extract noise dimension
- `get_guests_dimension(user_id)` - Extract guests dimension
- `get_sleep_dimension(user_id)` - Extract sleep dimension
- `get_shared_spaces_dimension(user_id)` - Extract shared spaces dimension
- `get_substances_dimension(user_id)` - Extract substances dimension
- `get_study_social_dimension(user_id)` - Extract study/social balance dimension
- `get_home_vibe_dimension(user_id)` - Extract home vibe dimension
- `calculate_dimension_similarity(dimension_name, value_a, value_b)` - Similarity with asymmetric penalties
- `calculate_harmony_score(...)` - Harmony aggregation
- `calculate_context_score(...)` - Context score calculation
- `generate_watch_out_messages(dimension_scores_json)` - User-friendly warnings
- `generate_top_alignment(...)` - User-friendly alignment messages

**Normalization Functions:**
- `normalize_likert_value(value)` - Normalize likert scales to [0,1]
- `normalize_mcq_value(value, options)` - Normalize MCQ/enum values to [0,1]
- `normalize_bipolar_value(value)` - Normalize bipolar values to [0,1]

## Return Structure

The `compute_compatibility_score` function returns:

**Existing Fields (backward compatible):**
- `compatibility_score` (NUMERIC) - Final score [0,1]
- `personality_score` (NUMERIC) - Mapped from harmony score
- `schedule_score` (NUMERIC) - Mapped from sleep dimension
- `lifestyle_score` (NUMERIC) - Mapped from cleanliness + shared spaces
- `social_score` (NUMERIC) - Mapped from guests + noise
- `academic_bonus` (NUMERIC) - Mapped from context_score
- `penalty` (NUMERIC) - From dealbreakers (currently 0)
- `top_alignment` (TEXT) - User-friendly alignment message
- `watch_out` (TEXT) - User-friendly warning messages
- `house_rules_suggestion` (TEXT) - Suggested house rules
- `academic_details` (JSONB) - Academic affinity details

**New Fields:**
- `harmony_score` (NUMERIC) - Core living compatibility [0,1]
- `context_score` (NUMERIC) - Academic context bonus [0,1]
- `dimension_scores_json` (JSONB) - All 8 dimension similarities
- `is_valid_match` (BOOLEAN) - True if passes dealbreaker check
- `algorithm_version` (TEXT) - 'v1.0'

## Usage

### Basic Usage

```sql
-- Get compatibility score for two users
SELECT * FROM compute_compatibility_score(
  'user-a-uuid'::UUID,
  'user-b-uuid'::UUID
);

-- Find potential matches for a user
SELECT * FROM find_potential_matches(
  'user-uuid'::UUID,
  20,  -- limit
  0.6  -- min_score
);
```

### Checking Dealbreakers

```sql
-- Check if two users pass hard constraints
SELECT check_hard_constraints(
  'user-a-uuid'::UUID,
  'user-b-uuid'::UUID
);
```

## Question Key Mapping

The algorithm uses stable question keys from `item-bank.v1.json`:

- **CLEANLINESS**: M4_Q1 (kitchen), M4_Q2 (bathroom), M4_Q3 (living area)
- **NOISE**: M3_Q1 (sensitivity), M3_Q2 (background noise), M3_Q4 (volume)
- **GUESTS**: M5_Q3 (daytime), M5_Q4 (overnight), M5_Q5 (weeknight preference)
- **SLEEP**: M2_Q1 (chronotype), M2_Q2 (weeknight window), M2_Q3 (weekend window)
- **SHARED SPACES**: M7_Q1 (door policy), M7_Q3 (study in common), M7_Q4 (socializing)
- **SUBSTANCES**: M5_Q18 (alcohol common), M5_Q19 (alcohol private), M8_Q8 (smoking)
- **STUDY/SOCIAL**: M1_Q13 (energized by social), M5_Q1 (social home), M5_Q2 (quiet home)
- **HOME VIBE**: M1_Q6 (home identity)

## Testing

Run validation queries from `db/migrations/049_compatibility_algorithm_v1_validation.sql` to verify:
- All functions exist
- Tables and indexes are created
- RLS policies are in place
- Function signatures are correct

## Performance Considerations

- `compute_compatibility_score` is O(1) per pair (no loops, uses indexes)
- `find_potential_matches` pre-filters by university, active status, verification
- All dimension extraction functions use `STABLE` volatility for query optimization
- Proper indexes exist on all lookup tables

## Future Enhancements

- Budget and lease length dealbreaker checks (when schema fields confirmed)
- Enhanced contradiction detection for all question types
- ML model training using `match_interactions` table
- A/B testing framework using `algorithm_version` field

## Notes

- All dimension extraction goes through `get_dimension_value()` for stability
- All preference lookups use `resolve_user_preferences()` for contradiction handling
- Missing data defaults to neutral 0.5 for harmony scoring
- Strict constraints require explicit data (NULL → fail)
- Algorithm is symmetric: `compute_compatibility_score(a, b) = compute_compatibility_score(b, a)`

