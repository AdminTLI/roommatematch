# Using SKDB Dump File Instead of API

Since the SKDB API is returning 404, you can use the dump files you already have in the `data/` directory.

## Quick Fix

Add this to your `.env.local` file:

```bash
# Use SKDB dump file instead of API
SKDB_DUMP_PATH=./data/skdb-opleidingen.csv
```

Or if you prefer the XLSX file:

```bash
SKDB_DUMP_PATH=./data/skdb-export.xlsx
```

## Available Files

You have these SKDB dump files:
- `data/skdb-opleidingen.csv` - CSV format (recommended)
- `data/skdb-export.xlsx` - Excel format
- `data/skdb-export.ods` - OpenDocument format
- `data/skdb-instellingen.csv` - Institution mapping (used automatically)

## Steps

1. **Add to `.env.local`:**
   ```bash
   SKDB_DUMP_PATH=./data/skdb-opleidingen.csv
   ```

2. **Run the sync:**
   ```bash
   pnpm sync:programmes
   ```

3. **The script will:**
   - Parse the CSV/XLSX file
   - Map institutions using `skdb-instellingen.csv` (if available)
   - Create/update all programmes in your database
   - Show progress and summary

## Why This Works

The script automatically detects if `SKDB_DUMP_PATH` is set and uses it instead of the API. This is the fallback mode and works perfectly fine - you'll get all the same data.

