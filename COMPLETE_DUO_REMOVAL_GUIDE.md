# Complete DUO Removal Guide

This guide will help you completely remove all DUO data and ensure everything is SKDB-only.

## Problem

You're seeing:
- DUO program layouts still in the list
- Missing courses from universities
- Not all DUO courses were removed/replaced

## Solution: Complete Cleanup and Re-sync

### Step 1: Run the Complete Cleanup Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of db/migrations/029_complete_duo_removal.sql
```

Or run it directly:

```bash
# If you have psql access
psql $DATABASE_URL -f db/migrations/029_complete_duo_removal.sql
```

This will:
- Delete ALL programmes with DUO source
- Delete ALL programmes with rio_code (DUO identifier)
- Ensure all remaining programmes are SKDB-only

### Step 2: Verify SKDB Dump File is Set

Make sure your `.env.local` has:

```bash
SKDB_DUMP_PATH=./data/skdb-opleidingen.csv
```

Verify the file exists:
```bash
ls -lh data/skdb-opleidingen.csv
```

### Step 3: Run the Comprehensive Cleanup Script

This script will:
1. Delete ALL programmes (clean slate)
2. Re-sync ALL programmes from SKDB
3. Verify everything is SKDB-only

```bash
pnpm tsx scripts/cleanup-and-resync-programmes.ts
```

### Step 4: Verify Results

After the script completes, check your database:

```sql
-- Check total count
SELECT COUNT(*) as total FROM programmes;

-- Verify all are SKDB-only
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE sources->>'skdb' = 'true') as skdb_count,
  COUNT(*) FILTER (WHERE skdb_only = true) as skdb_only_count,
  COUNT(*) FILTER (WHERE sources->>'duo' = 'true') as duo_count,
  COUNT(*) FILTER (WHERE rio_code IS NOT NULL) as rio_count
FROM programmes;

-- Should show: total = skdb_count = skdb_only_count, duo_count = 0, rio_count = 0
```

### Step 5: Check by Institution

Verify programmes are populated for each university:

```sql
SELECT 
  institution_slug,
  level,
  COUNT(*) as count
FROM programmes
GROUP BY institution_slug, level
ORDER BY institution_slug, level;
```

## Alternative: Manual Cleanup

If the automated script doesn't work, you can do it manually:

### 1. Delete All Programmes

```sql
DELETE FROM programmes;
```

### 2. Run SKDB Sync

```bash
pnpm sync:programmes
```

### 3. Verify

```sql
SELECT COUNT(*) FROM programmes;
-- Should be 3000-4000+ programmes
```

## Troubleshooting

### Issue: SKDB sync not running

Check:
1. `SKDB_DUMP_PATH` is set in `.env.local`
2. The CSV file exists at that path
3. The file is readable

### Issue: Still seeing DUO data

1. Check if programmes have `sources->>'duo' = 'true'`
2. Check if programmes have `rio_code` set
3. Run the cleanup migration again
4. Re-run the sync

### Issue: Missing programmes

1. Check the SKDB CSV file has data
2. Check the sync script output for errors
3. Verify institution mapping is working

## Expected Results

After completion:
- ✅ All programmes have `sources->>'skdb' = 'true'`
- ✅ All programmes have `skdb_only = true`
- ✅ No programmes have `sources->>'duo' = 'true'`
- ✅ No programmes have `rio_code` set
- ✅ 3,000-4,000+ total programmes
- ✅ Programmes for all major universities


