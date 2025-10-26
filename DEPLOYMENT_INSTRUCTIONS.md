# Complete Matching System - Deployment Instructions

## Database Migrations Required

Run these SQL migrations in Supabase SQL Editor in this exact order:

### 1. Add Suggestions Tables
```sql
-- Run the existing migration
-- File: db/migrations/add_suggestions_tables.sql
```

### 2. Seed Question Items
```sql
-- Run the new migration
-- File: db/migrations/seed_question_items.sql
```

### 3. Create Vector Function
```sql
-- Run the new migration
-- File: db/migrations/create_vector_function.sql
```

### 4. Add Onboarding Submissions Table
```sql
-- Run the new migration
-- File: db/migrations/add_onboarding_submissions.sql
```

## Environment Variables

Add to Vercel Environment Variables:

```bash
CRON_SECRET=your-secure-random-string-here
```

Generate the secret with:
```bash
openssl rand -base64 32
```

## Code Changes Applied

✅ **Fixed Onboarding Wizard** (`app/onboarding/components/onboarding-wizard.tsx`)
- Added proper profile creation with all required fields
- Added onboarding submission record creation
- Added automatic user vector generation after questionnaire completion

✅ **Updated Match Configuration** (`config/match-mode.json`)
- Set minimum fit index to 50%
- Set auto-match threshold to 80%
- Extended expiry to 7 days

✅ **Created Vercel Cron Endpoint** (`app/api/cron/match/route.ts`)
- Secure endpoint with CRON_SECRET authentication
- Runs matching for all active users
- 5-minute timeout for large datasets

✅ **Configured Vercel Cron** (`vercel.json`)
- Runs every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- Automatic activation after deployment

✅ **Updated Matching Orchestrator** (`lib/matching/orchestrator.ts`)
- Implemented dual-tier suggestion system
- 80%+ compatibility = automatic matches
- 50-79% compatibility = manual consent required

✅ **Removed Verification Block** (`app/matches/page.tsx`)
- Users can see matches immediately after questionnaire
- Verification can be re-enabled later

## Testing Flow

After deployment:

1. **Create Test Account**
   - Sign up with new email
   - Complete full onboarding questionnaire

2. **Verify Database Records**
   - Check `user_vectors` table has entry for new user
   - Check `onboarding_submissions` table has entry
   - Check `profiles` table has complete data

3. **Test Matching**
   - Wait 6 hours for automatic run OR
   - Manually trigger: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourapp.vercel.app/api/cron/match`
   - Check matches page shows suggestions

4. **Verify Dual-Tier System**
   - 80%+ matches should show as "accepted" immediately
   - 50-79% matches should show as "pending" requiring mutual acceptance

## Manual Testing Commands

```bash
# Test cron endpoint manually
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourapp.vercel.app/api/cron/match

# Check database tables
# In Supabase SQL Editor:
SELECT COUNT(*) FROM user_vectors;
SELECT COUNT(*) FROM onboarding_submissions;
SELECT COUNT(*) FROM match_suggestions;
```

## Expected Behavior

- **New users**: Complete questionnaire → Vector created → Included in next matching cycle
- **Matching runs**: Every 6 hours automatically
- **High compatibility (80%+)**: Automatic matches, both users see as "accepted"
- **Medium compatibility (50-79%)**: Suggestions requiring both users to accept
- **Low compatibility (<50%)**: Not shown to users

## Troubleshooting

If matching doesn't work:

1. Check CRON_SECRET is set in Vercel
2. Verify all database migrations ran successfully
3. Check Vercel function logs for errors
4. Ensure question_items table is populated
5. Verify user vectors are being created during onboarding

## Future Enhancements

When ready to enable verification:
1. Change `verification_status: 'unverified'` to `'pending'` in onboarding
2. Uncomment verification check in matches page
3. Implement ID verification provider
