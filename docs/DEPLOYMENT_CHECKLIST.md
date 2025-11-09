# Production Deployment Checklist

## Pre-Deployment

### Environment Variables Verification

Verify all required environment variables are set in your deployment platform (Vercel, etc.):

#### Required Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- [ ] `ADMIN_SHARED_SECRET` - Admin API authentication secret
- [ ] `CRON_SECRET` - Matching automation security secret
- [ ] `PERSONA_WEBHOOK_SECRET` - Persona webhook verification secret
- [ ] `PERSONA_API_KEY` - Persona API key
- [ ] `NEXT_PUBLIC_PERSONA_TEMPLATE_ID` - Persona template ID
- [ ] `NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID` - Persona environment ID
- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API URL (required for distributed locking and rate limiting in multi-instance deployments)
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST API token (get from https://console.upstash.com/)

#### Optional but Recommended

- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking DSN
- [ ] `NEXT_PUBLIC_SENTRY_ENVIRONMENT` - Sentry environment (production/staging)
- [ ] `NODE_ENV` - Node environment (production)
- [ ] `NEXTAUTH_URL` - Application URL
- [ ] `NEXTAUTH_SECRET` - NextAuth secret

#### Feature-Specific Variables

- [ ] `FEATURE_HOUSING` - Enable housing features (true/false)
- [ ] `FEATURE_MOVE_IN` - Enable move-in planning (true/false)
- [ ] `ALLOW_DEMO_CHAT` - Allow demo chat (false in production)

### Database Migrations

- [ ] All migrations have been run in production database
- [ ] `024_admin_analytics_function.sql` migration has been applied
- [ ] RLS policies are enabled on all tables
- [ ] Database indexes are created for performance

### Security Checklist

- [ ] All API routes have proper authentication
- [ ] Admin routes require admin authentication
- [ ] Webhook endpoints verify signatures
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] CSRF protection is enabled
- [ ] Environment variables are not exposed to client-side

### Monitoring Setup

- [ ] Sentry is configured and receiving errors
- [ ] Vercel Analytics is enabled
- [ ] Error boundaries are in place
- [ ] Logging is configured

## Post-Deployment

### Verification Tests

- [ ] Homepage loads correctly
- [ ] User signup works
- [ ] Email verification works
- [ ] User sign-in works
- [ ] Onboarding flow completes
- [ ] Matching algorithm runs
- [ ] Chat functionality works
- [ ] Admin panel is accessible (admin users only)
- [ ] Persona webhook receives and processes events

### Performance Checks

- [ ] Page load times are acceptable (<2s)
- [ ] API response times are reasonable (<500ms)
- [ ] Database queries are optimized
- [ ] No memory leaks detected

### Security Verification

- [ ] RLS policies prevent unauthorized access
- [ ] Admin routes reject non-admin users
- [ ] Webhook signatures are validated
- [ ] Rate limiting prevents abuse

## Monitoring

- [ ] Set up alerts for error rates
- [ ] Monitor API response times
- [ ] Track user signup rates
- [ ] Monitor matching algorithm performance
- [ ] Track webhook delivery success

## Rollback Plan

- [ ] Database backup strategy is in place
- [ ] Previous deployment version is tagged
- [ ] Rollback procedure is documented
- [ ] Team knows how to execute rollback

