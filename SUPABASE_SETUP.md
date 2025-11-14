# Supabase Database Setup Guide

This guide will help you set up the complete Domu Match database schema in your Supabase project.

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Access**: You need access to the Supabase SQL Editor
3. **Credentials**: Have your Supabase project URL and service role key ready

## Step-by-Step Setup

### 1. Access Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar

### 2. Enable Required Extensions

First, ensure the required extensions are enabled:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

If you get an error about the `vector` extension, you may need to enable it from the Supabase dashboard:
1. Go to Database → Extensions
2. Find "vector" and click "Enable"

### 3. Execute the Complete Schema

1. Copy the entire contents of `db/setup/01_complete_schema.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute

**Expected Result**: This should create all tables, indexes, triggers, functions, policies, and storage buckets without errors.

### 4. Add Seed Data

1. Copy the contents of `db/setup/02_seed_demo_data.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute

**Expected Result**: This will create sample universities, programs, questionnaire items, and housing listings.

### 5. Host Demo User Data

**Important**: The demo user data is commented out in the seed file because it requires the actual user ID from Supabase Auth.

#### Option A: Create Demo User via API (Recommended)
Use the seeding API endpoint we created:

```bash
curl -X POST \
  -H "x-seed-token: YOUR_ADMIN_SEED_TOKEN" \
  https://your-app.vercel.app/api/admin/seed-demo-user
```

#### Option B: Create Demo User Manually
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Email: `demo@account.com`
4. Password: `Testing123`
5. Check "Auto Confirm User"
6. Click "Create user"

#### Option C: Add Demo User Data Manually
After creating the demo user:

1. Get the user ID:
```sql
SELECT id FROM auth.users WHERE email = 'demo@account.com';
```

2. Replace `[DEMO_USER_ID]` in `db/setup/02_seed_demo_data.sql` with the actual ID
3. Uncomment and run the demo user INSERT statements

### 6. Verify Setup

1. Copy the contents of `db/setup/03_verify_setup.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute

**Expected Results**:
- All extensions installed
- All custom types created
- All tables created (50+ tables)
- All indexes created
- All RLS policies active
- All triggers functional
- Vector extension working
- Seed data present

### 7. Test the Setup

#### Test Demo User Login
1. Go to your app's signifies page
2. Use credentials: `demo@account.com` / `Testing123`
3. Should successfully log in

#### Test Database Queries
Run these test queries in the SQL Editor:

```sql
-- Test 1: Check if demo user can be found
SELECT u.id, u.email, p.first_name, p.verification_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'demo@account.com';

-- Test 2: Check questionnaire responses
SELECT qi.section, qi.key, qi.type, r.value
FROM responses r
JOIN question_items qi ON r.question_key = qi.key
JOIN auth.users u ON r.user_id = u.id
WHERE u.email = 'demo@account.com'
ORDER BY qi.section, qi.key;

-- Test 3: Check housing listings
SELECT title, city, rent_monthly, status
FROM housing_listings
WHERE status = 'active';

