# Admin Panel Guide

## Overview

The Admin Panel provides comprehensive tools for managing users, moderating content, monitoring system health, and configuring platform settings. All actions are logged for audit and compliance purposes.

## Access & Authentication

### Getting Access

1. **Database Setup**: User must be added to the `admins` table:
   ```sql
   INSERT INTO admins (user_id, role, university_id)
   VALUES ('user-uuid-here', 'admin', 'university-uuid-here');
   ```

2. **Navigate**: Go to `/admin` in your browser
3. **Authentication**: System automatically checks admin status via server-side guard

### Security

- **Server-Side Protection**: All admin routes protected by `app/admin/layout.tsx`
- **RLS Policies**: Database policies ensure admins only see their university's data (if scoped)
- **Audit Logging**: Every action is logged to `admin_actions` table
- **Session Management**: Uses Supabase authentication sessions

## Modules

### Dashboard

**Purpose**: Overview of platform health and key metrics

**Features**:
- Total users count
- Verified users percentage
- Active chats count
- Total matches created
- Pending reports count
- Recent activity feed

**Quick Actions**:
- View pending reports
- Access user management
- Check system logs

**API Endpoint**: `/api/admin/analytics`

---

### Users

**Purpose**: Manage user accounts, profiles, and access

**Features**:
- **Search**: By email, name, or user ID
- **Filters**: 
  - Verification status (verified, pending, unverified)
  - University
  - Account status (active, suspended)
  - Registration date range
- **Bulk Actions**: 
  - Suspend multiple users
  - Activate multiple users
  - Export user list (CSV)

**User Details View**:
- Profile information
- Academic details (university, program, study year)
- Verification history and status
- Match history (accepted/declined)
- Chat activity summary
- Report history (if any)

**Common Workflows**:

**Suspend a User**:
1. Navigate to Users module
2. Search for user by email/name
3. Click "Actions" → "Suspend"
4. Confirm action
5. User is immediately logged out and cannot access platform

**View User Activity**:
1. Click on user row to view details
2. Review matches, chats, and reports
3. Check verification status
4. View audit log for this user

**API Endpoints**:
- `GET /api/admin/users` - List/search users
- `POST /api/admin/users` - Bulk actions (suspend/activate)

---

### Verifications

**Purpose**: Review and manage identity verification requests

**Features**:
- **Queue View**: All pending verifications
- **Filters**: 
  - Status (pending, approved, rejected, expired)
  - Provider (Veriff, Persona, Onfido)
  - Date range
- **Manual Override**: 
  - Approve verification (bypass provider)
  - Reject verification (with reason)
- **Evidence View**: Links to provider verification evidence

**Common Workflows**:

**Approve Pending Verification**:
1. Navigate to Verifications module
2. Filter by "pending" status
3. Click on verification to view details
4. Review provider evidence (if available)
5. Click "Approve" → Confirm
6. User's verification status updates immediately

**Manual Override**:
1. Select verification from queue
2. Click "Manual Override"
3. Choose action (approve/reject)
4. Add optional reason/notes
5. Submit - action is logged

**API Endpoints**:
- `GET /api/admin/verifications` - List verifications
- `POST /api/admin/verifications` - Manual override

---

### Matches

**Purpose**: Monitor and manage match suggestions

**Features**:
- **Match List**: All match suggestions with details
- **Filters**:
  - Status (pending, accepted, declined, expired, confirmed)
  - Compatibility score range
  - Date range
  - Match type (pair, group)
- **Statistics Dashboard**:
  - Total matches
  - Status breakdown
  - Average compatibility score
- **Actions**:
  - View detailed match breakdown
  - Export matches (CSV)
  - Refresh/trigger new matching run
  - Expire matches manually
  - Archive old matches

**Match Details View**:
- Compatibility score breakdown
- Section scores (schedule, cleanliness, social, etc.)
- Match reasons and explanations
- Member information
- Acceptance status per member
- Expiration date

**Common Workflows**:

**Trigger Manual Matching**:
1. Navigate to Matches module
2. Click "Refresh Matches" button
3. System triggers matching orchestrator
4. New matches appear within minutes
5. Users receive notifications

