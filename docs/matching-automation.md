# Matching Automation Setup Guide

## Overview

The Roommate Match platform uses an automated matching system that runs periodically to create compatibility suggestions between users. The system uses a sophisticated algorithm that considers lifestyle preferences, schedules, cleanliness standards, and academic compatibility.

## How It Works

### Matching Process Flow

1. **Candidate Loading**: System loads all active users who have:
   - Completed onboarding questionnaire
   - Generated compatibility vectors
   - Active accounts (not suspended)

2. **Filtering**: Candidates are filtered by:
   - Active status (`is_active = true`)
   - Excluding users already matched with each other
   - Optional cohort filters (university, program, etc.)

3. **Scoring**: For each potential pair/group:
   - Computes compatibility score using vector similarity
   - Calculates schedule overlap
   - Evaluates cleanliness alignment
   - Assesses social preferences alignment
   - Applies academic affinity bonuses
   - Checks for deal-breakers

4. **Optimization**: Uses optimization algorithms to:
   - Maximize overall compatibility across all users
   - Ensure each user gets top-N best matches
   - Respect deal-breaker constraints

5. **Persistence**: Creates `match_suggestions` records with:
   - Compatibility scores and breakdowns
   - Match explanations and reasons
   - Expiration dates (default: 7 days)
   - Status tracking (pending, accepted, declined, expired)

6. **Notifications**: Sends notifications to users about new matches

## Automated Matching (Cron Job)

### Configuration

The matching system runs automatically via Vercel Cron Jobs. Configuration is in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/match",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule**: Runs every 6 hours (`0 */6 * * *`)

### Cron Endpoint

**URL**: `/api/cron/match`  
**Method**: `GET`  
**Authentication**: Requires `CRON_SECRET` or `VERCEL_CRON_SECRET` in Authorization header

