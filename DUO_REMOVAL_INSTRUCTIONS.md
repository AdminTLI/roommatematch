# DUO Data Removal - Migration Instructions

This document outlines the steps to remove DUO data and migrate to SKDB-only programme data.

## Overview

All DUO programme data has been removed from the codebase. The system now uses **Studiekeuzedatabase (SKDB)** as the exclusive source for programme data.

## Changes Made

### 1. Database Migration
A new migration file has been created: `db/migrations/028_remove_duo_data.sql`

This migration will:
- Delete all DUO-only programmes (programmes with DUO source but no SKDB data)
- Update programmes that have both sources to be SKDB-only (remove DUO flag)
- Delete programmes with rio_code but no SKDB enrichment
- Ensure all remaining programmes are marked as SKDB-only

### 2. Code Updates
- ✅ Updated `scripts/sync-skdb-programmes.ts` to be the primary sync script (removed DUO matching logic)
- ✅ Updated `package.json` to use SKDB sync as default
- ✅ Updated documentation (`docs/PROGRAMME_DATA.md`)
- ✅ Updated UI components to remove DUO references
- ✅ Updated programme repository to deprecate DUO filters

## Required Actions

### Step 1: Run SQL Migration in Supabase

**⚠️ IMPORTANT: This will delete DUO-only programmes from your database. Make sure you have a backup before proceeding.**

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the migration script:

```sql
-- Copy and paste the contents of db/migrations/028_remove_duo_data.sql
-- Or run it directly from the file
```

The migration will:
- Delete programmes that are DUO-only
- Update programmes with both sources to be SKDB-only
- Ensure all programmes have `sources->>'skdb' = 'true'` and `skdb_only = true`

### Step 2: Sync SKDB Data

After running the migration, sync all programmes from SKDB:

```bash
# Make sure you have SKDB_API_KEY or SKDB_DUMP_PATH set in your .env
pnpm sync:programmes
# or
pnpm tsx scripts/sync-skdb-programmes.ts
```

This will:
- Fetch all programmes from SKDB API or dump file
- Create/update programmes in the database
- Ensure all programmes are properly synced from SKDB

### Step 3: Verify Migration

Check that all programmes are now SKDB-only:

```sql
-- Check programmes count
SELECT COUNT(*) FROM programmes;

-- Verify all programmes are SKDB-only
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE sources->>'skdb' = 'true') as skdb_programmes,
  COUNT(*) FILTER (WHERE skdb_only = true) as skdb_only_count
FROM programmes;

-- Should show: total = skdb_programmes = skdb_only_count
```

## What Was Removed

1. **DUO Sync Script**: `scripts/sync-duo-programmes.ts` is no longer used (but kept for reference)
2. **DUO Matching Logic**: Removed from SKDB sync script
3. **DUO References**: Removed from documentation and UI components

## What Remains

- **SKDB Sync Script**: `scripts/sync-skdb-programmes.ts` is now the primary sync script
- **Programme Repository**: Updated to handle SKDB-only data
- **Database Schema**: `programmes` table structure remains the same, but all data is now SKDB-sourced

## Notes

- The `rio_code` column still exists in the database but will be `NULL` for all programmes (SKDB doesn't always provide RIO codes)
- The `sources` JSONB field will have `{ "duo": false, "skdb": true }` for all programmes
- The `skdb_only` flag will be `true` for all programmes
- CROHO codes from SKDB are used as the primary identifier

## Rollback (if needed)

If you need to rollback, you would need to:
1. Restore from a database backup taken before running the migration
2. Re-run the DUO sync script (if you still have it)
3. Re-run the SKDB sync to enrich the data

However, since DUO data has been removed from the codebase, a full rollback would require restoring the old code as well.

## Questions?

If you need to re-fetch SKDB data or have questions about the SKDB API, refer to:
- `docs/PROGRAMME_DATA.md` - Updated documentation
- `scripts/sync-skdb-programmes.ts` - SKDB sync script


