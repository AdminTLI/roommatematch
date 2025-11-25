# How to Sync SKDB Programmes

## Running the Sync Command

Simply run this in your terminal from the project root:

```bash
pnpm sync:programmes
```

Or directly:

```bash
pnpm tsx scripts/sync-skdb-programmes.ts
```

## Why the Count Dropped (This is Expected!)

The count drop from 3-4k to 1,251 is **completely expected** and here's why:

### Before Migration:
- **DUO programmes**: ~2,000-3,000 programmes (from DUO CSV)
- **SKDB programmes**: ~1,251 programmes (already synced from SKDB)
- **Total**: ~3,000-4,000 programmes

### After Migration:
- **DUO-only programmes**: ❌ DELETED (these were the ones without SKDB data)
- **SKDB programmes**: ✅ KEPT (1,251 programmes that had SKDB data)
- **Total**: 1,251 programmes

### What Happened:
The migration deleted all programmes that were:
1. Only from DUO (never matched with SKDB)
2. Had no SKDB enrichment

The 1,251 programmes that remain are the ones that were already synced from SKDB.

## Next Step: Sync All Programmes from SKDB

You need to run the SKDB sync to fetch **ALL** programmes from SKDB. This will:
- Fetch all programmes from SKDB API or dump file
- Create/update programmes in your database
- Should bring your count back up to 3,000-4,000+ programmes (all from SKDB)

## Required Environment Variables

Before running the sync, make sure you have one of these set in your `.env.local` or `.env` file:

### Option 1: SKDB API (Recommended)
```bash
SKDB_API_BASE=https://api.skdb.nl
SKDB_API_KEY=your_skdb_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Option 2: SKDB Dump File (Fallback)
```bash
SKDB_DUMP_PATH=./data/studiekeuzedatabase_dump.csv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Running the Sync

1. **Check your environment variables:**
   ```bash
   # Make sure these are set
   echo $SKDB_API_KEY
   echo $SKDB_DUMP_PATH
   ```

2. **Run the sync:**
   ```bash
   pnpm sync:programmes
   ```

3. **Watch the output:**
   - It will show progress for each institution
   - You'll see how many programmes are being created/updated
   - At the end, you'll see a summary with total counts

4. **Verify the results:**
   ```sql
   SELECT 
     COUNT(*) as total_programmes,
     COUNT(*) FILTER (WHERE level = 'bachelor') as bachelor,
     COUNT(*) FILTER (WHERE level = 'master') as master,
     COUNT(*) FILTER (WHERE level = 'premaster') as premaster
   FROM programmes;
   ```

## Expected Results

After running the sync, you should see:
- **Total programmes**: 3,000-4,000+ (all from SKDB)
- **All programmes** have `sources->>'skdb' = 'true'`
- **All programmes** have `skdb_only = true`
- **Programmes** organized by institution and degree level

## Troubleshooting

### Error: "SKDB_API_KEY or SKDB_DUMP_PATH must be set"
- Make sure you have either `SKDB_API_KEY` or `SKDB_DUMP_PATH` in your `.env.local` file
- Restart your terminal after adding environment variables

### Error: "Failed to fetch from API"
- Check your `SKDB_API_KEY` is valid
- Check your internet connection
- Try using `SKDB_DUMP_PATH` instead if you have a dump file

### No programmes being created
- Check that your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify your Supabase connection
- Check the sync script output for specific error messages

## Need SKDB API Access?

If you don't have SKDB API access yet, you can:
1. Contact SKDB to get API credentials
2. Or use a dump file if SKDB provides one
3. Or let me know and I can help you set up the dump file path


