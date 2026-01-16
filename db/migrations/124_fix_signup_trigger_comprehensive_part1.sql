-- Part 1: Create public.now() function
-- Run this first in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.now()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE sql
STABLE
AS $$
  SELECT NOW();
$$;





