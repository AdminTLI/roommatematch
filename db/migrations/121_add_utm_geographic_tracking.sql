-- Add UTM and Geographic Tracking to user_journey_events
-- This migration adds columns for traffic source attribution and geographic data

-- Add UTM parameter columns
ALTER TABLE user_journey_events 
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255),
ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255);

-- Add traffic source classification
ALTER TABLE user_journey_events
ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(100) CHECK (traffic_source IS NULL OR traffic_source IN ('organic', 'direct', 'referral', 'social', 'email', 'paid'));

-- Add geographic columns
ALTER TABLE user_journey_events
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2),
ADD COLUMN IF NOT EXISTS country_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_journey_events_utm_source ON user_journey_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_utm_campaign ON user_journey_events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_traffic_source ON user_journey_events(traffic_source);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_country_code ON user_journey_events(country_code);
CREATE INDEX IF NOT EXISTS idx_user_journey_events_city ON user_journey_events(city);

-- Add comment for documentation
COMMENT ON COLUMN user_journey_events.utm_source IS 'UTM source parameter from URL (e.g., google, facebook)';
COMMENT ON COLUMN user_journey_events.utm_medium IS 'UTM medium parameter (e.g., cpc, email, social)';
COMMENT ON COLUMN user_journey_events.utm_campaign IS 'UTM campaign parameter (e.g., spring_sale, newsletter)';
COMMENT ON COLUMN user_journey_events.utm_term IS 'UTM term parameter (keywords for paid search)';
COMMENT ON COLUMN user_journey_events.utm_content IS 'UTM content parameter (A/B test variant, ad creative)';
COMMENT ON COLUMN user_journey_events.traffic_source IS 'Classified traffic source: organic, direct, referral, social, email, paid';
COMMENT ON COLUMN user_journey_events.ip_address IS 'User IP address (stored as INET type, can be hashed for privacy)';
COMMENT ON COLUMN user_journey_events.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., NL, US)';
COMMENT ON COLUMN user_journey_events.country_name IS 'Full country name';
COMMENT ON COLUMN user_journey_events.city IS 'City name';
COMMENT ON COLUMN user_journey_events.region IS 'Region/state/province name';

