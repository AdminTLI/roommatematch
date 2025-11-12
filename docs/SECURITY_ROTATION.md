# Secrets Rotation Strategy

This document outlines the strategy for rotating secrets and API keys in the Domu Match platform.

## Overview

Regular rotation of secrets and API keys is essential for maintaining security. This document provides procedures for rotating all secrets used in the platform.

## Rotation Schedule

### Quarterly Rotation (Every 3 Months)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `ADMIN_SHARED_SECRET` - Admin API authentication secret
- KYC Provider API Keys (Veriff, Persona, Onfido)

### Monthly Rotation
- `CRON_SECRET` - Cron job authentication secret
- `VERCEL_CRON_SECRET` - Vercel cron secret (if different from CRON_SECRET)

### As Needed
- Database passwords (if using direct database connections)
- SMTP credentials (if changed)
- Third-party API keys (when compromised or expired)

## Rotation Procedures

### 1. Supabase Service Role Key

**Rotation Steps:**
1. Generate new service role key in Supabase dashboard
   - Go to Project Settings → API
   - Generate new service role key
   - Copy the new key immediately (it's only shown once)

2. Update environment variables
   - Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel
   - Update local `.env` files
   - Update any CI/CD environment variables

3. Test functionality
   - Verify admin functions work
   - Verify matching engine works
   - Verify cron jobs work
   - Check application logs for errors

4. Revoke old key (after 24-48 hours)
   - Remove old key from Supabase dashboard
   - Verify no errors after revocation

**Verification:**
- Run admin functions: `POST /api/admin/trigger-matches`
- Check cron job execution
- Verify database operations work

### 2. Cron Secret

**Rotation Steps:**
1. Generate new secret
   ```bash
   openssl rand -hex 32
   ```

2. Update environment variables
   - Update `CRON_SECRET` in Vercel
   - Update `VERCEL_CRON_SECRET` if different
   - Update local `.env` files

3. Update cron job configuration
   - Verify `vercel.json` cron jobs are configured
   - Update Authorization header in cron requests

4. Test cron jobs
   - Manually trigger cron endpoint with new secret
   - Verify cron jobs execute successfully
   - Check logs for authentication errors

5. Revoke old secret (after 24 hours)

**Verification:**
- Manually trigger: `GET /api/cron/match` with new secret
- Check Vercel cron job execution logs
- Verify no authentication errors

### 3. Admin Shared Secret

**Rotation Steps:**
1. Generate new secret
   ```bash
   openssl rand -hex 32
   ```

2. Update environment variables
   - Update `ADMIN_SHARED_SECRET` in Vercel
   - Update local `.env` files

3. Update admin API calls
   - Update `x-admin-secret` header in admin API requests
   - Update any scripts that use admin API

4. Test admin functions
   - Verify admin dashboard works
   - Verify admin API endpoints work
   - Check authentication errors

5. Revoke old secret (after 24 hours)

**Verification:**
- Test admin API: `POST /api/admin/trigger-matches`
- Verify admin dashboard loads
- Check for authentication errors

### 4. KYC Provider API Keys

**Rotation Steps:**
1. Generate new API key in provider dashboard
   - Veriff: Dashboard → API Keys
   - Persona: Dashboard → API Keys
   - Onfido: Dashboard → API Keys

2. Update environment variables
   - Update `VERIFF_API_KEY` / `PERSONA_API_KEY` / `ONFIDO_API_KEY`
   - Update webhook secrets: `VERIFF_WEBHOOK_SECRET` / `PERSONA_WEBHOOK_SECRET` / `ONFIDO_WEBHOOK_SECRET`
   - Update in Vercel and local `.env` files

3. Update webhook URLs (if changed)
   - Update webhook URL in provider dashboard
   - Verify webhook endpoint: `/api/verification/provider-webhook`

4. Test verification flow
   - Create test verification
   - Verify webhook receives callbacks
   - Check verification status updates

5. Revoke old keys (after 24-48 hours)
   - Remove old keys from provider dashboard
   - Verify no errors after revocation

**Verification:**
- Test verification flow end-to-end
- Check webhook logs for callbacks
- Verify verification status updates correctly

### 5. SMTP Credentials

**Rotation Steps:**
1. Generate new SMTP credentials
   - Update SMTP provider settings
   - Generate new app password (if using Gmail)

2. Update environment variables
   - Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - Update in Vercel and local `.env` files

3. Test email sending
   - Send test email
   - Verify email delivery
   - Check email logs

4. Revoke old credentials (after 24 hours)

**Verification:**
- Send test email via admin panel
- Verify email delivery
- Check for SMTP errors

## Rotation Checklist

Use this checklist when rotating secrets:

- [ ] Generate new secret/key
- [ ] Update environment variables in Vercel
- [ ] Update local `.env` files
- [ ] Update any CI/CD environment variables
- [ ] Test functionality with new secret
- [ ] Verify no errors in logs
- [ ] Document rotation date
- [ ] Wait 24-48 hours (grace period)
- [ ] Revoke old secret/key
- [ ] Verify no errors after revocation
- [ ] Update rotation log

## Rotation Log

Maintain a log of all secret rotations:

| Secret | Last Rotated | Next Rotation Due | Rotated By | Notes |
|--------|--------------|-------------------|------------|-------|
| SUPABASE_SERVICE_ROLE_KEY | - | - | - | - |
| CRON_SECRET | - | - | - | - |
| ADMIN_SHARED_SECRET | - | - | - | - |
| VERIFF_API_KEY | - | - | - | - |
| PERSONA_API_KEY | - | - | - | - |
| ONFIDO_API_KEY | - | - | - | - |
| SMTP_PASS | - | - | - | - |

## Emergency Rotation

If a secret is compromised:

1. **Immediately** generate new secret
2. Update environment variables in all environments
3. Revoke compromised secret immediately
4. Review access logs for suspicious activity
5. Notify team of rotation
6. Document incident in security log

## Automation

Consider automating rotation for:
- Cron secrets (can be rotated monthly)
- SMTP credentials (if provider supports it)
- Database passwords (if using managed database)

## Testing After Rotation

After rotating any secret, test:
- [ ] Application starts without errors
- [ ] Admin functions work
- [ ] Cron jobs execute successfully
- [ ] Email sending works
- [ ] Verification flow works
- [ ] Database operations work
- [ ] API endpoints work
- [ ] No authentication errors in logs

## Support

If rotation fails:
1. Check environment variables are set correctly
2. Verify secret format is correct
3. Check application logs for errors
4. Test with old secret to verify issue
5. Contact support if issue persists

## References

- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Veriff API Keys](https://developers.veriff.com/)
- [Persona API Keys](https://docs.withpersona.com/)
- [Onfido API Keys](https://documentation.onfido.com/)

