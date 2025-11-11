# Operational Runbooks - Domu Match

## Overview

This document provides operational procedures for common issues and maintenance tasks in the Domu Match platform.

## Common Issues

### Issue: Users Cannot Verify Identity

**Symptoms**:
- Verification status stuck on "pending"
- Webhook errors in logs
- Users unable to access matches/chat

**Diagnosis**:
1. Check `verification_webhooks` table for errors
2. Verify KYC provider credentials in environment variables
3. Check webhook endpoint accessibility

**Resolution**:
1. Verify environment variables:
   - `KYC_PROVIDER` (veriff/persona/onfido)
   - `{PROVIDER}_API_KEY`
   - `{PROVIDER}_WEBHOOK_SECRET`
2. Check webhook URL is accessible: `/api/verification/provider-webhook`
3. Manually process failed webhooks if needed
4. Admin can manually override verification status if needed

### Issue: Matching Not Running

**Symptoms**:
- No new matches generated
- Cron job not executing
- Users reporting no suggestions

**Diagnosis**:
1. Check Vercel cron configuration in `vercel.json`
2. Verify cron endpoint: `/api/cron/match`
3. Check admin logs for matching errors
4. Verify users have completed onboarding and have vectors

**Resolution**:
1. Manually trigger matching: `POST /api/admin/trigger-matches`
2. Check vector generation: Run backfill if needed
3. Verify cron schedule in Vercel dashboard
4. Check orchestrator logs for errors

### Issue: Chat Messages Not Sending

**Symptoms**:
- Messages not appearing
- Real-time subscriptions failing
- CSRF errors in console

**Diagnosis**:
1. Check CSRF token in request headers
2. Verify user is member of chat room
3. Check Supabase real-time subscriptions
4. Verify message content passes moderation filters

**Resolution**:
1. Ensure `fetchWithCSRF` is used for all POST requests
2. Verify RLS policies allow message insertion
3. Check message content (no links/emails/phones)
4. Restart real-time subscriptions if needed

### Issue: Reports Not Processing

**Symptoms**:
- Reports stuck in "open" status
- Auto-blocking not working
- Admin notifications not sent

**Diagnosis**:
1. Check `reports` table for pending reports
2. Verify notification system is working
3. Check auto-block logic in report endpoint

**Resolution**:
1. Manually process reports via admin panel
2. Verify notification creation function
3. Check rate limiting isn't blocking reports
4. Review auto-block threshold (3 reports in 24 hours)

## Maintenance Tasks

### Backfill User Vectors

**When**: After onboarding changes or vector generation issues

**Procedure**:
1. Navigate to Admin → Backfill Vectors
2. Or call: `POST /api/admin/backfill-vectors`
3. Monitor progress in admin logs
4. Verify vectors created: `SELECT COUNT(*) FROM user_vectors`

### Backfill Chat Rooms

**When**: After match confirmation changes or missing chats

**Procedure**:
1. Navigate to Admin → Backfill Chats
2. Or call: `POST /api/admin/backfill-chats`
3. This creates chat rooms for confirmed matches
4. Verify chats created: `SELECT COUNT(*) FROM chats`

### Manual Match Confirmation

**When**: Users report mutual acceptance but chat not created

**Procedure**:
1. Navigate to Admin → Confirm Pending Matches
2. Or call: `POST /api/admin/confirm-pending-matches`
3. This confirms matches where both users accepted
4. Chat rooms are auto-created on confirmation

### Database Migrations

**When**: After deploying new migrations

**Procedure**:
1. Apply migrations in Supabase SQL Editor
2. Order: `020_kyc_verification.sql`, `021_admin_actions.sql`, `022_reports_enhancement.sql`
3. Verify tables created: Check `db/schema.sql`
4. Verify RLS policies: Check `db/policies.sql`

### Clear Rate Limits

**When**: Users report being rate-limited incorrectly

**Procedure**:
1. Access rate limit store (Redis or in-memory)
2. Clear keys for affected users
3. Key format: `rate_limit:{type}:{userId}`
4. Or restart application to clear in-memory store

## Monitoring

### Key Metrics to Monitor

1. **User Metrics**:
   - Total users
   - Verified users
   - Active users (last 30 days)

2. **Matching Metrics**:
   - Matches created per day
   - Match acceptance rate
   - Average match score

3. **Chat Metrics**:
   - Active chats
   - Messages per day
   - Unread message counts

4. **Safety Metrics**:
   - Reports submitted
   - Reports resolved
   - Users blocked

### Log Locations

- **Application Logs**: Vercel dashboard → Functions → Logs
- **Database Logs**: Supabase dashboard → Logs
- **Admin Actions**: `admin_actions` table
- **Error Tracking**: Sentry (if configured)

### Alerts

Set up alerts for:

1. **High Error Rates**: > 5% error rate in API routes
2. **Matching Failures**: Cron job failures
3. **High Report Volume**: > 10 reports per hour
4. **Verification Failures**: > 10% failure rate

## Emergency Procedures

### Platform Outage

1. Check Vercel status page
2. Check Supabase status page
3. Verify environment variables
4. Check recent deployments
5. Rollback if needed

### Data Breach

1. Immediately revoke affected API keys
2. Notify affected users
3. Review access logs
4. Update security credentials
5. Document incident

### Abuse Incident

1. Immediately suspend reported user
2. Review all reports for that user
3. Export chat logs if needed
4. Document actions taken
5. Notify affected users if necessary

## Backup and Recovery

### Database Backups

- Supabase provides automatic daily backups
- Manual backups: Use Supabase dashboard → Database → Backups
- Retention: 7 days for automatic backups

### Recovery Procedure

1. Identify backup point
2. Restore from Supabase dashboard
3. Verify data integrity
4. Test critical functionality
5. Notify users if data loss occurred

## Security

### API Key Rotation

**Frequency**: Quarterly or after security incident

**Procedure**:
1. Generate new keys
2. Update environment variables in Vercel
3. Update Supabase service role key if changed
4. Verify all services working
5. Revoke old keys after 24 hours

### Access Control

- Admin access requires:
  - User in `admins` table
  - Valid admin secret (if configured)
  - Proper role (super_admin/university_admin/moderator)

### Audit Logging

- All admin actions logged to `admin_actions` table
- Includes: user, action, entity, metadata, timestamp
- Review logs regularly for suspicious activity

## Support Contacts

- **Technical Issues**: Check logs and runbooks first
- **Security Issues**: security@domumatch.nl
- **User Support**: support@domumatch.nl
- **Emergency**: Use on-call rotation

**Last Updated**: December 2024