**Request Format**:
```bash
curl -X GET https://your-domain.com/api/cron/match \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Response**:
```json
{
  "success": true,
  "runId": "cron_1234567890",
  "created": 42,
  "notificationsSent": 84,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Environment Variables

Add to your `.env`:

```bash
# Cron authentication (required for security)
CRON_SECRET=your_secure_random_string_here
# OR use Vercel's built-in secret
VERCEL_CRON_SECRET=your_vercel_cron_secret
```

**Security Note**: Always set a cron secret in production. Without it, anyone can trigger matching runs.

### Vercel Setup

1. **Deploy to Vercel**: The cron job is automatically configured when you deploy
2. **Set Environment Variable**: Add `CRON_SECRET` in Vercel dashboard → Settings → Environment Variables
3. **Verify Schedule**: Check Vercel dashboard → Cron Jobs to see execution history

### Monitoring Cron Jobs

**Vercel Dashboard**:
- Go to your project → Cron Jobs
- View execution history and logs
- See success/failure rates

**Application Logs**:
- Check server logs for `[Cron]` prefixed messages
- Successful runs log: `[Cron] Starting scheduled matching run`
- Errors log: `[Cron] Matching failed`

## Manual Matching Trigger

Admins can manually trigger matching runs via the admin API.

### Admin Endpoint

**URL**: `/api/admin/trigger-matches`  
**Method**: `POST`  
**Authentication**: Requires admin authentication

**Request**:
```bash
curl -X POST https://your-domain.com/api/admin/trigger-matches \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "success": true,
  "message": "Match computation completed",
  "processed": 150,
  "total": 150
}
```

**Via Admin Panel**:
1. Navigate to `/admin/matches`
2. Click "Refresh Matches" button
3. System will trigger a new matching run

## Matching Configuration

### Match Mode Settings

Configuration file: `config/match-mode.json`

```json
{
  "topN": 5,
  "minFitIndex": 0.6,
  "expiryHours": 168,
  "maxSuggestionsPerUser": 10
}
```

**Parameters**:
- `topN`: Number of top matches to show each user (default: 5)
- `minFitIndex`: Minimum compatibility score threshold (0.0-1.0, default: 0.6)
- `expiryHours`: How long suggestions remain valid (default: 168 = 7 days)
- `maxSuggestionsPerUser`: Maximum active suggestions per user (default: 10)

### Matching Weights

The algorithm uses weighted scoring. Default weights are in `lib/matching/scoring.ts`:

- **Vector Similarity**: 40% - Overall lifestyle compatibility
- **Schedule Overlap**: 25% - Sleep and activity schedules
- **Cleanliness Alignment**: 20% - Cleaning preferences
- **Social Alignment**: 15% - Guests, noise, parties

## Troubleshooting

### Issue: Cron Job Not Running

**Symptoms**:
- No new matches appearing
- Cron execution history shows failures

**Diagnosis**:
1. Check Vercel Cron Jobs dashboard
2. Verify `CRON_SECRET` is set correctly
3. Check endpoint logs for errors
4. Verify cron schedule in `vercel.json`

**Resolution**:
1. Ensure `CRON_SECRET` matches in Vercel environment variables
2. Check Authorization header format: `Bearer YOUR_SECRET`
3. Verify cron schedule syntax is correct
4. Manually trigger via admin panel to test

### Issue: No Matches Generated

**Symptoms**:
- Cron runs successfully but creates 0 matches
- Users reporting no suggestions

**Diagnosis**:
1. Check if users have completed onboarding
2. Verify user vectors exist: `SELECT COUNT(*) FROM user_vectors`
3. Check if users are active: `SELECT COUNT(*) FROM users WHERE is_active = true`
4. Review matching logs for filtering issues

**Resolution**:
1. Ensure users have completed questionnaire
2. Run vector generation: `POST /api/admin/backfill-vectors`
3. Check cohort filters aren't too restrictive
4. Verify minimum compatibility threshold isn't too high

### Issue: Matching Takes Too Long

**Symptoms**:
- Cron job times out (>5 minutes)
- Vercel function timeout errors

**Diagnosis**:
1. Check number of active users
2. Review matching algorithm performance
3. Check database query performance

**Resolution**:
1. Optimize database indexes on `user_vectors`, `profiles`, `responses`
2. Consider running matching in batches
3. Increase Vercel function timeout (max: 300s)
4. Filter by university/cohort to reduce candidate pool

### Issue: Low Quality Matches

**Symptoms**:
- Users reporting poor compatibility
- Low acceptance rates

**Diagnosis**:
1. Review matching weights
2. Check if deal-breakers are being enforced
3. Verify vector generation is working correctly

**Resolution**:
1. Adjust weights in `lib/matching/scoring.ts`
2. Review deal-breaker logic in `lib/matching/dealbreakers.ts`
3. Ensure questionnaire responses are being mapped correctly
4. Consider lowering `minFitIndex` threshold

## Performance Optimization

### Database Indexes

Ensure these indexes exist for optimal performance:

```sql
-- User vectors lookup
CREATE INDEX IF NOT EXISTS idx_user_vectors_user_id ON user_vectors(user_id);

-- Active users filter
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

-- Match suggestions lookup
CREATE INDEX IF NOT EXISTS idx_match_suggestions_status ON match_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_match_suggestions_expires ON match_suggestions(expires_at);
```

### Batch Processing

For large user bases (>1000 users), consider:

1. **University-based batching**: Run matching per university
2. **Time-based batching**: Process different cohorts at different times
3. **Priority queuing**: Prioritize new users or users with expiring matches

## Monitoring & Analytics

### Key Metrics to Track

1. **Matching Run Success Rate**: % of successful cron executions
2. **Matches Created**: Average matches per run
3. **Match Acceptance Rate**: % of matches accepted by users
4. **Average Compatibility Score**: Mean score of created matches
5. **Processing Time**: Duration of matching runs

### Logging

The matching system logs important events:

- `[Cron] Starting scheduled matching run` - Cron job started
- `[Matching] Found X candidates` - Candidates loaded
- `[Matching] Successfully created X matches` - Matches persisted
- `[Cron] Notifications created` - Notifications sent

Check logs in:
- Vercel function logs
- Application monitoring (Sentry)
- Database audit logs (`admin_actions` table)

## Best Practices

1. **Schedule Frequency**: 
   - Start with every 6 hours
   - Adjust based on user growth and activity
   - More frequent = fresher matches, but higher compute cost

2. **Cohort Filtering**:
   - Use university-based cohorts for better relevance
   - Consider program/degree level filtering
   - Don't filter too aggressively (reduces match pool)

3. **Threshold Tuning**:
   - Start with `minFitIndex: 0.6`
   - Monitor acceptance rates
   - Adjust based on user feedback

4. **Deal-Breaker Enforcement**:
   - Always enforce critical deal-breakers (smoking, pets)
   - Consider soft deal-breakers (noise tolerance)
   - Review deal-breaker logic regularly

5. **Notification Timing**:
   - Send notifications immediately after matching
   - Consider user timezone for optimal engagement
   - Don't spam users with too many notifications

## Related Documentation

- [Admin Panel Guide](./admin-guide.md) - Manual matching triggers
- [Real Data Integration](./REAL_DATA_INTEGRATION.md) - Database architecture
- [Runbooks](./runbooks.md) - Operational troubleshooting