-- Test 4: Check universities and programs
SELECT u.name as university, p.name as program, p.degree_level
FROM universities u
JOIN programs p ON u.id = p.university_id
WHERE p.active = true
ORDER BY u.name, p.name;
```

## Troubleshooting

### Common Issues

#### 1. Vector Extension Error
**Error**: `extension "vector" does not exist`

**Solution**: 
1. Go to Supabase Dashboard → Database → Extensions
2. Find "vector" and click "Enable"
3. Wait for it to be enabled
4. Re-run the schema

#### 2. Permission Errors
**Error**: `permission denied for table/function`

**Solution**: 
- Ensure you're using the correct Supabase project
- Check that you have admin access to the project
- Try running queries one section at a time

#### 3. Foreign Key Constraint Errors
**Error**: `insert or update on table violates foreign key constraint`

**Solution**: 
- Make sure you're running the schema in the correct order
- Check that referenced tables exist before creating dependent tables
- The schema file is already in the correct order

#### 4. RLS Policy Errors
**Error**: `new row violates row-level security policy`

**Solution**: 
- This is normal behavior - RLS policies are working correctly
- Use the service role key for administrative operations
- For user operations, ensure the user is authenticated

#### 5. Demo User Not Found
**Error**: Demo user login fails

**Solution**: 
1. Verify the user was created in Supabase Auth
2. Check that the user is confirmed (not pending)
3. Ensure the password is exactly `Testing123`
4. Check that the user profile was created

### Verification Checklist

After setup, verify these items:

- [ ] Vector extension enabled
- [ ] UUID extension enabled  
- [ ] All 50+ tables created
- [ ] All indexes created
- [ ] All RLS policies active
- [ ] All triggers functional
- [ ] Storage bucket created
- [ ] Seed data inserted
- [ ] Demo user can sign in
- [ ] Demo user has complete profile
- [ ] Questionnaire responses exist
- [ ] Housing listings visible
- [ ] Matching algorithm works

## Database Schema Overview

The database includes these main feature areas:

### Core System
- **Users & Authentication**: Extended Supabase auth with profiles
- **Universities & Programs**: Academic institution data
- **Questionnaire System**: User preferences and matching data
- **Matching Engine**: Compatibility scoring and suggestions

### Communication
- **Chat System**: Real-time messaging between users
- **Forum**: University-specific discussions
- **Announcements**: University communications

### Housing
- **Listings**: Verified housing options
- **Tour Bookings**: Property viewing appointments
- **Applications**: Housing application tracking
- **Preferences**: User housing requirements

### Reputation
- **Endorsements**: Quick positive feedback
- **References**: Detailed testimonials
- **Trust Badges**: Earned achievements
- **Reputation Scores**: Aggregated metrics

### Planning
- **Move-in Planner**: Shared planning tools
- **Tasks**: Move-in task management
- **Expenses**: Shared expense tracking
- **Timeline**: Important dates and events

### Content
- **Video Intros**: User profile videos
- **AI Analysis**: Content processing
- **Moderation**: Content safety

### Administration
- **Analytics**: Usage tracking
- **Reports**: User reports and safety
- **Moderation**: Content and user moderation

## Programme Data Sync

After setting up the database, you need to sync programme data from DUO and SKDB:

### Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# SKDB Configuration (for programme enrichment)
SKDB_API_BASE=https://api.skdb.nl
SKDB_API_KEY=your_skdb_api_key_here

# OR use dump file (fallback)
SKDB_DUMP_PATH=./data/studiekeuzedatabase_dump.csv
```

### Sync Process

1. **Sync DUO Programmes (Baseline)**:
   ```bash
   pnpm tsx scripts/sync-duo-programmes.ts
   ```
   This fetches programme data from DUO's public CSV endpoints and establishes the baseline.

2. **Sync SKDB Programmes (Enrichment)**:
   ```bash
   pnpm tsx scripts/sync-skdb-programmes.ts
   ```
   This enriches DUO programmes with SKDB data (ECTS, duration, admission requirements).

3. **Or Run Both Together**:
   ```bash
   # Using orchestrator script
   pnpm tsx scripts/sync-programmes.ts
   
   # Or using --with-skdb flag
   pnpm tsx scripts/sync-duo-programmes.ts --with-skdb
   ```

### Fallback Strategy

If SKDB API is unreachable:
- The sync will fail gracefully
- DUO programmes will still be available
- You can use `SKDB_DUMP_PATH` to provide a CSV/XLSX dump file
- SKDB enrichment can be run later when API is available

### Coverage Reports

After syncing, check coverage reports in `data/programmes/`:
- `.coverage-report.json` - DUO coverage statistics
- `.skdb-sync-report.json` - SKDB matching and enrichment statistics
- `.combined-coverage-report.json` - Merged view of both sources

### Data Licensing

- **DUO Data**: Public data from Dutch Ministry of Education (no restrictions)
- **SKDB Data**: Check SKDB license terms for usage and retention requirements
- Always cite data sources appropriately

## Next Steps

After successful setup:

1. **Sync Programme Data**: Run DUO and SKDB sync scripts (see above)
2. **Test the Application**: Try all major features
3. **Configure Environment**: Set up all environment variables
4. **Deploy**: Push to production
5. **Monitor**: Check Supabase logs for any issues
6. **Backup**: Set up regular database backups
7. **Schedule Syncs**: Set up cron jobs for regular programme data updates

## Support

If you encounter issues:

1. Check the verification script output
2. Review Supabase logs
3. Test individual components
4. Refer to this troubleshooting guide
5. Check the Supabase documentation

The database schema is comprehensive and production-ready, supporting all features of the Domu Match platform.