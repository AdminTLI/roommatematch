# Vercel Secrets Check

## Required GitHub Secrets

Your GitHub repository needs these secrets to be set:

1. **VERCEL_TOKEN** - Your Vercel API token
2. **VERCEL_ORG_ID** - Your Vercel organization ID  
3. **VERCEL_PROJECT_ID** - Your Vercel project ID

## How to get these values:

### 1. VERCEL_TOKEN
- Go to https://vercel.com/account/tokens
- Create a new token
- Copy the token value

### 2. VERCEL_ORG_ID and VERCEL_PROJECT_ID
- Run this command in your project directory:
```bash
npx vercel link
```
- This will create a `.vercel/project.json` file
- Open `.vercel/project.json` and copy the values:
  - `orgId` → VERCEL_ORG_ID
  - `projectId` → VERCEL_PROJECT_ID

## How to set GitHub Secrets:

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the name and value

## Alternative: Use Vercel's GitHub Integration

Instead of GitHub Actions, you can use Vercel's built-in GitHub integration:

1. Go to your Vercel dashboard
2. Import your GitHub repository
3. Vercel will automatically deploy on every push to main

This is often easier than setting up GitHub Actions manually.
