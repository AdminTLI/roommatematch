# Session Tracking Implementation

## Overview

This document describes the implementation of session tracking and engagement metrics for the platform. The system now properly tracks user sessions, calculates session duration, and displays accurate engagement metrics in the admin dashboard.

## What Was Implemented

### 1. Session Tracking System (`lib/analytics/session-tracker.ts`)

- **Session ID Generation**: Creates unique session IDs stored in localStorage
- **Session Timeout**: Sessions expire after 30 minutes of inactivity
- **Event Tracking**: Tracks user journey events with session information including:
  - Page views
  - User actions
  - Device information (mobile/tablet/desktop)
  - Browser and operating system
  - Referrer URLs

### 2. Updated Metrics Calculation (`lib/analytics/crm-metrics.ts`)

The metrics calculation now:
- **Calculates session duration** from event timestamps (first to last event in a session)
- **Counts unique sessions per user** properly
- **Calculates average session duration** in minutes
- **Calculates average sessions per user** based on actual session data
- **Improves engagement score** by factoring in session activity and frequency

### 3. Client-Side Integration

- **SessionTrackerProvider** (`components/analytics/session-tracker-provider.tsx`): Automatically tracks page views and initializes session tracking
- **Integrated into Providers** (`app/providers.tsx`): Session tracking is now active across the entire application

## How It Works

1. **On Page Load**: 
   - A session ID is generated or retrieved from localStorage
   - Initial page view is tracked
   - Session start time is recorded

2. **During Session**:
   - Each page navigation is tracked as a page view event
   - User actions can be tracked using `trackUserAction()`
   - Session duration is calculated from the first to last event

3. **Session End**:
   - When user leaves the page (visibility change or beforeunload)
   - Session duration is calculated and stored
   - New session starts on next visit

4. **Metrics Calculation**:
   - Server-side calculation aggregates all session data
   - Calculates averages across all users
   - Updates engagement scores based on actual activity

## Metrics Displayed

The admin dashboard now shows:

1. **Engagement Score**: 
   - Based on active users percentage
   - Boosted by session frequency (users with more sessions score higher)
   - Range: 0-100

2. **Avg Session Duration**: 
   - Average time users spend per session
   - Calculated from first to last event in each session
   - Displayed in minutes

3. **Avg Sessions/User**: 
   - Average number of sessions per active user
   - Only counts users who have at least one session
   - Helps understand user engagement frequency

## Data Storage

All session data is stored in the `user_journey_events` table with:
- `session_id`: Unique identifier for each session
- `user_id`: User ID (null for anonymous users)
- `event_timestamp`: When the event occurred
- `session_duration_seconds`: Calculated duration (updated periodically)
- Device, browser, and OS information

## Privacy Considerations

- Session IDs are stored in localStorage (client-side only)
- Anonymous users can be tracked without authentication
- User IDs are only included for authenticated users
- All tracking respects user privacy settings

## Future Enhancements

Consider implementing:

1. **Third-Party Analytics Integration**:
   - Google Analytics 4
   - Plausible Analytics (privacy-focused)
   - PostHog (open-source)
   - Mixpanel

2. **Advanced Metrics**:
   - Bounce rate
   - Time on page
   - Conversion funnels
   - User flow analysis

3. **Real-Time Dashboard**:
   - Live user count
   - Active sessions
   - Real-time event stream

## Testing

To verify the implementation:

1. **Check Admin Dashboard**: 
   - Navigate to `/admin/metrics`
   - Verify that Engagement Score, Avg Session Duration, and Avg Sessions/User show non-zero values after some usage

2. **Check Database**:
   ```sql
   SELECT COUNT(*) FROM user_journey_events;
   SELECT session_id, COUNT(*) as events, 
          MIN(event_timestamp) as start, 
          MAX(event_timestamp) as end
   FROM user_journey_events
   GROUP BY session_id
   LIMIT 10;
   ```

3. **Check Browser Console**:
   - Open browser DevTools
   - Check localStorage for `domu_session_id` and `domu_session_start`
   - Verify session ID persists across page navigations

## Troubleshooting

### Metrics Show Zero

If metrics are still showing zero:

1. **Check if events are being tracked**:
   - Verify `user_journey_events` table has data
   - Check browser console for errors

2. **Check environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` must be set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set

3. **Check RLS policies**:
   - Ensure admin users can read `user_journey_events`
   - Verify service role key has access

### Sessions Not Persisting

- Check localStorage is enabled in browser
- Verify session timeout (30 minutes) hasn't expired
- Check for browser privacy settings blocking localStorage

## API Reference

### Functions

```typescript
// Track a page view
trackPageView(page: string, userId?: string, additionalProps?: Record<string, any>)

// Track a user action
trackUserAction(action: string, userId?: string, properties?: Record<string, any>)

// Get or create session ID
getOrCreateSessionId(): string

// Initialize session tracking
initializeSessionTracking(userId?: string): void
```

## Notes

- Session tracking works for both authenticated and anonymous users
- Session duration is calculated on-the-fly from event timestamps
- Metrics are calculated server-side for accuracy
- The system is designed to be privacy-friendly and GDPR-compliant





