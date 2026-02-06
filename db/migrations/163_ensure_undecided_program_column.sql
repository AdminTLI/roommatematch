-- Migration: Ensure user_academic.undecided_program exists
-- Date: 2026-02-06
-- Description: compute_compatibility_score (from 162) references ua.undecided_program.
--              If this column was missing, the function hit the EXCEPTION block and returned
--              all zeros (match/harmony/context/dimension scores 0%). This migration adds
--              the column if missing and backfills it so compatibility scores work again.

-- Add column if it doesn't exist (e.g. DB created before 003 or from a different schema path)
ALTER TABLE public.user_academic
  ADD COLUMN IF NOT EXISTS undecided_program boolean DEFAULT false;

-- Backfill: no programme selected => undecided_program = true
UPDATE public.user_academic
  SET undecided_program = (program_id IS NULL)
  WHERE undecided_program IS DISTINCT FROM (program_id IS NULL);