**Review Match Quality**:
1. Filter by status "pending"
2. Sort by compatibility score
3. Review high-scoring matches
4. Check match explanations
5. Identify patterns for algorithm tuning

**API Endpoints**:
- `GET /api/admin/matches` - List matches
- `POST /api/admin/matches` - Bulk actions (expire, archive)
- `GET /api/admin/matches/export` - Export CSV

---

### Chats

**Purpose**: Monitor conversations and moderate chat activity

**Features**:
- **Chat List**: All active chat rooms
- **Information Display**:
  - Chat type (1-on-1, group)
  - Member count
  - Message count
  - Unread counts per user
  - Created date
- **Actions**:
  - Export chat logs (CSV)
  - Close chat (remove all participants)
  - View message history

**Common Workflows**:

**Export Chat Logs** (for investigation):
1. Navigate to Chats module
2. Find chat room by member names or room ID
3. Click "Export" button
4. CSV file downloads with:
   - All messages
   - Sender information
   - Timestamps
   - Message content

**Close Problematic Chat**:
1. Identify chat from reports or search
2. Click "Close" button
3. Confirm action
4. All participants removed from chat
5. Chat effectively archived

**API Endpoints**:
- `GET /api/admin/chats` - List chats
- `POST /api/admin/chats` - Close chat
- `GET /api/admin/chats/export` - Export chat logs

---

### Reports

**Purpose**: Triage and resolve abuse reports

**Features**:
- **Report Queue**: All open reports requiring action
- **Report Details**:
  - Reporter information
  - Target user information
  - Category (spam, harassment, inappropriate, other)
  - Reason and description
  - Message context (if applicable)
  - Attachments (if any)
  - Auto-block status
- **Quick Actions**:
  - **Dismiss**: Report is invalid/no action needed
  - **Warn**: Send warning notification to target user
  - **Ban**: Suspend target user account
- **Filters**:
  - Status (open, actioned, dismissed)
  - Category
  - Date range

**Common Workflows**:

**Triage a Report**:
1. Navigate to Reports module
2. Review open reports queue
3. Click on report to view full details
4. Review message context and user history
5. Decide on action:
   - **Dismiss**: If false report or misunderstanding
   - **Warn**: If minor violation
   - **Ban**: If serious violation or repeat offender

**Warn a User**:
1. Select report → Click "Warn"
2. Review report details
3. Enter warning message (optional)
4. Submit
5. User receives notification with warning
6. Report marked as "actioned"

**Ban a User**:
1. Select report → Click "Ban"
2. Review report details and user history
3. Enter ban reason (required)
4. Submit
5. User account suspended immediately
6. User receives notification
7. Report marked as "actioned"

**Auto-Blocking**:
- System automatically blocks users with 3+ reports in 24 hours
- Auto-blocked status shown in report details
- Admin can review and override if needed

**API Endpoints**:
- `GET /api/admin/reports` - List reports
- `PATCH /api/admin/reports` - Update report status
- `POST /api/admin/reports` - Take action (warn/ban)

---

### Metrics

**Purpose**: Monitor platform health and growth

**Features**:
- **Key Metrics Cards**:
  - Total users
  - Verified users (with percentage)
  - Active chats
  - Total matches
- **Growth Metrics**:
  - New users (7 days, 30 days)
  - Match activity (7 days)
  - Verification rate trend
- **Status Breakdowns**:
  - Verification status distribution
  - Pending reports count

**Use Cases**:
- Monitor user growth trends
- Track verification completion rates
- Identify system health issues
- Plan capacity and scaling

**API Endpoint**: `/api/admin/analytics`

---

### Logs

**Purpose**: Audit trail and system monitoring

**Features**:
- **Audit Log**: All admin actions with timestamps
- **Filters**:
  - Action type (trigger_matches, warn_user, ban_user, etc.)
  - Entity type (user, chat_room, report, match)
  - Search by action name
- **Information Display**:
  - Timestamp
  - Admin user (email)
  - Action performed
  - Entity affected
  - Metadata (full context)
