# Migration Instructions for Matching System Fix

> **⚠️ IMPORTANT**: This is a Markdown instruction file, NOT the SQL migration file.  
> Do NOT run this file directly in SQL Editor. Instead, use the SQL code provided below or open `db/migrations/016_add_chat_members_last_read_at.sql`

## Overview

This document provides instructions for applying the database migration required to fix the matching system and chat functionality.

## Migration to Apply

**File**: `db/migrations/016_add_chat_members_last_read_at.sql`

This migration adds the `last_read_at` column to the `chat_members` table, which is required for unread message tracking and is currently causing 400 errors in the chat system.

## Steps to Apply Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. **IMPORTANT**: Copy ONLY the SQL code from `db/migrations/016_add_chat_members_last_read_at.sql` (do NOT copy from this markdown file)

   Open the file `db/migrations/016_add_chat_members_last_read_at.sql` and copy its contents:
   ```sql
   -- Add last_read_at column to chat_members for unread tracking
   ALTER TABLE chat_members 
   ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

   -- Create index for efficient unread queries
   CREATE INDEX IF NOT EXISTS idx_chat_members_last_read_at 
   ON chat_members(last_read_at);

   -- Add comment for documentation
   COMMENT ON COLUMN chat_members.last_read_at IS 'Timestamp when user last read messages in this chat';
   ```
   
   **OR** copy-paste this SQL directly:
   ```sql
   ALTER TABLE chat_members 
   ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

   CREATE INDEX IF NOT EXISTS idx_chat_members_last_read_at 
   ON chat_members(last_read_at);

   COMMENT ON COLUMN chat_members.last_read_at IS 'Timestamp when user last read messages in this chat';
   ```
5. Click **Run** to execute the migration
6. Verify the migration succeeded (should show success message)

### Option 2: Via Supabase CLI

If you have Supabase CLI installed and configured:

```bash
cd "/Users/danishsamsudin/Roommate Match"
supabase db push
```

Or manually:

```bash
supabase db execute --file db/migrations/016_add_chat_members_last_read_at.sql
```

### Verification

After applying the migration, verify the column exists:

1. In Supabase Dashboard, go to **Table Editor**
2. Select the `chat_members` table
3. Verify that the `last_read_at` column exists with type `timestamptz`

Or run this SQL query:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'chat_members'
AND column_name = 'last_read_at';
```

Expected result: A row showing `last_read_at` with `data_type = 'timestamp with time zone'`.

## Code Changes Applied

The following code changes have been made:

1. **lib/matching/repo.supabase.ts**: 
   - Updated to use `createAdminClient()` instead of `createClient()`
   - Added security comments explaining why admin access is needed
   - All methods now bypass RLS for matching operations while maintaining security through API route authentication

## Environment Variables Required

Ensure the following environment variables are set in your deployment (Vercel):

- `SUPABASE_SERVICE_ROLE_KEY`: Required for the admin client to work
- `CRON_SECRET`: Required for cron-based matching runs (if using)

## Testing After Migration

After applying the migration and deploying code changes:

1. **Test matching refresh**: 
   - POST `/api/match/suggestions/refresh` with authenticated user
   - Should return suggestions from full cohort (not just current user)

2. **Test suggestions retrieval**:
   - GET `/api/match/suggestions/my` 
   - Should return user's suggestions without errors

3. **Test chat loading**:
   - Navigate to chat page
   - Should work without "column does not exist" errors

4. **Test blocklist filtering**:
   - Decline a suggestion
   - Verify the same user doesn't appear in future suggestions

5. **Test cron endpoint** (if applicable):
   - GET `/api/cron/match` with valid CRON_SECRET header
   - Should successfully run matching for all users

## Deployment Checklist

- [ ] Migration applied to production database
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel environment variables
- [ ] `CRON_SECRET` set in Vercel (if using cron matching)
- [ ] Code changes deployed to production
- [ ] All tests passing
- [ ] Monitoring logs for RLS or matching errors

## Rollback Plan

If issues occur, you can rollback by:

1. Removing the `last_read_at` column (only if no data depends on it):
   ```sql
   ALTER TABLE chat_members DROP COLUMN IF EXISTS last_read_at;
   DROP INDEX IF EXISTS idx_chat_members_last_read_at;
   ```

2. Reverting code changes: The repository can temporarily use `createClient()` again, but matching will not work correctly due to RLS constraints.

## Notes

- The migration uses `IF NOT EXISTS` clauses, so it's safe to run multiple times
- The admin client change is backward compatible with existing API routes
- All API routes already have proper authentication, so no additional security measures are needed
