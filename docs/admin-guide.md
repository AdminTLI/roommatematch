# Admin Panel Guide

## Access
Navigate to `/admin` - only users in the `admins` table can access.

## Modules

### Dashboard
Overview metrics and quick actions.

### Users
- View all users with search and filters
- Filter by verification status, university, active/inactive
- Actions: suspend, activate, reset questionnaire, resend verification
- View user details: profile, verification history, matches, chats

### Verifications
- View all verification requests
- Filter by status (pending, approved, rejected, expired)
- Manual override: approve or reject verifications
- View provider evidence URLs

### Matches
- View all matches (pending, accepted, declined)
- Filter by status, score range, date range
- Actions: manual creation, force-refresh matching

### Chats
- View all chat rooms
- See members, message counts, unread counts
- Actions: close chat, export logs, view messages

### Reports
- View abuse reports queue
- See reporter, target, reason, message context
- Quick actions: dismiss, warn user, ban user
- View full context and user history

### Metrics
- User signups chart
- Verification rate chart
- Match activity chart
- Retention metrics

### Logs
- System logs and error feed
- Filter by level, date range, search
- Export functionality

## Audit Logging
All admin actions are automatically logged to the `admin_actions` table for compliance and accountability.

## API Authentication
Admin API routes require:
1. User authentication (via Supabase)
2. Admin role check (user must be in `admins` table)
3. Optional: `x-admin-secret` header for sensitive operations

