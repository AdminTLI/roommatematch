# Notification System Fixes - Summary

## Issues Fixed

### 1. Duplicate Notifications
**Problem**: Notifications were being created every day for the same user pairs, even though they were already matched.

**Root Cause**: 
- The cron job (`app/api/cron/match/route.ts`) runs daily and creates notifications for match suggestions
- Each run creates new suggestions with new IDs, so the duplicate check based on `match_id` didn't work
- The trigger function wasn't checking for existing notifications by user pair

**Solution**:
- **Migration**: `20251120_fix_duplicate_notifications_v2.sql`
  - Updates existing notifications to include `other_user_id` in metadata (inferred from matches table)
  - Removes duplicate notifications based on user pair (not just match_id)
  - Creates unique index on `(user_id, type, other_user_id)` to prevent future duplicates
  - Updates trigger function to check for existing notifications by user pair

- **Code Fix**: `lib/notifications/create.ts`
  - `createMatchNotification` now checks for existing notifications by user pair
  - Always includes `other_user_id` in metadata for duplicate detection
  - Handles unique constraint violations gracefully

### 2. "Mark All as Read" Button Not Working
**Problem**: Clicking the button didn't mark notifications as read.

**Root Cause**: Event propagation issues with Tooltip component wrapping the button.

**Solution**:
- Added explicit `preventDefault()` and `stopPropagation()` in button onClick
- Added `type="button"` to prevent form submission
- Improved error handling and logging
- Added console logs for debugging

### 3. "View All Notifications" Button Not Working
**Problem**: Clicking the button didn't navigate to `/notifications`.

**Root Cause**: Portal rendering and event propagation issues.

**Solution**:
- Switched from `router.push()` to `window.location.href` for reliable navigation
- Added `setTimeout` to ensure dropdown closes before navigation
- Added explicit event prevention
- Added `type="button"` attribute

## Files Changed

1. `db/migrations/20251120_fix_duplicate_notifications_v2.sql` - New migration
2. `lib/notifications/create.ts` - Updated duplicate detection logic
3. `app/(components)/notifications/notification-dropdown.tsx` - Fixed button handlers
4. `app/(components)/notifications/notification-bell.tsx` - Improved error handling
5. `app/api/notifications/mark-all-read/route.ts` - Added logging

## How to Apply

1. **Run the new migration** (`20251120_fix_duplicate_notifications_v2.sql`) in Supabase SQL Editor
   - This will clean up existing duplicates
   - Add the unique constraint
   - Update the trigger function

2. **Restart your dev server** to pick up code changes

3. **Hard refresh your browser** (Cmd+Shift+R / Ctrl+Shift+R) to clear cached data

4. **Test**:
   - Check notification count - should be lower after migration
   - Click "Mark all as read" - should work and update badge
   - Click "View all notifications" - should navigate to `/notifications`
   - Wait for next cron run - should not create duplicates

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Duplicate notifications are removed
- [ ] "Mark all as read" button works
- [ ] "View all notifications" button works
- [ ] Badge count updates correctly
- [ ] No new duplicates created after cron runs

