# Notification Fix - Step-by-Step Instructions

## Issue: Buttons not working and duplicate notifications

### Step 1: Verify Migration Status

Run this SQL in Supabase SQL Editor to check if the migration was applied:

```sql
-- Check if unique index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'notifications' 
AND indexname = 'idx_notifications_unique_user_pair';

-- If this returns 0 rows, the migration hasn't been run yet
```

### Step 2: Run the Migration

**IMPORTANT**: Run this migration in Supabase SQL Editor:
- File: `db/migrations/20251120_fix_duplicate_notifications_v2.sql`
- Copy the entire contents
- Paste into Supabase SQL Editor
- Click "Run"

This migration will:
1. Add `other_user_id` to existing notifications
2. Remove duplicate notifications
3. Create unique constraint to prevent future duplicates
4. Update the trigger function

### Step 3: Restart Dev Server

After running the migration:
1. Stop your dev server (Ctrl+C)
2. Clear Next.js cache: `rm -rf .next` (already done)
3. Restart: `npm run dev`

### Step 4: Hard Refresh Browser

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
   - OR use Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

### Step 5: Test the Buttons

1. Open the notification dropdown
2. Open browser console (F12 → Console tab)
3. Click "Mark all as read" button
   - You should see: `[NotificationDropdown] Marking all as read...`
   - Then: `[NotificationBell] Marking all notifications as read...`
   - Then: `[mark-all-read] Successfully marked X notifications as read`
4. Click "View all notifications" button
   - You should see: `[NotificationDropdown] Navigating to /notifications`
   - Page should navigate to `/notifications`

### Step 6: Verify Duplicates Are Removed

Run this SQL to check:

```sql
-- Should return 0 rows if duplicates are removed
SELECT 
  user_id, 
  metadata->>'other_user_id' as other_user_id,
  COUNT(*) as count
FROM notifications
WHERE type = 'match_created'
  AND metadata->>'other_user_id' IS NOT NULL
GROUP BY user_id, metadata->>'other_user_id'
HAVING COUNT(*) > 1;
```

## Troubleshooting

### If buttons still don't work:

1. **Check browser console for errors**
   - Open DevTools → Console
   - Look for red error messages
   - Share any errors you see

2. **Verify the code is loaded**
   - In browser console, type: `document.querySelector('[title="Mark all as read"]')`
   - Should return the button element
   - If null, the component isn't rendering

3. **Check network requests**
   - Open DevTools → Network tab
   - Click "Mark all as read"
   - Look for a POST request to `/api/notifications/mark-all-read`
   - Check the response status (should be 200)

### If duplicates still appear:

1. **Verify migration ran successfully**
   - Check Supabase migration history
   - Re-run the migration if needed

2. **Check if cron job is still creating duplicates**
   - The unique constraint should prevent this
   - But check console logs for: `[createMatchNotification] Notifications already exist`

## Quick Test Commands

Run these in browser console to test:

```javascript
// Test mark all as read
fetch('/api/notifications/mark-all-read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json()).then(console.log)

// Check notification count
fetch('/api/notifications/count')
  .then(r => r.json())
  .then(console.log)
```


