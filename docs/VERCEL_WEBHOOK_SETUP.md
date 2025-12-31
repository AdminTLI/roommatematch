# Vercel Webhook Setup for Automatic Updates

This guide explains how to set up the Vercel webhook to automatically create update entries in the dashboard when new deployments are published.

## Overview

The webhook endpoint at `/api/webhooks/vercel` automatically:
- Creates a new update entry when a production deployment completes
- Extracts version information from commit messages or auto-increments
- Categorizes changes as major, minor, or patch
- Displays all changes (no truncation) in the dashboard

## Setup Instructions

### Step 1: Configure Webhook Secret (Optional but Recommended)

1. Generate a secure random string for the webhook secret:
   ```bash
   openssl rand -hex 32
   ```

2. Add it to your Vercel environment variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VERCEL_WEBHOOK_SECRET` = `<your-generated-secret>`
   - Apply to: Production, Preview, Development

3. Add the same secret to your local `.env.local` for testing:
   ```env
   VERCEL_WEBHOOK_SECRET=your-generated-secret-here
   ```

### Step 2: Configure Vercel Webhook

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Scroll down to "Deployment Hooks" section
3. Click "Add Deployment Hook"
4. Configure:
   - **Name**: `Auto-create Updates`
   - **URL**: `https://your-domain.vercel.app/api/webhooks/vercel`
   - **Events**: Select "Production Deployment Ready"
   - **Secret** (if configured): Use the same `VERCEL_WEBHOOK_SECRET` value

### Step 3: Test the Webhook

1. Make a commit and push to your main branch:
   ```bash
   git commit -m "feat: Add new feature"
   git push origin main
   ```

2. Wait for Vercel to deploy

3. Check the webhook logs:
   - Vercel Dashboard → Deployments → Latest → Functions → `/api/webhooks/vercel`
   - Or check your application logs

4. Verify the update appears in the dashboard:
   - Go to your dashboard homepage
   - Check the Updates section
   - You should see the new version with all changes listed

## How It Works

### Version Detection

The webhook tries to extract version information in this order:

1. **From commit message**: Looks for patterns like `v1.2.3`, `V1.2.3`, `version 1.2.3`
2. **Auto-increment**: If no version found, increments the latest version in the database
   - Example: Latest is `V14.0.0` → Next is `V14.0.1`

### Change Detection

Changes are extracted from:
- Commit message lines
- Deployment metadata
- If no changes found, creates default entry with deployment info

### Change Type Classification

- **Major**: Security, CVE, breaking changes, migrations
- **Minor**: Features, new functionality, integrations
- **Patch**: Fixes, improvements, refactoring

## Manual Version Creation

If you want to manually specify a version in your commit message:

```bash
git commit -m "v15.0.0: Major security update

- Fix CVE-2025-12345
- Upgrade Next.js to 15.5.7
- Improve authentication flow"
```

The webhook will:
- Extract version `V15.0.0`
- Create changes from the bullet points
- Classify as "major" due to "security" keyword

## Troubleshooting

### Webhook Not Firing

1. Check Vercel deployment logs for webhook calls
2. Verify the webhook URL is correct
3. Ensure the deployment target is "production"
4. Check that the deployment state is "READY"

### Updates Not Appearing

1. Check webhook endpoint logs in Vercel
2. Verify Supabase credentials are set correctly
3. Check database `updates` table for new entries
4. Ensure RLS policies allow inserts (admin users)

### Version Conflicts

If a version already exists, the webhook will skip creating a duplicate. To force a new version:
- Include version in commit message: `v15.0.1: ...`
- Or manually create the update entry in the database

## Security Notes

- The webhook secret is optional but recommended for production
- Without a secret, anyone with the URL can trigger updates
- Consider IP allowlisting if needed (Vercel provides deployment IPs)
- The endpoint only processes production deployments by default

## API Endpoint Details

**URL**: `/api/webhooks/vercel`  
**Method**: `POST`  
**Auth**: Optional `Authorization: Bearer <VERCEL_WEBHOOK_SECRET>` header

**Request Body** (Vercel webhook payload):
```json
{
  "type": "deployment",
  "deployment": {
    "id": "...",
    "state": "READY",
    "target": "production",
    "meta": {
      "githubCommitMessage": "...",
      "githubCommitSha": "...",
      "githubCommitRef": "main"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "version": "V15.0.1",
  "changeType": "minor",
  "changesCount": 3
}
```



