-- Enable Supabase Realtime for match_suggestions table (idempotent)
-- This allows real-time subscriptions to work properly

DO $$
BEGIN
  -- Check if table is already in publication before adding
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'match_suggestions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE match_suggestions;
  END IF;
  
  -- Ensure REPLICA IDENTITY is set (idempotent - no error if already set)
  BEGIN
    ALTER TABLE match_suggestions REPLICA IDENTITY FULL;
  EXCEPTION WHEN OTHERS THEN
    -- REPLICA IDENTITY might already be set, ignore error
    NULL;
  END;
END $$;
