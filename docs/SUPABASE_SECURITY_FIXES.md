# Supabase Security Fixes - Manual Steps

This document outlines the manual steps required to complete the security fixes that cannot be automated via migrations.

## Overview

The migration file `db/migrations/048_fix_security_issues.sql` addresses most security issues automatically. However, two items require manual intervention:

1. **Vector Extension Schema** - Moving the `vector` extension from `public` to `extensions` schema
2. **Leaked Password Protection** - Enabling in Supabase Auth settings

## 1. Vector Extension Schema Migration

### Issue
The `vector` extension is currently installed in the `public` schema, which is a security concern. It should be moved to the `extensions` schema.

### Manual Steps

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Find the `vector` extension
4. If available, use the schema selector to move it to the `extensions` schema
5. If not available in the UI, proceed with Option B

**Option B: Via SQL Editor**
1. Open the Supabase SQL Editor
2. Execute the following SQL:

```sql
-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension to extensions schema
-- Note: This may require dropping and recreating the extension
-- WARNING: This will require recreating all vector columns and indexes

-- Step 1: Backup your data (if needed)
-- Step 2: Drop the extension
DROP EXTENSION IF EXISTS vector CASCADE;

-- Step 3: Recreate in extensions schema
CREATE EXTENSION vector SCHEMA extensions;

-- Step 4: Update all references to use extensions.vector
-- For example, if you have:
--   vector(50)
-- Change to:
--   extensions.vector(50)

-- Step 5: Recreate all vector columns and indexes
-- (This will need to be done for each table using vector type)
```

**Important Notes:**
- Moving the extension will require dropping and recreating all vector columns
- This is a destructive operation - ensure you have backups
- All code referencing `vector` type will need to be updated to use `extensions.vector`
- Consider doing this during a maintenance window

**Alternative Approach:**
If moving the extension is too disruptive, you can leave it in the `public` schema but document this as an accepted risk. The extension itself doesn't expose sensitive data, but it's a best practice to keep extensions in a separate schema.

## 2. Enable Leaked Password Protection

### Issue
Supabase Auth's leaked password protection is currently disabled. This feature checks passwords against HaveIBeenPwned.org to prevent users from using compromised passwords.

### Manual Steps

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Policies** (or **Settings**)
3. Look for **Password Security** or **Password Strength** settings
4. Find the **Leaked Password Protection** option
5. Enable the feature
6. Save the changes

**Alternative Path:**
- Some Supabase projects have this under **Authentication** → **Configuration** → **Password Security**
- Look for options like:
  - "Check passwords against HaveIBeenPwned"
  - "Leaked password protection"
  - "Password breach detection"

### Documentation Reference
- [Supabase Password Security Documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## Verification

After completing the manual steps:

1. **Verify Vector Extension:**
   ```sql
   SELECT extname, nspname 
   FROM pg_extension e
   JOIN pg_namespace n ON e.extnamespace = n.oid
   WHERE extname = 'vector';
   ```
   The `nspname` should be `extensions` (not `public`).

2. **Verify Leaked Password Protection:**
   - Try creating a test user with a known compromised password (e.g., "password123")
   - The system should reject it if the feature is enabled
   - Check the Supabase Auth logs for password validation messages

## Additional Notes

### Migration File Coverage

The migration file `048_fix_security_issues.sql` automatically fixes:

✅ **Error**: Removed SECURITY DEFINER from `user_study_year_v` view  
✅ **Warnings**: Added `SET search_path = ''` to all 18 functions  
✅ **Info**: Added RLS policies for all 12 tables missing policies  

### Functions Updated

All functions now have `SET search_path = ''` to prevent search_path injection attacks:
- `users_in_same_chat`
- `user_is_chat_member`
- `update_updated_at_column`
- `create_notification`
- `user_in_same_university`
- `compute_compatibility_score`
- `find_potential_matches`
- `create_matches_for_user`
- `update_user_vector`
- `get_user_match_stats`
- `get_admin_analytics`
- `handle_new_user`
- `update_programmes_updated_at`
- `compute_user_vector_and_store`
- `update_profile_verification_status`
- `broadcast_message_to_realtime`

### RLS Policies Added

Policies were added for tables that had RLS enabled but no policies:
- `admins`
- `announcements`
- `eligibility_rules`
- `forum_comments`
- `forum_posts`
- `group_suggestions`
- `housing_applications`
- `message_reads`
- `move_in_expenses`
- `move_in_plan_participants`
- `move_in_tasks`
- `reports`

## Support

If you encounter issues with these manual steps:
1. Check the Supabase documentation for the latest procedures
2. Contact Supabase support if the extension migration fails
3. Review the migration file for any errors in the SQL syntax

