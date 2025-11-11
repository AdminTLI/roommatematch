# University City Search Feature - Setup Checklist

## Prerequisites

1. ✅ Database migration applied
2. ✅ Cities populated in database
3. ✅ API endpoint working
4. ✅ Frontend component displaying cities

## Step-by-Step Verification

### 1. Verify Migration Applied

Run this SQL in your Supabase SQL Editor:

```sql
-- Check if city column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'universities' AND column_name = 'city';
```

Expected: Should return a row with `city` column of type `varchar(100)`

### 2. Verify Cities Are Populated

Run this SQL:

```sql
-- Check cities in database
SELECT city, COUNT(*) as count
FROM universities
WHERE is_active = true AND city IS NOT NULL
GROUP BY city
ORDER BY city;
```

Expected: Should return 25 cities with counts

### 3. Verify Trigger Function Fixed

Run this SQL:

```sql
-- Check trigger function
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';
```

Expected: Should show function using `clock_timestamp()` not `NOW()`

If it shows `NOW()`, run the fix:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Test API Endpoint

Test the API endpoint directly:

```bash
# In your browser or curl
curl https://your-domain.vercel.app/api/universities
```

Expected: Should return JSON with `{ "cities": ["Amsterdam", "Utrecht", ...] }`

### 5. Check Browser Console

Open browser DevTools (F12) and check:
- Console for any errors
- Network tab for `/api/universities` request
- Response from the API

### 6. Verify Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for API routes) - **Critical: Must be the service role key, not the anon key**

## Common Issues

### Issue: Dropdown shows "No cities available"

**Possible causes:**
1. Migration not applied → Run migration SQL
2. Cities not populated → Run mapping script
3. API endpoint error → Check server logs
4. RLS policies blocking → API uses admin client (should be fine)

**Solution:**
1. Check browser console for errors
2. Check Vercel server logs
3. Verify API endpoint returns data
4. Run diagnostic script: `npx tsx scripts/check-universities-cities.ts`

### Issue: API returns empty array

**Check:**
1. Database has cities (run SQL queries above)
2. API endpoint is deployed
3. Environment variables are set in Vercel
4. No RLS issues (API uses service role key to bypass RLS)

### Issue: "infinite recursion detected in policy for relation 'admins'" error

**Cause:** The API endpoint was trying to use RLS policies which have recursion issues with the `admins` table.

**Solution:** The API now uses the service role key directly to completely bypass RLS. Ensure:
1. `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (not the anon key)
2. The service role key is correct (from Supabase Dashboard → Settings → API → Service Role Key)
3. The API route has been redeployed with the latest code

## Quick Fix Commands

```bash
# Check database state
npx tsx scripts/check-universities-cities.ts

# Populate cities (if missing)
npm run map:universities

# Fix trigger function (if needed)
# Run SQL from: scripts/fix-trigger-function.sql
```

## Deployment Checklist

- [ ] Migration applied to production database
- [ ] Cities populated in production database
- [ ] Environment variables set in Vercel
- [ ] API endpoint deployed
- [ ] Frontend deployed
- [ ] Tested in production environment

