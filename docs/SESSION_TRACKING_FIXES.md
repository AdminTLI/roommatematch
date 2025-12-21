# Session Tracking Fixes

## Issues Fixed

### 1. Multiple GoTrueClient Instances Warning ✅

**Problem**: The session tracker was creating a new Supabase client instance, causing multiple GoTrueClient instances in the same browser context.

**Solution**: 
- Changed `trackUserJourneyEvent` to use an API route (`/api/analytics/track-event`) instead of creating a Supabase client directly
- The API route uses the server-side Supabase client which properly handles authentication
- Updated `SessionTrackerProvider` to use a ref to maintain a single client instance

**Files Changed**:
- `lib/analytics/session-tracker.ts` - Now uses fetch API instead of creating Supabase client
- `components/analytics/session-tracker-provider.tsx` - Uses useRef to maintain single client instance
- `app/api/analytics/track-event/route.ts` - New API route for server-side event tracking

### 2. 500 Internal Server Error on Event Insert ✅

**Problem**: The `user_journey_events` table had RLS policies that only allowed admins to access it, preventing regular users from inserting their own events.

**Solution**:
- Created a new migration (`123_allow_user_journey_event_inserts.sql`) that adds a policy allowing users to insert their own events
- The policy allows:
  - Users to insert events where `user_id = auth.uid()` (their own events)
  - Anonymous users to insert events where `user_id IS NULL`

**Files Changed**:
- `db/migrations/123_allow_user_journey_event_inserts.sql` - New migration file

## How to Apply the Fixes

1. **Run the migration**:
   ```bash
   # Apply the new RLS policy
   psql -d your_database -f db/migrations/123_allow_user_journey_event_inserts.sql
   ```
   
   Or if using Supabase CLI:
   ```bash
   supabase db push
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Informational Warnings (Not Errors)

The following are informational messages and don't need to be fixed:

- **Sentry Client instrumentation disabled**: This is expected in development
- **Vercel Web Analytics Debug mode**: This is expected in development - no requests are sent
- **React DevTools suggestion**: Just a suggestion to install the browser extension
- **RealtimeInvalidation subscription status**: Informational logging about realtime subscriptions

These can be safely ignored or suppressed in production if desired.

## Testing

After applying the fixes, you should:

1. **Check browser console**: The "Multiple GoTrueClient instances" warning should be gone
2. **Check network tab**: POST requests to `/api/analytics/track-event` should return 200 OK
3. **Check database**: Events should be inserted into `user_journey_events` table
4. **Check admin dashboard**: Metrics should start populating after some usage

## Verification

To verify the fixes are working:

```sql
-- Check if events are being inserted
SELECT COUNT(*) FROM user_journey_events WHERE event_timestamp > NOW() - INTERVAL '1 hour';

-- Check recent events
SELECT session_id, event_name, event_category, event_timestamp 
FROM user_journey_events 
ORDER BY event_timestamp DESC 
LIMIT 10;
```

## Notes

- The API route approach is more secure as it uses server-side authentication
- RLS policies ensure users can only insert their own events
- Anonymous users can still be tracked (with `user_id = NULL`)
- All tracking respects user privacy and GDPR requirements

