# Deployment Environment Variables Checklist

This document lists all required and optional environment variables for production deployment.

## Required Environment Variables

### Supabase Configuration
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)

### Application Configuration
- [ ] `NEXT_PUBLIC_APP_URL` - Your production app URL (e.g., https://domumatch.com)
- [ ] `NODE_ENV` - Set to `production`

### Rate Limiting (Required for Production)
- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token

**Note:** Rate limiting will fail in production without Upstash Redis configured. This is critical for multi-instance serverless deployments.

### Admin Security
- [ ] `ADMIN_SHARED_SECRET` - Secure random string for admin API routes (generate with: `openssl rand -hex 32`)

### Email Configuration (Required for User Verification)
- [ ] `SMTP_HOST` - SMTP server hostname
- [ ] `SMTP_PORT` - SMTP server port (usually 587 for TLS)
- [ ] `SMTP_USER` - SMTP username
- [ ] `SMTP_PASS` - SMTP password/app password

## Optional Environment Variables

### KYC Verification (Persona)
- [ ] `KYC_PROVIDER` - Set to `persona` (default)
- [ ] `PERSONA_API_KEY` - Persona API key
- [ ] `PERSONA_API_URL` - Persona API URL (default: https://withpersona.com/api/v1)
- [ ] `PERSONA_WEBHOOK_SECRET` - Persona webhook secret
- [ ] `NEXT_PUBLIC_PERSONA_TEMPLATE_ID` - Persona template ID
- [ ] `NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID` - Persona environment ID

### SURFconext SSO (Optional - Feature Flagged)
- [ ] `SURFCONEXT_ENTITY_ID` - SURFconext entity ID
- [ ] `SURFCONEXT_SSO_URL` - SURFconext SSO URL
- [ ] `SURFCONEXT_CERT_PATH` - Path to SURFconext certificate

### Analytics (Optional)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- [ ] `NEXT_PUBLIC_SENTRY_ENVIRONMENT` - Sentry environment (e.g., `production`)
- [ ] `SENTRY_ENABLE_DEV` - Set to `false` in production

### Cron Jobs (Optional)
- [ ] `CRON_SECRET` - Secret for cron job authentication
- [ ] `VERCEL_CRON_SECRET` - Vercel cron secret

### Database (Optional - for direct connections)
- [ ] `DATABASE_URL` - PostgreSQL connection string (if needed for migrations)

## Verification Steps

1. **Before Deployment:**
   - [ ] All required variables are set in your hosting platform (Vercel, etc.)
   - [ ] `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured
   - [ ] `ADMIN_SHARED_SECRET` is set and secure
   - [ ] SMTP credentials are correct and tested

2. **After Deployment:**
   - [ ] Test email verification flow (sign up new user)
   - [ ] Test rate limiting (make multiple rapid requests)
   - [ ] Test admin routes (verify non-admins are redirected)
   - [ ] Check application logs for missing env var errors

## Security Notes

- Never commit `.env` files to version control
- Use your hosting platform's environment variable management
- Rotate secrets regularly
- Use different secrets for staging and production
- `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_SHARED_SECRET` are highly sensitive - protect them

## Troubleshooting

If you see errors about missing environment variables:
1. Check your hosting platform's environment variable settings
2. Verify variable names match exactly (case-sensitive)
3. Restart your deployment after adding new variables
4. Check application logs for specific missing variable names















