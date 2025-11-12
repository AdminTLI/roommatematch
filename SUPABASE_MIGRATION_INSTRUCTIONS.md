# Supabase Migration Instructions

## Overview
This document provides instructions for running the consolidated features migration in Supabase SQL Editor.

## Migration File
**File**: `db/migrations/055_consolidated_features_migration.sql`

This consolidated migration includes:
1. Study months support (columns, views, functions)
2. Admin analytics tables (metrics, anomalies, funnels, surveys)
3. Matching experiments (A/B testing)
4. Support tickets system
5. Referral system
6. Announcements system

## Steps to Run Migration

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Copy and Paste Migration SQL
1. Open the file: `db/migrations/055_consolidated_features_migration.sql`
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase

### 3. Run the Migration
1. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for the migration to complete (should take 10-30 seconds)
3. Check for any errors in the output

### 4. Verify Migration Success
Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'analytics_metrics',
  'analytics_anomalies',
  'user_journey_events',
  'analytics_funnels',
  'satisfaction_surveys',
  'survey_responses',
  'housing_market_analytics',
  'conflict_hotspots',
  'admin_dashboard_configs',
  'analytics_reports',
  'matching_experiments',
  'experiment_assignments',
  'matching_quality_metrics',
  'support_tickets',
  'ticket_messages',
  'ticket_attachments',
  'referral_codes',
  'referrals',
  'campus_ambassadors',
  'announcements',
  'announcement_views'
)
ORDER BY table_name;
```

You should see all 21 tables listed.

### 5. Verify Columns Added to user_academic
Run this query to verify study month columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_academic'
AND column_name IN ('study_start_month', 'graduation_month', 'programme_duration_months')
ORDER BY column_name;
```

You should see:
- `study_start_month` (integer)
- `graduation_month` (integer)
- `programme_duration_months` (integer)

### 6. Verify View Was Updated
Run this query to verify the view exists:

```sql
SELECT view_definition 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'user_study_year_v';
```

You should see the view definition with month-aware calculation logic.

## What This Migration Does

### Study Months (Migrations 045, 046, 050)
- Adds `study_start_month` and `graduation_month` columns to `user_academic`
- Updates `user_study_year_v` view with month-aware calculation
- Adds `programme_duration_months` column
- Creates trigger to automatically calculate programme duration
- Backfills existing records with calculated duration

### Admin Analytics (Migration 011 - FIXED)
- Creates analytics tables: `analytics_metrics`, `analytics_anomalies`, `user_journey_events`
- Creates funnel analysis table: `analytics_funnels`
- Creates survey tables: `satisfaction_surveys`, `survey_responses`
- Creates housing analytics: `housing_market_analytics`
- Creates safety analytics: `conflict_hotspots`
- Creates dashboard configs: `admin_dashboard_configs`
- Creates reports: `analytics_reports`
- **Fixed**: Changed `admin_users` to `admins` in all RLS policies

### Matching Experiments (Migration 051)
- Creates `matching_experiments` table for A/B testing
- Creates `experiment_assignments` table for user assignments
- Creates `matching_quality_metrics` table for tracking match quality
- Sets up RLS policies for admins and users

### Support Tickets (Migration 052)
- Creates `support_tickets` table
- Creates `ticket_messages` table
- Creates `ticket_attachments` table
- Creates function to generate ticket numbers
- Creates trigger to auto-generate ticket numbers
- Sets up RLS policies for users and admins

### Referral System (Migration 053)
- Creates `referral_codes` table
- Creates `referrals` table
- Creates `campus_ambassadors` table
- Creates function to generate referral codes
- Sets up RLS policies for users and admins

### Announcements (Migration 054)
- Creates `announcements` table
- Creates `announcement_views` table
- Sets up RLS policies for users and admins

## Troubleshooting

### Error: "relation 'admins' does not exist"
**Solution**: The `admins` table should already exist. If it doesn't, you may need to run earlier migrations first. Check if the table exists:

```sql
SELECT * FROM information_schema.tables WHERE table_name = 'admins';
```

### Error: "relation 'universities' does not exist"
**Solution**: The `universities` table should already exist. If it doesn't, you need to create it first or run the base schema migration.

### Error: "function update_updated_at_column() does not exist"
**Solution**: The migration creates this function at the beginning, so this shouldn't happen. If it does, the function creation might have failed. Check if it exists:

```sql
SELECT * FROM information_schema.routines WHERE routine_name = 'update_updated_at_column';
```

### Error: "duplicate key value violates unique constraint"
**Solution**: This means some tables or policies already exist. The migration uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS`, so this shouldn't happen. If it does, you may need to manually drop the conflicting objects.

### Error: "column 'match_id' references non-existent table"
**Solution**: The `matching_quality_metrics` table has a nullable `match_id` column that references `matches(id)`. If the `matches` table doesn't exist, the column will still be created but the foreign key constraint won't be enforced. This is intentional for flexibility.

## Post-Migration Verification

After running the migration, verify:

1. **All tables exist** (run the verification query above)
2. **RLS policies are enabled** on all new tables
3. **Indexes are created** for performance
4. **Functions work correctly**:
   ```sql
   -- Test programme duration calculation
   SELECT calculate_programme_duration_months(2024, 9, 2027, 6);
   -- Should return 33 (months)
   
   -- Test ticket number generation
   SELECT generate_ticket_number();
   -- Should return a ticket number like 'TICKET-20250120-0001'
   
   -- Test referral code generation
   SELECT generate_referral_code('00000000-0000-0000-0000-000000000000'::UUID);
   -- Should return a referral code like 'REF-00000000-XXXX'
   ```

5. **View works correctly**:
   ```sql
   -- Test study year view
   SELECT * FROM user_study_year_v LIMIT 5;
   ```

## Next Steps

After successful migration:

1. **Test the features**:
   - Create a support ticket
   - Create an announcement
   - Generate a referral code
   - Create a matching experiment

2. **Verify cron jobs** are working:
   - Check Vercel dashboard for cron job executions
   - Verify maintenance cron is running daily at 2 AM
   - Verify match cron is running daily at midnight

3. **Monitor for errors**:
   - Check Supabase logs for any errors
   - Check Vercel function logs for cron job errors
   - Monitor admin dashboard for analytics data

## Notes

- This migration is **idempotent** - it can be run multiple times safely
- All tables use `IF NOT EXISTS` to prevent duplicate creation
- All policies use `DROP POLICY IF EXISTS` before creating
- The migration handles backward compatibility for existing data
- Study month columns are nullable for existing users

## Support

If you encounter any issues:
1. Check the error message in Supabase SQL Editor
2. Verify all required tables exist (`admins`, `universities`, `user_academic`)
3. Check Supabase logs for detailed error messages
4. Ensure you have the necessary permissions to create tables and policies

