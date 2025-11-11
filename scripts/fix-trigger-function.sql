-- Fix the update_updated_at_column function to use clock_timestamp() instead of NOW()
-- This fixes the "function public.now() does not exist" error
-- Run this in your Supabase SQL editor before running the city mapping script

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

