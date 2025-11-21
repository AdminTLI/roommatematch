# SKDB-Only Verification Checklist

This document verifies that the system is now using SKDB exclusively for university and programme data.

## ✅ Database Verification

### Migration Status
- [x] SQL migration `028_remove_duo_data.sql` has been run successfully
- [x] All DUO-only programmes have been deleted
- [x] All programmes now have `sources->>'skdb' = 'true'`
- [x] All programmes have `skdb_only = true`

### Verify with SQL:
```sql
-- Check that all programmes are SKDB-only
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE sources->>'skdb' = 'true') as skdb_programmes,
  COUNT(*) FILTER (WHERE skdb_only = true) as skdb_only_count,
  COUNT(*) FILTER (WHERE sources->>'duo' = 'true') as duo_programmes
FROM programmes;

-- Should show: total = skdb_programmes = skdb_only_count, duo_programmes = 0
```

## ✅ Code Verification

### Sync Scripts
- [x] `scripts/sync-skdb-programmes.ts` - Updated to be primary sync (no DUO matching)
- [x] `scripts/sync-programmes.ts` - Updated to only sync SKDB
- [x] `package.json` - `sync:programmes` now points to SKDB sync
- [x] `scripts/sync-duo-programmes.ts` - Kept for reference but not used

### Programme Repository
- [x] `lib/programmes/repo.ts` - All functions query `programmes` table (now SKDB-only)
- [x] `getProgrammesByInstitutionAndLevel()` - Uses SKDB data
- [x] `getAllProgrammesForInstitution()` - Uses SKDB data
- [x] `getProgrammesBySource()` - Updated to deprecate DUO filter

### API Endpoints
- [x] `app/api/programmes/route.ts` - Uses `getProgrammesByInstitutionAndLevel()` (SKDB data)
- [x] All programme data comes from `programmes` table (SKDB-only)

### Onboarding Flow
- [x] `app/onboarding/components/steps/basics-step.tsx` - Fetches universities from `universities` table
- [x] `app/onboarding/components/steps/academic-step.tsx` - Uses `ProgrammeSelect` component
- [x] `components/ui/programme-select.tsx` - Fetches from `/api/programmes` (SKDB data)
- [x] `components/questionnaire/ProgrammeSelect.tsx` - Fetches from `/api/programmes` (SKDB data)

### UI Components
- [x] Removed DUO references from programme select components
- [x] Updated error messages to remove DUO mentions
- [x] All programme displays now use SKDB data

## ✅ Data Flow Verification

### University Selection
1. User selects university in onboarding
2. Data comes from `universities` table (not DUO-dependent)
3. University slug is stored for programme lookup

### Programme Selection
1. User selects degree level (bachelor/master/premaster)
2. System calls `/api/programmes?inst=<slug>&level=<level>`
3. API uses `getProgrammesByInstitutionAndLevel()` from repository
4. Repository queries `programmes` table filtered by `institution_slug` and `level`
5. All programmes in table are SKDB-sourced (after migration)

### Data Storage
1. Selected programme ID is stored in onboarding answers
2. On submission, programme data is saved to `user_academic` table
3. `program_id` references `programs` table (legacy) or programme data from `programmes` table

## ✅ Documentation Updates

- [x] `docs/PROGRAMME_DATA.md` - Updated to reflect SKDB-only approach
- [x] `SUPABASE_SETUP.md` - Updated sync instructions
- [x] `DUO_REMOVAL_INSTRUCTIONS.md` - Created migration guide
- [x] `README.md` - May still have DUO references (acceptable for historical context)

## ⚠️ Remaining DUO References (Acceptable)

These files still reference DUO but are either:
- Historical documentation
- Utility functions (like `getInstitutionBrinCode` which is just a mapping function)
- Deprecated scripts kept for reference

**Files with DUO references (acceptable):**
- `docs/DUO_LICENSING.md` - Historical licensing documentation
- `docs/UAVG_COMPLIANCE.md` - Historical compliance documentation
- `docs/ROPA.md` - Historical data processing documentation
- `scripts/sync-duo-programmes.ts` - Kept for reference
- `lib/duo/*.ts` - Utility functions (BRIN code mapping, etc.)
- `db/migrations/025_programmes_table.sql` - Historical migration
- `db/migrations/026_enrich_programmes_table.sql` - Historical migration
- `db/migrations/027_skdb_programme_fields.sql` - Historical migration

## ✅ Testing Checklist

### Manual Testing Steps

1. **University Selection**
   - [ ] Go to onboarding
   - [ ] Select a university
   - [ ] Verify university list loads correctly

2. **Programme Selection**
   - [ ] Select degree level (bachelor/master/premaster)
   - [ ] Verify programme list loads from SKDB
   - [ ] Select a programme
   - [ ] Verify programme data is correct (name, ECTS, duration if available)

3. **Data Persistence**
   - [ ] Complete onboarding
   - [ ] Verify programme data is saved correctly
   - [ ] Check `user_academic` table has correct `program_id` or programme reference

4. **API Testing**
   - [ ] Test `/api/programmes?inst=<slug>&level=bachelor`
   - [ ] Verify response contains SKDB programmes only
   - [ ] Verify programmes have `sources.skdb = true` (if included in response)

## 🔍 Key Points

1. **All programme data** in the `programmes` table is now sourced exclusively from SKDB
2. **University data** comes from the `universities` table (independent of DUO/SKDB)
3. **Onboarding flow** uses SKDB programmes via the `/api/programmes` endpoint
4. **No DUO dependencies** in the active codebase for programme data
5. **Migration completed** - DUO-only programmes have been removed

## Next Steps

1. Run SKDB sync to ensure all programmes are up to date:
   ```bash
   pnpm sync:programmes
   ```

2. Verify programme data in database:
   ```sql
   SELECT institution_slug, level, COUNT(*) 
   FROM programmes 
   GROUP BY institution_slug, level 
   ORDER BY institution_slug, level;
   ```

3. Test onboarding flow end-to-end to ensure programme selection works correctly

