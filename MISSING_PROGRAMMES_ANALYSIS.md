# Missing Programmes Analysis

## Problem Summary
- **Total SKDB programmes processed**: 3,293
- **Expected to be saved**: 2,892 (1,625 matched + 1,267 SKDB-only)
- **Actually saved**: 1,267
- **Missing**: ~1,625 programmes

## Root Cause Analysis

The sync report shows:
- **1,625 matched**: Programmes that found existing records in the database
- **1,625 enriched**: Programmes that were supposedly updated
- **1,267 SKDB-only**: Programmes that were newly created

The issue is that the "matched" programmes are being counted as updated, but they're not actually being saved to the database.

## Possible Causes

1. **Update failures**: The `update()` calls in `upsertSkdbProgramme` might be failing silently
2. **RLS policies**: Row Level Security might be blocking updates
3. **Constraint violations**: Unique constraints might be preventing updates
4. **Transaction rollbacks**: Updates might be rolled back due to errors

## Solution

The best approach is to re-run the sync script with better error handling. However, since the sync script already has error handling, the issue might be:

1. **RLS blocking updates**: The service role should bypass RLS, but let's verify
2. **Missing institution_slug**: Updates might fail if `institution_slug` is missing
3. **Constraint conflicts**: Updates might conflict with unique constraints

## Recommended Fix

Run the sync script again with verbose logging to see what's happening:

```bash
pnpm sync:programmes
```

If that doesn't work, we need to:
1. Check RLS policies on the programmes table
2. Verify that the service role key has proper permissions
3. Check for constraint violations in the database logs

## Next Steps

1. Re-run the sync script and check for errors
2. Verify database constraints and RLS policies
3. Check Supabase logs for failed updates
4. If needed, manually fix the sync script to handle updates better


