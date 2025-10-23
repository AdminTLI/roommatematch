-- Add saved searches table for housing alerts
-- This migration adds the saved_searches table for users to save their housing search criteria

CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filters_json JSONB NOT NULL,
  filters_hash VARCHAR(64) NOT NULL, -- for deduplication
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT false,
  frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, filters_hash)
);

-- Indexes for performance
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_hash ON saved_searches(filters_hash);
CREATE INDEX idx_saved_searches_frequency ON saved_searches(frequency);

-- Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON saved_searches TO authenticated;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
