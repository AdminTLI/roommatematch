-- ============================================
-- Compatibility Algorithm v1.0 Implementation
-- ============================================
-- This migration implements a production-ready 4-layer compatibility engine:
-- 1. Dealbreaker Filter (hard constraints)
-- 2. Harmony Score (core living compatibility, 8 dimensions)
-- 3. Context Score (academic + lifestyle context)
-- 4. Global Score (final compatibility with logging support)
--
-- Algorithm Version: v1.0
-- This algorithm is designed to be fair and non-discriminatory.
-- DO NOT use protected attributes (race, ethnicity, religion, sexual orientation, nationality, disability status)
-- Gender-based constraints are opt-in only, never inferred.

-- ============================================
-- Phase 0: Schema Extensions
-- ============================================

-- Add inconsistency_flags column to profiles table for contradiction detection
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS inconsistency_flags JSONB DEFAULT '{}';

-- Create match_interactions table for future ML logging
CREATE TABLE IF NOT EXISTS match_interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  compatibility_score NUMERIC(4,3) NOT NULL,
  harmony_score NUMERIC(4,3) NOT NULL,
  context_score NUMERIC(4,3) NOT NULL,
  algorithm_version TEXT NOT NULL DEFAULT 'v1.0',
  interaction_type TEXT NOT NULL, -- e.g. 'shown', 'opened', 'liked', 'skipped'
  extra_metadata JSONB DEFAULT '{}',
  CONSTRAINT valid_interaction_type CHECK (interaction_type IN ('shown', 'opened', 'liked', 'skipped', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_match_interactions_user_id ON match_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_other_user_id ON match_interactions(other_user_id);
CREATE INDEX IF NOT EXISTS idx_match_interactions_created_at ON match_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_match_interactions_algorithm_version ON match_interactions(algorithm_version);

-- Enable RLS on match_interactions
ALTER TABLE match_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own interactions
DROP POLICY IF EXISTS "match_interactions_own" ON match_interactions;
CREATE POLICY "match_interactions_own" ON match_interactions
  FOR SELECT USING (user_id = auth.uid() OR other_user_id = auth.uid());

-- RLS Policy: Service role can insert (for logging)
DROP POLICY IF EXISTS "match_interactions_service_role" ON match_interactions;
CREATE POLICY "match_interactions_service_role" ON match_interactions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Phase 0.3: Stable Question-Key Mapping Layer
-- ============================================
-- This mapping layer is the single source of truth for dimension values.
-- Question keys (e.g., "M4_Q1") are stable identifiers that don't change
-- when the onboarding UI structure changes.

-- Helper function to get dimension value from question keys
-- This function abstracts away the JSONB structure and provides a stable interface
-- IMPORTANT: This is the single source of truth for dimension values
-- Question keys (e.g., "M4_Q1") are stable identifiers that don't change
-- when the onboarding UI structure changes.
-- 
-- If p_resolved_prefs is provided, it takes priority (contains normalized, contradiction-free values)
CREATE OR REPLACE FUNCTION get_dimension_value(
  p_user_id UUID,
  p_question_key TEXT,
  p_resolved_prefs JSONB DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_value JSONB;
  v_section_record RECORD;
BEGIN
  -- If resolved preferences provided, check there first (single source of truth)
  -- This ensures we use normalized, contradiction-free values
  IF p_resolved_prefs IS NOT NULL AND p_resolved_prefs ? p_question_key THEN
    v_value := p_resolved_prefs->p_question_key;
    IF v_value IS NOT NULL THEN
      RETURN v_value;
    END IF;
  END IF;
  
  -- Otherwise, fall back to raw lookup from onboarding_sections
  -- First, try to find in onboarding_sections by searching through all sections
  -- The answers JSONB contains question keys as top-level keys
  FOR v_section_record IN
    SELECT answers FROM onboarding_sections WHERE user_id = p_user_id
  LOOP
    -- Check if this section's answers contain the question key
    IF v_section_record.answers ? p_question_key THEN
      v_value := v_section_record.answers->p_question_key;
      -- If found, return it
      IF v_value IS NOT NULL THEN
        RETURN v_value;
      END IF;
    END IF;
  END LOOP;
  
  -- Fallback to responses table
  SELECT r.value INTO v_value
  FROM responses r
  WHERE r.user_id = p_user_id
    AND r.question_key = p_question_key
  LIMIT 1;
  
  -- Return NULL if not found (caller will handle default with 0.5 neutral)
  RETURN v_value;
END;
$$;

-- ============================================
-- Phase 0.1: Contradiction Detection & Resolution
-- ============================================

-- Helper function to resolve user preferences (normalize contradictions)
-- Priority: strict constraints override softer conflicting preferences
-- This function is the single source of truth for normalized, contradiction-free preferences
-- NOTE: STABLE (not VOLATILE) because we don't UPDATE the database here to avoid
-- "UPDATE in read-only transaction" errors in Supabase RPC calls
-- Inconsistency detection happens but flags are not persisted synchronously
CREATE OR REPLACE FUNCTION resolve_user_preferences(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB := '{}'::jsonb;
  v_inconsistencies JSONB := '[]'::jsonb;
  v_all_answers JSONB := '{}'::jsonb;
  v_section_record RECORD;
  v_m8_q8_value JSONB;
  v_m8_q14_value JSONB;
  v_m8_q15_value JSONB;
  v_m8_q16_value JSONB;
  v_m8_q17_value JSONB;
  v_pet_pref_norm NUMERIC;
  v_has_pet_tolerance BOOLEAN := false;
  v_contradiction_entry JSONB;
BEGIN
  -- Collect all answers from onboarding_sections
  -- Answers are stored as JSONB array: [{itemId: 'M4_Q1', value: 'high'}, ...]
  -- We need to convert to flat object: {'M4_Q1': 'high', ...}
  FOR v_section_record IN
    SELECT answers FROM onboarding_sections WHERE user_id = p_user_id
  LOOP
    -- Check if answers is an array (new format) or object (old format)
    IF jsonb_typeof(v_section_record.answers) = 'array' THEN
      -- New format: array of {itemId, value, dealBreaker} objects
      -- Convert to flat object: {itemId: value}
      FOR i IN 0..jsonb_array_length(v_section_record.answers) - 1 LOOP
        DECLARE
          answer_item JSONB := v_section_record.answers->i;
          item_id TEXT;
          item_value JSONB;
        BEGIN
          -- Extract itemId and value from answer object
          item_id := answer_item->>'itemId';
          -- Extract value - handle nested {value: X} structure
          item_value := answer_item->'value';
          IF item_value IS NOT NULL AND jsonb_typeof(item_value) = 'object' AND item_value ? 'value' THEN
            item_value := item_value->'value';
          END IF;
          
          -- Add to flat object if we have both itemId and value
          IF item_id IS NOT NULL AND item_value IS NOT NULL THEN
            v_all_answers := v_all_answers || jsonb_build_object(item_id, item_value);
          END IF;
        END;
      END LOOP;
    ELSE
      -- Old format: already a flat object, merge directly
      v_all_answers := v_all_answers || v_section_record.answers;
    END IF;
  END LOOP;
  
  -- Start with all answers as resolved (will override contradictions)
  v_resolved := v_all_answers;
  
  -- ============================================
  -- Detect and resolve smoking contradictions
  -- ============================================
  -- M8_Q8: "No smoking/vaping indoors under any circumstances" (strict dealbreaker)
  -- Check if user has strict no-smoking but also indicates they smoke
  v_m8_q8_value := v_all_answers->'M8_Q8';
  
  IF v_m8_q8_value IS NOT NULL AND 
     (jsonb_typeof(v_m8_q8_value) = 'boolean' AND v_m8_q8_value::boolean = true) THEN
    -- User has strict no-smoking rule
    -- Check if they also indicate they smoke (would be in a "do you smoke" question)
    -- For now, we check if M5_Q17 (less strict smoking rule) is also set, which might indicate they smoke
    -- In a full implementation, we'd check a specific "do you smoke" question
    -- Priority: strict constraint wins - if M8_Q8=true, enforce no smoking
    
    -- Log if there's a potential contradiction (user wants no smoking but might smoke themselves)
    -- This is a simplified check - in production, you'd have a specific "do you smoke" question
    -- For now, we just ensure strict constraint is enforced
  END IF;
  
  -- ============================================
  -- Detect and resolve pet contradictions
  -- ============================================
  -- M8_Q14: "Prefer no pets" (bipolar: left="Prefer no pets" < 0.3, right="Okay with some pets" > 0.7)
  -- M8_Q15/M8_Q16/M8_Q17: "I'm okay with cats/dogs/small animals" (boolean toggles)
  v_m8_q14_value := v_all_answers->'M8_Q14';
  v_m8_q15_value := v_all_answers->'M8_Q15';
  v_m8_q16_value := v_all_answers->'M8_Q16';
  v_m8_q17_value := v_all_answers->'M8_Q17';
  
  -- Check if user prefers no pets (strict preference)
  IF v_m8_q14_value IS NOT NULL THEN
    v_pet_pref_norm := normalize_bipolar_value(v_m8_q14_value);
    
    -- Check if user has pet tolerance toggles set
    v_has_pet_tolerance := 
      (v_m8_q15_value IS NOT NULL AND jsonb_typeof(v_m8_q15_value) = 'boolean' AND v_m8_q15_value::boolean = true) OR
      (v_m8_q16_value IS NOT NULL AND jsonb_typeof(v_m8_q16_value) = 'boolean' AND v_m8_q16_value::boolean = true) OR
      (v_m8_q17_value IS NOT NULL AND jsonb_typeof(v_m8_q17_value) = 'boolean' AND v_m8_q17_value::boolean = true);
    
    -- If user prefers no pets (strict: < 0.3) but also says okay with pets → contradiction
    IF v_pet_pref_norm < 0.3 AND v_has_pet_tolerance THEN
      -- Flag contradiction
      v_contradiction_entry := jsonb_build_object(
        'type', 'pets_conflict',
        'question_keys', jsonb_build_array('M8_Q14', 'M8_Q15', 'M8_Q16', 'M8_Q17'),
        'resolved_value', 'no_pets_preferred',
        'conflicting_values', jsonb_build_object(
          'M8_Q14', v_m8_q14_value,
          'M8_Q15', v_m8_q15_value,
          'M8_Q16', v_m8_q16_value,
          'M8_Q17', v_m8_q17_value
        ),
        'resolution', 'Strict "no pets" preference overrides pet tolerance toggles'
      );
      v_inconsistencies := v_inconsistencies || jsonb_build_array(v_contradiction_entry);
      
      -- Resolve: enforce strict "no pets" preference (clear tolerance toggles in resolved)
      v_resolved := v_resolved || jsonb_build_object(
        'M8_Q15', false,
        'M8_Q16', false,
        'M8_Q17', false
      );
    END IF;
  END IF;
  
  -- ============================================
  -- Note: Inconsistency flags are NOT updated here to avoid read-only transaction errors
  -- The inconsistencies are detected and resolved in the returned preferences
  -- If needed, inconsistency_flags can be updated separately via a background job or trigger
  -- ============================================
  
  -- Return resolved preferences (contradictions normalized, strict constraints enforced)
  -- Note: v_inconsistencies contains detected contradictions but is not persisted
  -- to avoid "UPDATE in read-only transaction" errors in Supabase RPC calls
  RETURN v_resolved;
END;
$$;

-- ============================================
-- Phase 0.4: Dimension Value Extraction Helpers
-- ============================================
-- These functions extract and normalize values for each harmony dimension
-- All use get_dimension_value() for stable question-key mapping

-- Helper to normalize likert scale values to [0,1]
-- Likert scales: "strongly_disagree"=0, "disagree"=0.25, "neutral"=0.5, "agree"=0.75, "strongly_agree"=1.0
CREATE OR REPLACE FUNCTION normalize_likert_value(
  p_value JSONB
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_value IS NULL THEN
    RETURN 0.5; -- Neutral default
  END IF;
  
  -- Handle string values
  IF jsonb_typeof(p_value) = 'string' THEN
    CASE p_value::text
      WHEN 'strongly_disagree' THEN RETURN 0.0;
      WHEN 'disagree' THEN RETURN 0.25;
      WHEN 'neutral' THEN RETURN 0.5;
      WHEN 'agree' THEN RETURN 0.75;
      WHEN 'strongly_agree' THEN RETURN 1.0;
      ELSE RETURN 0.5;
    END CASE;
  END IF;
  
  -- Handle numeric values (assume 1-5 scale)
  IF jsonb_typeof(p_value) = 'number' THEN
    RETURN LEAST(1.0, GREATEST(0.0, (p_value::numeric - 1) / 4.0));
  END IF;
  
  -- Handle boolean
  IF jsonb_typeof(p_value) = 'boolean' THEN
    RETURN CASE WHEN p_value::boolean THEN 1.0 ELSE 0.0 END;
  END IF;
  
  RETURN 0.5; -- Default neutral
END;
$$;

-- Helper to normalize MCQ/enum values to [0,1]
-- Maps specific option values to numeric scores
CREATE OR REPLACE FUNCTION normalize_mcq_value(
  p_value JSONB,
  p_options JSONB DEFAULT NULL
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_text TEXT;
BEGIN
  IF p_value IS NULL THEN
    RETURN 0.5; -- Neutral default
  END IF;
  
  v_text := p_value::text;
  
  -- Clean up quotes
  v_text := TRIM(BOTH '"' FROM v_text);
  
  -- Map common MCQ values
  -- For cleanliness: "low"=0.0, "medium"=0.5, "high"=1.0
  IF v_text = 'low' THEN RETURN 0.0;
  ELSIF v_text = 'medium' THEN RETURN 0.5;
  ELSIF v_text = 'high' THEN RETURN 1.0;
  END IF;
  
  -- For frequency: "0"=0.0, "1-2"=0.33, "3-4"=0.67, "5+"=1.0
  IF v_text = '0' THEN RETURN 0.0;
  ELSIF v_text = '1-2' THEN RETURN 0.33;
  ELSIF v_text = '3-4' THEN RETURN 0.67;
  ELSIF v_text = '5+' THEN RETURN 1.0;
  END IF;
  
  RETURN 0.5; -- Default neutral
END;
$$;

-- Helper to normalize bipolar values to [0,1]
-- Left side = 0.0, right side = 1.0, middle = 0.5
CREATE OR REPLACE FUNCTION normalize_bipolar_value(
  p_value JSONB
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_text TEXT;
BEGIN
  IF p_value IS NULL THEN
    RETURN 0.5; -- Neutral default
  END IF;
  
  -- Bipolar values are typically numeric 0-100 or -1 to 1
  IF jsonb_typeof(p_value) = 'number' THEN
    -- Assume 0-100 scale, normalize to [0,1]
    RETURN LEAST(1.0, GREATEST(0.0, p_value::numeric / 100.0));
  END IF;
  
  RETURN 0.5; -- Default neutral
END;
$$;

-- ============================================
-- Harmony Dimension Extraction Functions
-- ============================================
-- Each function extracts and normalizes a specific harmony dimension
-- Question keys are from item-bank.v1.json

-- CLEANLINESS dimension (weight: 0.18)
-- Questions: M4_Q1 (kitchen), M4_Q2 (bathroom), M4_Q3 (living area)
CREATE OR REPLACE FUNCTION get_cleanliness_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_kitchen JSONB;
  v_bathroom JSONB;
  v_living JSONB;
  v_kitchen_norm NUMERIC;
  v_bathroom_norm NUMERIC;
  v_living_norm NUMERIC;
BEGIN
  -- Get resolved preferences first (handles contradictions) - single source of truth
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_kitchen := get_dimension_value(p_user_id, 'M4_Q1', v_resolved);
  v_bathroom := get_dimension_value(p_user_id, 'M4_Q2', v_resolved);
  v_living := get_dimension_value(p_user_id, 'M4_Q3', v_resolved);
  
  -- Normalize MCQ values (low=0, medium=0.5, high=1.0)
  v_kitchen_norm := normalize_mcq_value(v_kitchen);
  v_bathroom_norm := normalize_mcq_value(v_bathroom);
  v_living_norm := normalize_mcq_value(v_living);
  
  -- Average the three areas
  RETURN COALESCE((v_kitchen_norm + v_bathroom_norm + v_living_norm) / 3.0, 0.5);
END;
$$;

-- NOISE dimension (weight: 0.14)
-- Questions: M3_Q1 (sensitivity to sudden noises), M3_Q2 (background noise distracts), M3_Q4 (listening volume)
CREATE OR REPLACE FUNCTION get_noise_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_sensitivity JSONB;
  v_background JSONB;
  v_volume JSONB;
  v_sensitivity_norm NUMERIC;
  v_background_norm NUMERIC;
  v_volume_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_sensitivity := get_dimension_value(p_user_id, 'M3_Q1', v_resolved);
  v_background := get_dimension_value(p_user_id, 'M3_Q2', v_resolved);
  v_volume := get_dimension_value(p_user_id, 'M3_Q4', v_resolved);
  
  -- Higher sensitivity/agreement = lower noise tolerance (invert for normalization)
  v_sensitivity_norm := 1.0 - normalize_likert_value(v_sensitivity);
  v_background_norm := 1.0 - normalize_likert_value(v_background);
  -- Volume: low volume = high quiet preference (invert)
  v_volume_norm := 1.0 - normalize_bipolar_value(v_volume);
  
  -- Average (higher = prefers quieter)
  RETURN COALESCE((v_sensitivity_norm + v_background_norm + v_volume_norm) / 3.0, 0.5);
END;
$$;

-- GUESTS dimension (weight: 0.14)
-- Questions: M5_Q3 (daytime guests/week), M5_Q4 (overnight guests/month), M5_Q5 (no weeknight guests - dealbreaker)
CREATE OR REPLACE FUNCTION get_guests_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_daytime JSONB;
  v_overnight JSONB;
  v_daytime_norm NUMERIC;
  v_overnight_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_daytime := get_dimension_value(p_user_id, 'M5_Q3', v_resolved);
  v_overnight := get_dimension_value(p_user_id, 'M5_Q4', v_resolved);
  
  -- Normalize frequency (0=0.0, 1-2=0.33, 3-4=0.67, 5+=1.0)
  v_daytime_norm := normalize_mcq_value(v_daytime);
  v_overnight_norm := normalize_mcq_value(v_overnight);
  
  -- Average (higher = more guests)
  RETURN COALESCE((v_daytime_norm + v_overnight_norm) / 2.0, 0.5);
END;
$$;

-- SLEEP dimension (weight: 0.12)
-- Questions: M2_Q1 (chronotype: night-owl vs morning-lark), M2_Q2 (weeknight sleep window), M2_Q3 (weekend sleep window)
CREATE OR REPLACE FUNCTION get_sleep_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_chronotype JSONB;
  v_weeknight JSONB;
  v_chronotype_norm NUMERIC;
  v_sleep_start NUMERIC;
  v_sleep_end NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_chronotype := get_dimension_value(p_user_id, 'M2_Q1', v_resolved);
  v_weeknight := get_dimension_value(p_user_id, 'M2_Q2', v_resolved);
  
  -- Chronotype: night-owl=0.0, morning-lark=1.0
  v_chronotype_norm := normalize_bipolar_value(v_chronotype);
  
  -- Weeknight sleep window: extract start time and normalize
  -- Format is typically timeRange: {"start": 22.0, "end": 7.0} or similar
  IF v_weeknight IS NOT NULL AND jsonb_typeof(v_weeknight) = 'object' THEN
    v_sleep_start := (v_weeknight->>'start')::numeric;
    -- Normalize sleep start time: 20:00=0.0 (early), 02:00=1.0 (late)
    -- Map 20-26 (8pm-2am) to [0,1]
    IF v_sleep_start IS NOT NULL THEN
      v_chronotype_norm := LEAST(1.0, GREATEST(0.0, (v_sleep_start - 20.0) / 6.0));
    END IF;
  END IF;
  
  RETURN COALESCE(v_chronotype_norm, 0.5);
END;
$$;

-- SHARED SPACES dimension (weight: 0.10)
-- Questions: M7_Q1 (door policy), M7_Q3 (study in common areas), M7_Q4 (common areas for socializing)
CREATE OR REPLACE FUNCTION get_shared_spaces_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_door JSONB;
  v_study JSONB;
  v_social JSONB;
  v_door_norm NUMERIC;
  v_study_norm NUMERIC;
  v_social_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_door := get_dimension_value(p_user_id, 'M7_Q1', v_resolved);
  v_study := get_dimension_value(p_user_id, 'M7_Q3', v_resolved);
  v_social := get_dimension_value(p_user_id, 'M7_Q4', v_resolved);
  
  -- Door: open-door=1.0 (more shared), closed-door=0.0 (more private)
  v_door_norm := normalize_bipolar_value(v_door);
  -- Study in common areas: agree=1.0 (more shared)
  v_study_norm := normalize_likert_value(v_study);
  -- Common areas for socializing: agree=1.0 (more shared)
  v_social_norm := normalize_likert_value(v_social);
  
  RETURN COALESCE((v_door_norm + v_study_norm + v_social_norm) / 3.0, 0.5);
END;
$$;

-- SUBSTANCES dimension (weight: 0.12)
-- Questions: M5_Q18 (alcohol in common areas), M5_Q19 (alcohol limited to private rooms), M8_Q8 (no smoking - dealbreaker)
CREATE OR REPLACE FUNCTION get_substances_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_alcohol_common JSONB;
  v_alcohol_private JSONB;
  v_alcohol_common_norm NUMERIC;
  v_alcohol_private_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_alcohol_common := get_dimension_value(p_user_id, 'M5_Q18', v_resolved);
  v_alcohol_private := get_dimension_value(p_user_id, 'M5_Q19', v_resolved);
  
  -- Alcohol in common areas: agree=1.0 (more comfortable)
  v_alcohol_common_norm := normalize_likert_value(v_alcohol_common);
  -- Alcohol limited to private: agree=0.0 (less comfortable with substances)
  v_alcohol_private_norm := 1.0 - normalize_likert_value(v_alcohol_private);
  
  -- Average (higher = more comfortable with substances)
  RETURN COALESCE((v_alcohol_common_norm + v_alcohol_private_norm) / 2.0, 0.5);
END;
$$;

-- STUDY/SOCIAL BALANCE dimension (weight: 0.10)
-- Questions: M1_Q13 (energized by social activity), M5_Q1 (socially active home), M5_Q2 (quiet home)
CREATE OR REPLACE FUNCTION get_study_social_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_energized JSONB;
  v_social_home JSONB;
  v_quiet_home JSONB;
  v_energized_norm NUMERIC;
  v_social_norm NUMERIC;
  v_quiet_norm NUMERIC;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_energized := get_dimension_value(p_user_id, 'M1_Q13', v_resolved);
  v_social_home := get_dimension_value(p_user_id, 'M5_Q1', v_resolved);
  v_quiet_home := get_dimension_value(p_user_id, 'M5_Q2', v_resolved);
  
  -- Energized by social: agree=1.0 (more social)
  v_energized_norm := normalize_likert_value(v_energized);
  -- Socially active home: agree=1.0 (more social)
  v_social_norm := normalize_likert_value(v_social_home);
  -- Quiet home: agree=0.0 (less social)
  v_quiet_norm := 1.0 - normalize_likert_value(v_quiet_home);
  
  RETURN COALESCE((v_energized_norm + v_social_norm + v_quiet_norm) / 3.0, 0.5);
END;
$$;

-- HOME VIBE dimension (weight: 0.10)
-- Questions: M1_Q6 (home identity: social hub vs quiet retreat)
CREATE OR REPLACE FUNCTION get_home_vibe_dimension(
  p_user_id UUID
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_resolved JSONB;
  v_home_identity JSONB;
BEGIN
  -- Get resolved preferences (single source of truth)
  v_resolved := resolve_user_preferences(p_user_id);
  
  v_home_identity := get_dimension_value(p_user_id, 'M1_Q6', v_resolved);
  
  -- Bipolar: left="Home as social hub"=0.0, right="Home as quiet retreat"=1.0
  -- For compatibility, we want similar values, so return as-is
  RETURN COALESCE(normalize_bipolar_value(v_home_identity), 0.5);
END;
$$;

-- ============================================
-- Phase 2: Dealbreaker Filter Implementation
-- ============================================

-- Check hard constraints between two users
-- Returns TRUE if pair passes all hard constraints, FALSE otherwise
-- IMPORTANT: All lookups MUST call resolve_user_preferences() first
CREATE OR REPLACE FUNCTION check_hard_constraints(
  user_a_id UUID,
  user_b_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_a_prefs JSONB;
  v_b_prefs JSONB;
  v_a_no_smoking_strict BOOLEAN := false;
  v_b_smokes BOOLEAN := false;
  v_a_no_pets_strict BOOLEAN := false;
  v_b_has_pets BOOLEAN := false;
  v_a_has_pets BOOLEAN := false;
  v_a_allergic_pets BOOLEAN := false;
  v_a_pet_pref NUMERIC;
  v_b_pet_pref NUMERIC;
  -- Budget variables
  v_a_budget NUMERIC;
  v_b_budget NUMERIC;
  -- Lease length variables
  v_a_min_stay INTEGER;
  v_a_max_stay INTEGER;
  v_b_min_stay INTEGER;
  v_b_max_stay INTEGER;
  -- Gender preference variables (commented out - no gender column in profiles table)
  -- v_a_gender_pref TEXT;
  -- v_b_gender_pref TEXT;
  -- v_a_gender TEXT;
  -- v_b_gender TEXT;
BEGIN
  -- Get resolved preferences (handles contradictions)
  v_a_prefs := resolve_user_preferences(user_a_id);
  v_b_prefs := resolve_user_preferences(user_b_id);
  
  -- 1. Smoking constraints
  -- M8_Q8: "No smoking/vaping indoors under any circumstances" (strict dealbreaker)
  -- M5_Q17: "Smoking/vaping only outside" (less strict)
  -- Check if userA has strict no-smoking and userB smokes
  IF (v_a_prefs->>'M8_Q8')::boolean = true THEN
    v_a_no_smoking_strict := true;
    -- Check if userB indicates they smoke (would need to check their own smoking status)
    -- For now, if userB doesn't have M8_Q8=true, assume they might smoke
    -- In reality, we'd check a "do you smoke" question
    IF (v_b_prefs->>'M8_Q8')::boolean IS NULL OR (v_b_prefs->>'M8_Q8')::boolean = false THEN
      -- Strict rule + unknown/missing data → fail (Phase 0.2)
      RETURN false;
    END IF;
  END IF;
  
  -- Symmetric check: userB strict no-smoking vs userA
  IF (v_b_prefs->>'M8_Q8')::boolean = true THEN
    IF (v_a_prefs->>'M8_Q8')::boolean IS NULL OR (v_a_prefs->>'M8_Q8')::boolean = false THEN
      RETURN false;
    END IF;
  END IF;
  
  -- 2. Pets vs allergies
  -- M8_Q14: "Prefer no pets" (bipolar: left="Prefer no pets", right="Okay with some pets")
  -- M8_Q15/M8_Q16/M8_Q17: "I'm okay with cats/dogs/small animals" (toggle)
  -- Check if userA has "no pets" preference and userB has pets or wants pets
  
  -- Get userA's pet preference (normalized: < 0.3 = no pets)
  IF (v_a_prefs->>'M8_Q14') IS NOT NULL THEN
    v_a_pet_pref := normalize_bipolar_value(v_a_prefs->'M8_Q14');
    -- If userA prefers no pets (strict)
    IF v_a_pet_pref < 0.3 THEN
      -- Check if userB has any pets or wants pets
      v_b_has_pets := COALESCE((v_b_prefs->>'M8_Q15')::boolean, false) OR
                     COALESCE((v_b_prefs->>'M8_Q16')::boolean, false) OR
                     COALESCE((v_b_prefs->>'M8_Q17')::boolean, false);
      -- If userB has pets and userA doesn't want pets → fail
      IF v_b_has_pets THEN
        RETURN false;
      END IF;
      -- If userA has strict no-pets and userB's preference is NULL → fail (strict rule + unknown)
      IF (v_b_prefs->>'M8_Q14') IS NULL AND 
         (v_b_prefs->>'M8_Q15') IS NULL AND
         (v_b_prefs->>'M8_Q16') IS NULL AND
         (v_b_prefs->>'M8_Q17') IS NULL THEN
        RETURN false; -- Strict rule + unknown data → fail
      END IF;
    END IF;
  END IF;
  
  -- Symmetric check: userB no-pets vs userA
  IF (v_b_prefs->>'M8_Q14') IS NOT NULL THEN
    v_b_pet_pref := normalize_bipolar_value(v_b_prefs->'M8_Q14');
    IF v_b_pet_pref < 0.3 THEN
      v_a_has_pets := COALESCE((v_a_prefs->>'M8_Q15')::boolean, false) OR
                     COALESCE((v_a_prefs->>'M8_Q16')::boolean, false) OR
                     COALESCE((v_a_prefs->>'M8_Q17')::boolean, false);
      IF v_a_has_pets THEN
        RETURN false;
      END IF;
      -- Strict rule + unknown
      IF (v_a_prefs->>'M8_Q14') IS NULL AND 
         (v_a_prefs->>'M8_Q15') IS NULL AND
         (v_a_prefs->>'M8_Q16') IS NULL AND
         (v_a_prefs->>'M8_Q17') IS NULL THEN
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  -- 3. Budget overlap
  -- Check max_rent_monthly from user_housing_preferences table
  SELECT max_rent_monthly INTO v_a_budget 
  FROM user_housing_preferences 
  WHERE user_id = user_a_id;
  
  SELECT max_rent_monthly INTO v_b_budget 
  FROM user_housing_preferences 
  WHERE user_id = user_b_id;
  
  -- If both have budgets, check compatibility
  -- Budget mismatch too large (>50% difference) → fail
  IF v_a_budget IS NOT NULL AND v_b_budget IS NOT NULL THEN
    IF v_a_budget < v_b_budget * 0.5 OR v_b_budget < v_a_budget * 0.5 THEN
      RETURN false; -- Budget mismatch too large
    END IF;
  END IF;
  
  -- Strict rule + unknown: if one has strict budget and other is NULL → fail
  -- Consider budgets >= 1000 as "strict" (significant commitment)
  IF v_a_budget IS NOT NULL AND v_a_budget >= 1000 AND v_b_budget IS NULL THEN
    RETURN false; -- Strict budget + unknown → fail
  END IF;
  
  IF v_b_budget IS NOT NULL AND v_b_budget >= 1000 AND v_a_budget IS NULL THEN
    RETURN false; -- Strict budget + unknown → fail
  END IF;
  
  -- 4. Lease length compatibility
  -- Check min_stay_months and max_stay_months from user_housing_preferences
  SELECT min_stay_months, max_stay_months 
  INTO v_a_min_stay, v_a_max_stay
  FROM user_housing_preferences 
  WHERE user_id = user_a_id;
  
  SELECT min_stay_months, max_stay_months 
  INTO v_b_min_stay, v_b_max_stay
  FROM user_housing_preferences 
  WHERE user_id = user_b_id;
  
  -- Check if stay periods overlap
  -- If userA wants min 12 months and userB max is 6 months → fail
  IF v_a_min_stay IS NOT NULL AND v_b_max_stay IS NOT NULL THEN
    IF v_a_min_stay > v_b_max_stay THEN
      RETURN false; -- No overlap: userA needs longer than userB can commit
    END IF;
  END IF;
  
  -- Symmetric check
  IF v_b_min_stay IS NOT NULL AND v_a_max_stay IS NOT NULL THEN
    IF v_b_min_stay > v_a_max_stay THEN
      RETURN false; -- No overlap: userB needs longer than userA can commit
    END IF;
  END IF;
  
  -- Strict rule + unknown: if one has strict long-term commitment (>=6 months) and other has no preference → fail
  IF v_a_min_stay IS NOT NULL AND v_a_min_stay >= 6 AND 
     (v_b_min_stay IS NULL AND v_b_max_stay IS NULL) THEN
    RETURN false; -- Strict long-term commitment vs unknown
  END IF;
  
  IF v_b_min_stay IS NOT NULL AND v_b_min_stay >= 6 AND 
     (v_a_min_stay IS NULL AND v_a_max_stay IS NULL) THEN
    RETURN false; -- Strict long-term commitment vs unknown
  END IF;
  
  -- 5. Gender preference (only if explicit and legal)
  -- NOTE: Gender constraints are DISABLED because the profiles table does not have a 'gender' column
  -- The user_housing_preferences table has gender_preference ('same', 'opposite', 'any'),
  -- but without actual gender data, we cannot enforce "same" or "opposite" preferences.
  -- If gender data is added to profiles in the future, uncomment and fix the logic below.
  --
  -- Gender constraints are opt-in only, never inferred
  -- Only enforce when both users have explicit preferences and genders are known
  -- Get gender preferences from user_housing_preferences
  -- SELECT gender_preference INTO v_a_gender_pref 
  -- FROM user_housing_preferences 
  -- WHERE user_id = user_a_id;
  -- 
  -- SELECT gender_preference INTO v_b_gender_pref 
  -- FROM user_housing_preferences 
  -- WHERE user_id = user_b_id;
  -- 
  -- Get actual genders from profiles (if available)
  -- SELECT gender INTO v_a_gender FROM profiles WHERE user_id = user_a_id;
  -- SELECT gender INTO v_b_gender FROM profiles WHERE user_id = user_b_id;
  -- 
  -- Only check if both users have gender preferences set (not NULL, not 'any')
  -- AND both genders are known
  -- IF v_a_gender_pref IS NOT NULL AND v_a_gender_pref != 'any' AND 
  --    v_b_gender IS NOT NULL AND v_a_gender IS NOT NULL THEN
  --   -- UserA wants same gender
  --   IF v_a_gender_pref = 'same' AND v_a_gender != v_b_gender THEN
  --     RETURN false; -- UserA wants same gender but genders differ
  --   END IF;
  --   -- UserA wants opposite gender  
  --   IF v_a_gender_pref = 'opposite' AND v_a_gender = v_b_gender THEN
  --     RETURN false; -- UserA wants opposite gender but genders are same
  --   END IF;
  -- END IF;
  -- 
  -- Symmetric check for userB
  -- IF v_b_gender_pref IS NOT NULL AND v_b_gender_pref != 'any' AND 
  --    v_b_gender IS NOT NULL AND v_a_gender IS NOT NULL THEN
  --   IF v_b_gender_pref = 'same' AND v_b_gender != v_a_gender THEN
  --     RETURN false; -- UserB wants same gender but genders differ
  --   END IF;
  --   IF v_b_gender_pref = 'opposite' AND v_b_gender = v_a_gender THEN
  --     RETURN false; -- UserB wants opposite gender but genders are same
  --   END IF;
  -- END IF;
  
  -- All constraints passed
  RETURN true;
END;
$$;

-- ============================================
-- Phase 3: Harmony Score Implementation
-- ============================================

-- Calculate similarity between two normalized dimension values
-- Handles asymmetric dimensions (NOISE, GUESTS, SUBSTANCES, SLEEP)
CREATE OR REPLACE FUNCTION calculate_dimension_similarity(
  p_dimension_name TEXT,
  p_value_a NUMERIC,
  p_value_b NUMERIC
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_similarity NUMERIC;
BEGIN
  -- Standard similarity: 1 - abs(a - b)
  v_similarity := 1.0 - ABS(p_value_a - p_value_b);
  
  -- Apply asymmetric penalty for certain dimensions (Phase 0.4)
  -- If one user has high sensitivity (low value) and other has high activity (high value)
  IF p_dimension_name IN ('noise', 'guests', 'substances', 'sleep') THEN
    -- High sensitivity (a < 0.3) AND high activity (b > 0.7) → cap at 0.1
    IF (p_value_a < 0.3 AND p_value_b > 0.7) OR (p_value_b < 0.3 AND p_value_a > 0.7) THEN
      v_similarity := LEAST(v_similarity, 0.1);
    END IF;
  END IF;
  
  RETURN GREATEST(0.0, LEAST(1.0, v_similarity));
END;
$$;

-- Calculate harmony score from 8 dimension similarities
-- Uses weighted average (0.7) + worst-case penalty (0.3)
CREATE OR REPLACE FUNCTION calculate_harmony_score(
  p_cleanliness NUMERIC,
  p_noise NUMERIC,
  p_guests NUMERIC,
  p_sleep NUMERIC,
  p_shared_spaces NUMERIC,
  p_substances NUMERIC,
  p_study_social NUMERIC,
  p_home_vibe NUMERIC
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  -- Dimension weights (HARD REQUIREMENT from plan)
  w_cleanliness NUMERIC := 0.18;
  w_noise NUMERIC := 0.14;
  w_guests NUMERIC := 0.14;
  w_sleep NUMERIC := 0.12;
  w_shared_spaces NUMERIC := 0.10;
  w_substances NUMERIC := 0.12;
  w_study_social NUMERIC := 0.10;
  w_home_vibe NUMERIC := 0.10;
  
  v_weighted_avg NUMERIC;
  v_worst NUMERIC;
  v_second_worst NUMERIC;
  v_similarities NUMERIC[8];
BEGIN
  -- Store similarities in array for sorting
  v_similarities[1] := COALESCE(p_cleanliness, 0.5);
  v_similarities[2] := COALESCE(p_noise, 0.5);
  v_similarities[3] := COALESCE(p_guests, 0.5);
  v_similarities[4] := COALESCE(p_sleep, 0.5);
  v_similarities[5] := COALESCE(p_shared_spaces, 0.5);
  v_similarities[6] := COALESCE(p_substances, 0.5);
  v_similarities[7] := COALESCE(p_study_social, 0.5);
  v_similarities[8] := COALESCE(p_home_vibe, 0.5);
  
  -- Calculate weighted average
  v_weighted_avg := 
    w_cleanliness * v_similarities[1] +
    w_noise * v_similarities[2] +
    w_guests * v_similarities[3] +
    w_sleep * v_similarities[4] +
    w_shared_spaces * v_similarities[5] +
    w_substances * v_similarities[6] +
    w_study_social * v_similarities[7] +
    w_home_vibe * v_similarities[8];
  
  -- Find worst and second_worst
  -- Sort similarities to find worst two
  -- Worst is the minimum
  v_worst := LEAST(v_similarities[1], v_similarities[2], v_similarities[3], v_similarities[4],
                   v_similarities[5], v_similarities[6], v_similarities[7], v_similarities[8]);
  
  -- Second worst: find minimum of remaining values (excluding worst)
  -- We'll use a simple approach: find the second smallest by comparing all pairs
  -- More efficient: use array operations
  v_second_worst := v_worst; -- Initialize
  -- Find second smallest by checking each value
  IF v_similarities[1] > v_worst THEN
    v_second_worst := v_similarities[1];
  END IF;
  IF v_similarities[2] > v_worst AND (v_second_worst = v_worst OR v_similarities[2] < v_second_worst) THEN
    v_second_worst := v_similarities[2];
  END IF;
  IF v_similarities[3] > v_worst AND (v_second_worst = v_worst OR v_similarities[3] < v_second_worst) THEN
    v_second_worst := v_similarities[3];
  END IF;
  IF v_similarities[4] > v_worst AND (v_second_worst = v_worst OR v_similarities[4] < v_second_worst) THEN
    v_second_worst := v_similarities[4];
  END IF;
  IF v_similarities[5] > v_worst AND (v_second_worst = v_worst OR v_similarities[5] < v_second_worst) THEN
    v_second_worst := v_similarities[5];
  END IF;
  IF v_similarities[6] > v_worst AND (v_second_worst = v_worst OR v_similarities[6] < v_second_worst) THEN
    v_second_worst := v_similarities[6];
  END IF;
  IF v_similarities[7] > v_worst AND (v_second_worst = v_worst OR v_similarities[7] < v_second_worst) THEN
    v_second_worst := v_similarities[7];
  END IF;
  IF v_similarities[8] > v_worst AND (v_second_worst = v_worst OR v_similarities[8] < v_second_worst) THEN
    v_second_worst := v_similarities[8];
  END IF;
  
  -- If all values are the same, second_worst = worst
  IF v_second_worst = v_worst THEN
    v_second_worst := v_worst;
  END IF;
  
  -- Final harmony: 0.7 * weighted_avg + 0.3 * ((worst + second_worst) / 2)
  RETURN 0.7 * v_weighted_avg + 0.3 * ((v_worst + v_second_worst) / 2.0);
END;
$$;

-- ============================================
-- Phase 4: Context Score Implementation
-- ============================================

-- Calculate context score (academic + lifestyle context)
-- p_undecided_a / p_undecided_b: true when user has no programme selected (undecided_program = true or program_id IS NULL) → programme component is neutral (0.5)
CREATE OR REPLACE FUNCTION calculate_context_score(
  p_university_a UUID,
  p_university_b UUID,
  p_program_a UUID,
  p_program_b UUID,
  p_faculty_a TEXT,
  p_faculty_b TEXT,
  p_study_year_a INTEGER,
  p_study_year_b INTEGER,
  p_undecided_a BOOLEAN DEFAULT false,
  p_undecided_b BOOLEAN DEFAULT false
) RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  -- Context component weights
  c_uni NUMERIC := 0.40;
  c_program NUMERIC := 0.35;
  c_year NUMERIC := 0.25;
  
  v_uni_score NUMERIC := 0.0;
  v_program_score NUMERIC := 0.0;
  v_year_score NUMERIC := 0.5; -- Default neutral if NULL
  v_year_diff INTEGER;
BEGIN
  -- University match (c_uni = 0.40)
  IF p_university_a IS NOT NULL AND p_university_b IS NOT NULL THEN
    IF p_university_a = p_university_b THEN
      v_uni_score := 1.0;
    END IF;
  END IF;
  
  -- Programme/Faculty (c_program = 0.35): neutral (0.5) if either user has no programme selected
  IF p_undecided_a OR p_undecided_b THEN
    v_program_score := 0.5;
  ELSIF p_program_a IS NOT NULL AND p_program_b IS NOT NULL THEN
    IF p_program_a = p_program_b THEN
      v_program_score := 1.0;
    ELSIF p_faculty_a IS NOT NULL AND p_faculty_b IS NOT NULL AND p_faculty_a = p_faculty_b THEN
      v_program_score := 0.6; -- Same faculty, different program
    END IF;
  END IF;
  
  -- Study Year (c_year = 0.25)
  IF p_study_year_a IS NOT NULL AND p_study_year_b IS NOT NULL THEN
    v_year_diff := ABS(p_study_year_a - p_study_year_b);
    IF v_year_diff <= 2 THEN
      v_year_score := 1.0;
    ELSIF v_year_diff >= 6 THEN
      v_year_score := 0.0;
    ELSE
      -- Linear interpolation: d=3 -> 0.75, d=4 -> 0.5, d=5 -> 0.25
      v_year_score := 1.0 - (v_year_diff - 2) / 4.0;
    END IF;
  END IF;
  
  -- Final context score
  RETURN c_uni * v_uni_score + c_program * v_program_score + c_year * v_year_score;
END;
$$;

-- ============================================
-- Phase 0.8: Explanation Templates
-- ============================================

-- Generate watch_out messages from dimension scores
CREATE OR REPLACE FUNCTION generate_watch_out_messages(
  p_dimension_scores JSONB
) RETURNS TEXT[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_messages TEXT[] := ARRAY[]::TEXT[];
  v_worst_dimensions TEXT[];
  v_worst_score NUMERIC := 1.0;
  v_dimension TEXT;
  v_score NUMERIC;
BEGIN
  -- Find worst 2-3 dimensions (lowest similarities)
  -- Template messages for each dimension
  IF (p_dimension_scores->>'cleanliness')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different expectations about cleanliness and tidiness.');
  END IF;
  
  IF (p_dimension_scores->>'guests')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different expectations about how often friends or partners stay over.');
  END IF;
  
  IF (p_dimension_scores->>'noise')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different comfort levels around noise, parties, or music volume.');
  END IF;
  
  IF (p_dimension_scores->>'sleep')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different sleep schedules (early bird vs night owl), which may cause friction.');
  END IF;
  
  IF (p_dimension_scores->>'shared_spaces')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different preferences for using common areas vs private spaces.');
  END IF;
  
  IF (p_dimension_scores->>'substances')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different comfort levels around alcohol or other substances at home.');
  END IF;
  
  IF (p_dimension_scores->>'study_social')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different balance between study time and social activities.');
  END IF;
  
  IF (p_dimension_scores->>'home_vibe')::numeric < 0.4 THEN
    v_messages := array_append(v_messages, 'Different preferences for home atmosphere (quiet retreat vs social hub).');
  END IF;
  
  -- Limit to 2-3 worst messages
  IF array_length(v_messages, 1) > 3 THEN
    v_messages := v_messages[1:3];
  END IF;
  
  RETURN COALESCE(v_messages, ARRAY['No major concerns']::TEXT[]);
END;
$$;

-- Generate top_alignment message
CREATE OR REPLACE FUNCTION generate_top_alignment(
  p_harmony_score NUMERIC,
  p_context_score NUMERIC,
  p_dimension_scores JSONB
) RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- High harmony + high context
  IF p_harmony_score >= 0.8 AND p_context_score >= 0.8 THEN
    RETURN 'You share similar lifestyle preferences and academic context.';
  END IF;
  
  -- High cleanliness + noise + guests
  IF (p_dimension_scores->>'cleanliness')::numeric >= 0.7 AND
     (p_dimension_scores->>'noise')::numeric >= 0.7 AND
     (p_dimension_scores->>'guests')::numeric >= 0.7 THEN
    RETURN 'You''re closely aligned on house rules and quiet vs social balance.';
  END IF;
  
  -- High sleep + study + home vibe
  IF (p_dimension_scores->>'sleep')::numeric >= 0.7 AND
     (p_dimension_scores->>'study_social')::numeric >= 0.7 AND
     (p_dimension_scores->>'home_vibe')::numeric >= 0.7 THEN
    RETURN 'You share a similar daily rhythm and home vibe.';
  END IF;
  
  -- High context only
  IF p_context_score >= 0.8 AND p_harmony_score < 0.8 THEN
    RETURN 'You share academic context (same university/programme).';
  END IF;
  
  -- Default
  RETURN 'General compatibility based on shared preferences.';
END;
$$;

-- ============================================
-- Phase 5: Main Compatibility Score Function
-- ============================================

-- Main function: Compute compatibility score (v1.0)
-- This function implements the 4-layer compatibility engine:
-- 1. Dealbreaker Filter (hard constraints)
-- 2. Harmony Score (core living compatibility, 8 dimensions)
-- 3. Context Score (academic + lifestyle context)
-- 4. Global Score (final compatibility)
--
-- Algorithm Version: v1.0
-- This algorithm is designed to be fair and non-discriminatory.

-- Drop existing function first to allow return type change
DROP FUNCTION IF EXISTS compute_compatibility_score(UUID, UUID);

CREATE OR REPLACE FUNCTION compute_compatibility_score(
  user_a_id UUID,
  user_b_id UUID
) RETURNS TABLE (
  compatibility_score NUMERIC,
  personality_score NUMERIC,
  schedule_score NUMERIC,
  lifestyle_score NUMERIC,
  social_score NUMERIC,
  academic_bonus NUMERIC,
  penalty NUMERIC,
  top_alignment TEXT,
  watch_out TEXT,
  house_rules_suggestion TEXT,
  academic_details JSONB,
  -- New fields (backward compatible)
  harmony_score NUMERIC,
  context_score NUMERIC,
  dimension_scores_json JSONB,
  is_valid_match BOOLEAN,
  algorithm_version TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  -- Algorithm version
  COMPATIBILITY_ALGORITHM_VERSION CONSTANT TEXT := 'v1.0';
  
  -- User profiles
  user_a_profile RECORD;
  user_b_profile RECORD;
  
  -- Harmony dimensions (8 dimensions)
  v_cleanliness_a NUMERIC;
  v_cleanliness_b NUMERIC;
  v_noise_a NUMERIC;
  v_noise_b NUMERIC;
  v_guests_a NUMERIC;
  v_guests_b NUMERIC;
  v_sleep_a NUMERIC;
  v_sleep_b NUMERIC;
  v_shared_spaces_a NUMERIC;
  v_shared_spaces_b NUMERIC;
  v_substances_a NUMERIC;
  v_substances_b NUMERIC;
  v_study_social_a NUMERIC;
  v_study_social_b NUMERIC;
  v_home_vibe_a NUMERIC;
  v_home_vibe_b NUMERIC;
  
  -- Dimension similarities
  v_cleanliness_sim NUMERIC;
  v_noise_sim NUMERIC;
  v_guests_sim NUMERIC;
  v_sleep_sim NUMERIC;
  v_shared_spaces_sim NUMERIC;
  v_substances_sim NUMERIC;
  v_study_social_sim NUMERIC;
  v_home_vibe_sim NUMERIC;
  
  -- Scores
  v_harmony_score NUMERIC;
  v_context_score NUMERIC;
  v_raw_global_score NUMERIC;
  
  -- Dealbreaker check
  v_is_valid BOOLEAN;
  
  -- Study year calculation
  v_study_year_a INTEGER;
  v_study_year_b INTEGER;
  
  -- Dimension scores JSON
  v_dimension_scores JSONB;
  
  -- Explanations
  v_watch_out_messages TEXT[];
  v_top_alignment_msg TEXT;
BEGIN
  -- Phase 2: Check hard constraints first
  v_is_valid := check_hard_constraints(user_a_id, user_b_id);
  
  IF NOT v_is_valid THEN
    -- Dealbreaker violation: return zero scores
    RETURN QUERY SELECT
      0.0::NUMERIC, -- compatibility_score
      0.0::NUMERIC, -- personality_score
      0.0::NUMERIC, -- schedule_score
      0.0::NUMERIC, -- lifestyle_score
      0.0::NUMERIC, -- social_score
      0.0::NUMERIC, -- academic_bonus
      0.0::NUMERIC, -- penalty
      'Dealbreaker conflict'::TEXT, -- top_alignment
      'Hard constraints not met'::TEXT, -- watch_out
      ''::TEXT, -- house_rules_suggestion
      '{}'::JSONB, -- academic_details
      0.0::NUMERIC, -- harmony_score
      0.0::NUMERIC, -- context_score
      '{}'::JSONB, -- dimension_scores_json
      false::BOOLEAN, -- is_valid_match
      COMPATIBILITY_ALGORITHM_VERSION::TEXT; -- algorithm_version
    RETURN;
  END IF;
  
  -- Get user academic profiles (include undecided_program for context score)
  SELECT 
    ua.university_id,
    ua.program_id,
    p.faculty,
    usy.study_year,
    (COALESCE(ua.undecided_program, false) OR ua.program_id IS NULL) AS undecided_program
  INTO user_a_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  LEFT JOIN user_study_year_v usy ON ua.user_id = usy.user_id
  WHERE ua.user_id = user_a_id;
  
  SELECT 
    ua.university_id,
    ua.program_id,
    p.faculty,
    usy.study_year,
    (COALESCE(ua.undecided_program, false) OR ua.program_id IS NULL) AS undecided_program
  INTO user_b_profile
  FROM user_academic ua
  LEFT JOIN programs p ON ua.program_id = p.id
  LEFT JOIN user_study_year_v usy ON ua.user_id = usy.user_id
  WHERE ua.user_id = user_b_id;
  
  -- Extract harmony dimensions for both users
  -- IMPORTANT: All lookups use get_dimension_value() which goes through resolve_user_preferences()
  v_cleanliness_a := get_cleanliness_dimension(user_a_id);
  v_cleanliness_b := get_cleanliness_dimension(user_b_id);
  
  v_noise_a := get_noise_dimension(user_a_id);
  v_noise_b := get_noise_dimension(user_b_id);
  
  v_guests_a := get_guests_dimension(user_a_id);
  v_guests_b := get_guests_dimension(user_b_id);
  
  v_sleep_a := get_sleep_dimension(user_a_id);
  v_sleep_b := get_sleep_dimension(user_b_id);
  
  v_shared_spaces_a := get_shared_spaces_dimension(user_a_id);
  v_shared_spaces_b := get_shared_spaces_dimension(user_b_id);
  
  v_substances_a := get_substances_dimension(user_a_id);
  v_substances_b := get_substances_dimension(user_b_id);
  
  v_study_social_a := get_study_social_dimension(user_a_id);
  v_study_social_b := get_study_social_dimension(user_b_id);
  
  v_home_vibe_a := get_home_vibe_dimension(user_a_id);
  v_home_vibe_b := get_home_vibe_dimension(user_b_id);
  
  -- Calculate dimension similarities
  v_cleanliness_sim := calculate_dimension_similarity('cleanliness', v_cleanliness_a, v_cleanliness_b);
  v_noise_sim := calculate_dimension_similarity('noise', v_noise_a, v_noise_b);
  v_guests_sim := calculate_dimension_similarity('guests', v_guests_a, v_guests_b);
  v_sleep_sim := calculate_dimension_similarity('sleep', v_sleep_a, v_sleep_b);
  v_shared_spaces_sim := calculate_dimension_similarity('shared_spaces', v_shared_spaces_a, v_shared_spaces_b);
  v_substances_sim := calculate_dimension_similarity('substances', v_substances_a, v_substances_b);
  v_study_social_sim := calculate_dimension_similarity('study_social', v_study_social_a, v_study_social_b);
  v_home_vibe_sim := calculate_dimension_similarity('home_vibe', v_home_vibe_a, v_home_vibe_b);
  
  -- Build dimension scores JSON
  v_dimension_scores := jsonb_build_object(
    'cleanliness', v_cleanliness_sim,
    'noise', v_noise_sim,
    'guests', v_guests_sim,
    'sleep', v_sleep_sim,
    'shared_spaces', v_shared_spaces_sim,
    'substances', v_substances_sim,
    'study_social', v_study_social_sim,
    'home_vibe', v_home_vibe_sim
  );
  
  -- Calculate harmony score
  v_harmony_score := calculate_harmony_score(
    v_cleanliness_sim,
    v_noise_sim,
    v_guests_sim,
    v_sleep_sim,
    v_shared_spaces_sim,
    v_substances_sim,
    v_study_social_sim,
    v_home_vibe_sim
  );
  
  -- Calculate context score
  v_study_year_a := COALESCE(user_a_profile.study_year, 1);
  v_study_year_b := COALESCE(user_b_profile.study_year, 1);
  
  v_context_score := calculate_context_score(
    user_a_profile.university_id,
    user_b_profile.university_id,
    user_a_profile.program_id,
    user_b_profile.program_id,
    user_a_profile.faculty,
    user_b_profile.faculty,
    v_study_year_a,
    v_study_year_b,
    user_a_profile.undecided_program,
    user_b_profile.undecided_program
  );
  
  -- Calculate global score: 0.75 * harmony + 0.25 * context
  v_raw_global_score := 0.75 * v_harmony_score + 0.25 * v_context_score;
  
  -- Ensure score is in [0,1]
  v_raw_global_score := GREATEST(0.0, LEAST(1.0, v_raw_global_score));
  
  -- Generate explanations
  v_watch_out_messages := generate_watch_out_messages(v_dimension_scores);
  v_top_alignment_msg := generate_top_alignment(v_harmony_score, v_context_score, v_dimension_scores);
  
  -- Build academic details JSONB (backward compatible)
  -- Map context_score components to academic_bonus format
  -- academic_bonus is legacy field, map from context_score
  -- For backward compatibility, calculate academic_bonus from context components
  -- Same university bonus (8%), same programme (12%), same faculty (5%)
  
  -- Return results
  RETURN QUERY SELECT
    v_raw_global_score, -- compatibility_score
    v_harmony_score, -- personality_score (map from harmony)
    v_sleep_sim, -- schedule_score (map from sleep dimension)
    (v_cleanliness_sim + v_shared_spaces_sim) / 2.0, -- lifestyle_score (cleanliness + shared spaces)
    (v_guests_sim + v_noise_sim) / 2.0, -- social_score (guests + noise)
    v_context_score, -- academic_bonus (map from context_score)
    0.0::NUMERIC, -- penalty (from dealbreakers if any, currently 0)
    v_top_alignment_msg, -- top_alignment
    array_to_string(v_watch_out_messages, ' '), -- watch_out (concatenated)
    'Discuss shared spaces, quiet hours, and guest policies'::TEXT, -- house_rules_suggestion
    jsonb_build_object( -- academic_details
      'university_affinity', user_a_profile.university_id = user_b_profile.university_id,
      'program_affinity', user_a_profile.program_id = user_b_profile.program_id AND user_a_profile.program_id IS NOT NULL,
      'faculty_affinity', user_a_profile.faculty = user_b_profile.faculty AND user_a_profile.faculty IS NOT NULL,
      'year_gap', ABS(v_study_year_a - v_study_year_b)
    ),
    v_harmony_score, -- harmony_score (NEW)
    v_context_score, -- context_score (NEW)
    v_dimension_scores, -- dimension_scores_json (NEW)
    true::BOOLEAN, -- is_valid_match (NEW)
    COMPATIBILITY_ALGORITHM_VERSION::TEXT; -- algorithm_version (NEW)
END;
$$;

-- ============================================
-- Phase 6: Update find_potential_matches
-- ============================================

-- Drop existing function first (in case signature changed)
DROP FUNCTION IF EXISTS find_potential_matches(UUID, INTEGER, NUMERIC);

-- Update find_potential_matches to filter by dealbreakers
CREATE OR REPLACE FUNCTION find_potential_matches(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_min_score NUMERIC DEFAULT 0.6
) RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  university_name TEXT,
  program_name TEXT,
  compatibility_score NUMERIC,
  academic_bonus NUMERIC,
  top_alignment TEXT,
  watch_out TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    p.first_name,
    univ.name AS university_name,
    prog.name AS program_name,
    cs.compatibility_score,
    cs.academic_bonus,
    cs.top_alignment,
    cs.watch_out
  FROM users u
  JOIN profiles p ON u.id = p.user_id
  JOIN user_academic ua ON u.id = ua.user_id
  JOIN universities univ ON ua.university_id = univ.id
  LEFT JOIN programs prog ON ua.program_id = prog.id
  CROSS JOIN LATERAL compute_compatibility_score(p_user_id, u.id) cs
  WHERE u.id != p_user_id
    AND u.is_active = true
    AND p.verification_status = 'verified'
    AND cs.is_valid_match = true -- Filter by dealbreaker check
    AND cs.compatibility_score >= p_min_score
  ORDER BY cs.compatibility_score DESC
  LIMIT p_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION compute_compatibility_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_potential_matches(UUID, INTEGER, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION check_hard_constraints(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dimension_value(UUID, TEXT) TO authenticated;

-- ============================================
-- End of Migration
-- ============================================

