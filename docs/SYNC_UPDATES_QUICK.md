# Quick Sync Updates - Browser Console Method

## Step 1: Verify You're an Admin

First, check if you're logged in as an admin. Run this in the browser console:

```javascript
// Check if you're an admin
const response = await fetch('/api/admin/dashboard-metrics');
const result = await response.json();
console.log('Admin check:', result.error ? 'NOT ADMIN' : 'ADMIN OK');
```

If you get an error, you're not an admin. You need to:
1. Log in as an admin user
2. Or have your user added to the `admins` table in the database

## Step 2: Sync Updates

Once you're confirmed as admin, run this script:

```javascript
// Sync updates for recent days
const recentDays = [
  { date: '2025-01-20', changes: ['Recent deployment fixes', 'Updated dashboard components'] },
  { date: '2025-01-19', changes: ['Deployment updates', 'Bug fixes'] },
  { date: '2025-01-18', changes: ['Performance improvements'] },
  // Add more days as needed - use format: 'YYYY-MM-DD'
];

console.log('Starting sync...');
for (const day of recentDays) {
  try {
    const response = await fetch('/api/admin/sync-updates', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies
      body: JSON.stringify({
        version: `V${day.date.replace(/-/g, '.')}`,
        release_date: day.date,
        change_type: 'patch',
        changes: day.changes
      })
    });
    
    const result = await response.json();
    if (result.error) {
      console.error(`❌ ${day.date}:`, result.error);
    } else {
      console.log(`✅ ${day.date}:`, result);
    }
  } catch (error) {
    console.error(`❌ ${day.date}:`, error);
  }
}
console.log('Sync complete!');
```

## Alternative: Use Today's Date Automatically

If you want to create updates for today and the last few days automatically:

```javascript
// Get today and last 7 days
const today = new Date();
const days = [];
for (let i = 0; i < 7; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  days.push({
    date: dateStr,
    changes: [`Deployment updates for ${dateStr}`]
  });
}

console.log('Syncing updates for:', days.map(d => d.date).join(', '));
for (const day of days) {
  try {
    const response = await fetch('/api/admin/sync-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        version: `V${day.date.replace(/-/g, '.')}`,
        release_date: day.date,
        change_type: 'patch',
        changes: day.changes
      })
    });
    const result = await response.json();
    console.log(`${result.error ? '❌' : '✅'} ${day.date}:`, result.error || 'OK');
  } catch (error) {
    console.error(`❌ ${day.date}:`, error);
  }
}
```

## Troubleshooting

### "Admin access required" or 403 error
- Make sure you're logged in as an admin user
- Check that your user exists in the `admins` table in Supabase
- Try refreshing the page and logging in again

### "Invalid CSRF token"
- Make sure you're on the same domain (localhost:3000)
- Try adding `credentials: 'include'` to the fetch options (already included above)
- Clear browser cookies and log in again

### Updates not appearing
- Check the browser console for errors
- Verify the API returned success: `{success: true, ...}`
- Hard refresh the dashboard page (Cmd+Shift+R or Ctrl+Shift+R)
- Check the database: `SELECT * FROM updates ORDER BY release_date DESC;`