- **Export**: Download logs as CSV

**Common Use Cases**:
- Investigate user complaints
- Review admin activity
- Compliance audits
- Debugging system issues

**API Endpoint**: `/api/admin/logs`

---

## Common Admin Workflows

### Daily Operations

**Morning Check**:
1. Review Dashboard for key metrics
2. Check Reports queue for urgent issues
3. Review Verifications queue
4. Check system Logs for errors

**User Support**:
1. Search Users module for user
2. Review user details and activity
3. Check verification status
4. Review match history
5. Take appropriate action (verify manually, suspend, etc.)

**Content Moderation**:
1. Review Reports queue
2. Investigate reported content
3. Review chat logs if needed
4. Take action (warn/ban/dismiss)
5. Document in report notes

### Weekly Operations

**Match Quality Review**:
1. Navigate to Matches module
2. Review match statistics
3. Check acceptance rates
4. Identify low-quality matches
5. Adjust matching parameters if needed

**System Health Check**:
1. Review Metrics dashboard
2. Check Logs for recurring errors
3. Review cron job execution (matching)
4. Verify database performance

### Monthly Operations

**Analytics Review**:
1. Export user data
2. Review growth trends
3. Analyze verification rates
4. Review match success rates
5. Plan improvements

**Audit Review**:
1. Export admin logs
2. Review all admin actions
3. Verify compliance
4. Document findings

## API Authentication

### Authentication Flow

1. **User Authentication**: Admin must be logged in via Supabase Auth
2. **Role Check**: System verifies user exists in `admins` table
3. **University Scoping**: Admins see only their university's data (if configured)
4. **Action Logging**: All actions logged to `admin_actions` table

### API Request Format

```bash
# Example: List users
curl -X GET https://your-domain.com/api/admin/users \
  -H "Authorization: Bearer SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Error Responses

- **401 Unauthorized**: User not authenticated or not an admin
- **403 Forbidden**: Admin doesn't have permission for this action
- **500 Internal Server Error**: Server error (check logs)

## Audit Logging

### What Gets Logged

Every admin action is automatically logged with:
- **Timestamp**: When action occurred
- **Admin User**: Who performed the action
- **Action Type**: What action was taken
- **Entity**: What was affected (user ID, chat ID, etc.)
- **Metadata**: Full context and details

### Audit Log Structure

```json
{
  "id": "uuid",
  "admin_user_id": "admin-uuid",
  "action": "warn_user",
  "entity_type": "user",
  "entity_id": "user-uuid",
  "metadata": {
    "report_id": "report-uuid",
    "message": "Warning message",
    "role": "admin"
  },
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Compliance

- All logs retained for compliance requirements
- Logs cannot be deleted (immutable)
- Exportable for audits
- GDPR-compliant (PII redacted)

## Best Practices

1. **Always Review Before Acting**: Check full context before warnings/bans
2. **Document Decisions**: Use report notes/action messages to document reasoning
3. **Regular Audits**: Review logs weekly to ensure proper usage
4. **User Communication**: Always provide clear reasons for actions
5. **Escalation**: For serious issues, consult with team before banning
6. **Data Privacy**: Never share user data outside platform
7. **Backup Actions**: Export data before major changes

## Troubleshooting

### Can't Access Admin Panel

**Issue**: Redirected to dashboard or 403 error

**Solutions**:
1. Verify user is in `admins` table
2. Check Supabase authentication session
3. Clear browser cache and cookies
4. Verify admin role in database

### Actions Not Working

**Issue**: Buttons don't respond or API errors

**Solutions**:
1. Check browser console for errors
2. Verify authentication token is valid
3. Check network tab for API responses
4. Review server logs for errors

### Missing Data

**Issue**: Can't see users/chats/reports

**Solutions**:
1. Check university scoping (if configured)
2. Verify RLS policies allow access
3. Check filters aren't too restrictive
4. Verify database connection

## Related Documentation

- [Matching Automation Guide](./matching-automation.md) - How matching works
- [Verification Setup](./verification-setup.md) - KYC provider configuration
- [Runbooks](./runbooks.md) - Operational troubleshooting

