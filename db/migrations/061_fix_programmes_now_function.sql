-- Fix programmes updated_at trigger to use correct now() function
-- The trigger was calling public.now() which doesn't exist - should use NOW() from pg_catalog

CREATE OR REPLACE FUNCTION public.update_programmes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();  -- Use NOW() from pg_catalog, not public.now()
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also ensure skdb_updated_at and enriched_at can be set via triggers if needed
-- For now, we'll let the application set these explicitly with ISO timestamps

