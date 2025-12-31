-- Allow users to insert their own user journey events
-- This enables session tracking for all users (including anonymous)

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Users can insert their own journey events" ON user_journey_events;

-- Allow users to insert their own events (user_id must match auth.uid() or be null for anonymous)
CREATE POLICY "Users can insert their own journey events" ON user_journey_events
    FOR INSERT WITH CHECK (
        user_id IS NULL OR user_id = auth.uid()
    );

-- Keep the admin policy for reading all events
-- (The existing "Admins can access user journey events" policy already handles SELECT)



