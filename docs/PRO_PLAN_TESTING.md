# Supabase Pro Plan Testing Checklist

This document outlines testing procedures for Supabase Pro Plan features implemented in the platform.

## Overview

The Pro Plan optimizations include:
- Image Transformation API
- Connection Pooling
- Enhanced Error Handling
- Query Performance Monitoring
- Improved Retry Logic

## Testing Checklist

### 1. Image Transformation API

#### Setup
- [ ] Verify image transformation is enabled in `supabase/config.toml`
- [ ] Confirm Pro Plan is active in Supabase dashboard

#### Functional Tests
- [ ] Test avatar images load correctly with optimized URLs
- [ ] Verify housing listing photos use optimized formats (WebP)
- [ ] Check that image transformation parameters work (width, height, quality)
- [ ] Test responsive image URLs for different screen sizes
- [ ] Verify fallback behavior when image transformation fails

#### Performance Tests
- [ ] Measure image load times before/after transformation
- [ ] Check network tab for WebP format usage
- [ ] Verify CDN caching is working (check cache headers)
- [ ] Test with various image sizes (small, medium, large)
- [ ] Measure bandwidth savings (compare file sizes)

#### Expected Results
- Image load times reduced by 30%+
- WebP format used for supported browsers
- Smaller file sizes without quality loss
- Faster page load times

### 2. Connection Pooling

#### Setup
- [ ] Verify `SUPABASE_POOLER_URL` is set in environment (optional - uses regular URL if not set)
- [ ] Confirm pooled client is used for read-heavy operations

#### Functional Tests
- [ ] Test dashboard queries work correctly with pooled client
- [ ] Verify housing listings load properly
- [ ] Check match queries execute successfully
- [ ] Test concurrent requests (multiple users accessing simultaneously)
- [ ] Verify write operations still use regular client

#### Performance Tests
- [ ] Monitor connection pool usage under load
- [ ] Measure query response times with pooling enabled
- [ ] Test with 10+ concurrent users
- [ ] Check for connection limit errors (should not occur)
- [ ] Verify improved concurrency (500+ connections vs 200)

#### Expected Results
- No connection limit errors
- Better performance under concurrent load
- Reduced connection overhead
- Improved query response times

### 3. Query Performance Monitoring

#### Setup
- [ ] Verify `query-monitor.ts` is imported where needed
- [ ] Check that monitoring only runs in development

#### Functional Tests
- [ ] Verify slow queries are logged in development console
- [ ] Check that monitoring doesn't affect production performance
- [ ] Test with various query types (dashboard, matches, housing)
- [ ] Verify query timing is accurate

#### Performance Tests
- [ ] Identify queries taking > 1000ms
- [ ] Measure query performance improvements
- [ ] Track query execution times over time
- [ ] Compare before/after optimization

#### Expected Results
- Slow queries identified and logged
- No performance impact in production
- Query performance data available for optimization

### 4. Enhanced Error Handling

#### Setup
- [ ] Verify enhanced logger is used throughout the app
- [ ] Check Sentry integration (if enabled)

#### Functional Tests
- [ ] Test error logging with context
- [ ] Verify errors are logged with timestamps
- [ ] Check error boundaries catch and display errors gracefully
- [ ] Test network error scenarios
- [ ] Verify timeout handling works correctly

#### Error Scenarios to Test
- [ ] Database connection errors
- [ ] Query timeout errors
- [ ] 404 errors (missing resources)
- [ ] 500 errors (server errors)
- [ ] Network failures
- [ ] Invalid data errors

#### Expected Results
- All errors logged with context
- User-friendly error messages displayed
- No unhandled errors in console
- Errors tracked in Sentry (if enabled)

### 5. Query Retry Logic

#### Setup
- [ ] Verify React Query retry configuration in `providers.tsx`
- [ ] Check exponential backoff is working

#### Functional Tests
- [ ] Test retry behavior on network errors
- [ ] Verify 4xx errors are not retried
- [ ] Check 5xx errors are retried up to 3 times
- [ ] Test exponential backoff timing
- [ ] Verify retry doesn't cause duplicate operations

#### Performance Tests
- [ ] Measure retry delay timing
- [ ] Check total retry time (should not exceed 30s)
- [ ] Verify retry doesn't impact user experience

#### Expected Results
- Transient errors automatically retried
- Client errors (4xx) not retried
- Server errors (5xx) retried with backoff
- No duplicate operations from retries

### 6. Realtime Subscription Fixes

#### Setup
- [ ] Verify idempotent migration runs successfully
- [ ] Check realtime subscriptions are working

#### Functional Tests
- [ ] Test match_suggestions realtime subscription
- [ ] Verify notifications update in real-time
- [ ] Check messages update in real-time
- [ ] Test subscription error handling
- [ ] Verify subscriptions reconnect after errors

#### Error Scenarios
- [ ] Test subscription with network interruption
- [ ] Verify graceful handling of subscription errors
- [ ] Check retry logic for failed subscriptions

#### Expected Results
- No CHANNEL_ERROR messages in console
- Subscriptions reconnect automatically
- Real-time updates work reliably
- No duplicate subscriptions

## Performance Metrics

### Key Metrics to Track

1. **Image Performance**
   - Average image load time
   - Image format distribution (WebP vs original)
   - Bandwidth savings percentage
   - Cache hit rate

2. **Query Performance**
   - Average query response time
   - Slow query count (> 1000ms)
   - Connection pool usage
   - Query success rate

3. **Error Rates**
   - Total error count
   - Error rate by type
   - Retry success rate
   - Timeout occurrences

4. **User Experience**
   - Page load time
   - Time to interactive
   - Error rate visible to users
   - User-reported issues

### Measurement Tools

- Browser DevTools (Network tab, Performance tab)
- Supabase Dashboard (Database metrics, Realtime metrics)
- Application logs (query monitoring, error logs)
- Sentry (error tracking, if enabled)

## Debugging Tools

### Development-Only Features

1. **Query Performance Dashboard**
   - Access via React Query DevTools
   - View query cache status
   - Monitor query execution times

2. **Connection Pool Status**
   - Check Supabase dashboard for connection metrics
   - Monitor active connections
   - Track connection pool usage

3. **Image Transformation Cache**
   - Check CDN cache headers
   - Monitor cache hit rates
   - Verify transformation parameters

## Troubleshooting

### Common Issues

1. **Image Transformation Not Working**
   - Verify Pro Plan is active
   - Check image transformation is enabled in config
   - Verify image URLs are using transformation parameters
   - Check browser console for errors

2. **Connection Pool Errors**
   - Verify pooler URL is correct
   - Check connection limits in Supabase dashboard
   - Monitor connection pool usage
   - Consider increasing pool size if needed

3. **Slow Queries**
   - Use query monitor to identify slow queries
   - Check database indexes
   - Review query execution plans
   - Consider query optimization

4. **Subscription Errors**
   - Verify table is published for realtime
   - Check REPLICA IDENTITY is set
   - Review subscription error logs
   - Test subscription reconnection

## Success Criteria

- [ ] No realtime subscription errors in console
- [ ] Image load times reduced by 30%+
- [ ] Query response times improved under load
- [ ] Zero production errors from new features
- [ ] All migrations run successfully (idempotent)
- [ ] Error handling prevents user-facing issues
- [ ] Performance improvements are measurable

## Next Steps

After completing testing:
1. Document any issues found
2. Create performance baseline metrics
3. Set up monitoring alerts
4. Plan additional optimizations based on findings

