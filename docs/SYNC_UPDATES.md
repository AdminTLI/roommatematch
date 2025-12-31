# Sync Updates - Manual Deployment Sync Guide

This guide explains how to manually sync recent deployments and create update entries in the dashboard when the webhook hasn't been triggered.

## Problem

If deployments have happened but updates aren't showing in the dashboard, it's likely because:
1. The Vercel webhook isn't configured
2. The webhook isn't being triggered
3. The webhook failed silently

## Solution: Manual Sync

We've created an admin endpoint to manually sync recent deployments.

### Option 1: Fetch from Vercel API (Recommended)

If you have a Vercel API token, you can automatically fetch recent deployments:

**Prerequisites:**
1. Get your Vercel API token from: https://vercel.com/account/tokens
2. Get your Vercel Project ID from your project settings
3. (Optional) Get your Team ID if you're part of a team

**Set Environment Variables:**
```bash
VERCEL_TOKEN=your_vercel_api_token_here
VERCEL_PROJECT_ID=your_project_id_here
VERCEL_TEAM_ID=your_team_id_here  # Optional
```

**Call the API:**
```bash
curl -X POST https://your-domain.vercel.app/api/admin/sync-updates \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"fetchFromVercel": true}'
```

Or from the browser console (while logged in as admin):
```javascript
fetch('/api/admin/sync-updates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fetchFromVercel: true })
}).then(r => r.json()).then(console.log)
```

### Option 2: Manual Entry

Create a single update entry manually:

```bash
curl -X POST https://your-domain.vercel.app/api/admin/sync-updates \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "version": "V1.0.0",
    "release_date": "2025-01-20",
    "change_type": "patch",
    "changes": [
      "Fixed dashboard updates section",
      "Automated deployment tracking",
      "Improved update grouping by day"
    ]
  }'
```

### Option 3: Bulk Import Deployments

If you have deployment data, you can bulk import:

```bash
curl -X POST https://your-domain.vercel.app/api/admin/sync-updates \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "deployments": [
      {
        "id": "deployment-123",
        "state": "READY",
        "target": "production",
        "createdAt": "2025-01-20T10:00:00Z",
        "meta": {
          "githubCommitMessage": "feat: Add new feature\n\n- Implemented feature X\n- Fixed bug Y",
          "githubCommitSha": "abc123",
          "githubCommitRef": "main"
        }
      }
    ]
  }'
```

## Quick Fix: Create Updates for Recent Days

If you just want to create placeholder updates for recent days:

```javascript
// Run in browser console while logged in as admin
const days = ['2025-01-20', '2025-01-19', '2025-01-18']; // Adjust dates

for (const date of days) {
  await fetch('/api/admin/sync-updates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: `V${date.replace(/-/g, '.')}`,
      release_date: date,
      change_type: 'patch',
      changes: [`Deployment updates for ${date}`]
    })
  }).then(r => r.json()).then(console.log);
}
```

## Verify Updates

After syncing, check the dashboard:
1. Go to your dashboard homepage
2. Scroll to the "Updates" section
3. You should see tabs for each day with updates

## Set Up Webhook (For Future)

To prevent this issue in the future, set up the Vercel webhook:

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Scroll to "Deployment Hooks"
3. Click "Add Deployment Hook"
4. Configure:
   - **Name**: `Auto-create Updates`
   - **URL**: `https://your-domain.vercel.app/api/webhooks/vercel`
   - **Events**: Select "Production Deployment Ready"
   - **Secret** (optional): Set `VERCEL_WEBHOOK_SECRET` env var

See `docs/VERCEL_WEBHOOK_SETUP.md` for detailed instructions.

## Troubleshooting

### "Admin access required"
- Make sure you're logged in as an admin user
- Check that your user has admin privileges in the database

### "Failed to fetch from Vercel API"
- Verify `VERCEL_TOKEN` is set correctly
- Check that `VERCEL_PROJECT_ID` matches your project
- Ensure the token has read access to deployments

### Updates not appearing
- Check browser console for errors
- Verify the API call returned success
- Check database: `SELECT * FROM updates ORDER BY release_date DESC;`
- Hard refresh the dashboard page (Cmd+Shift+R)



