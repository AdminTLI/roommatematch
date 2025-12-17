# Running Migration and Testing Guide

## Step 1: Run Database Migration

### Option A: Using Supabase SQL Editor (Recommended for Production)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Migration**
   - Open the file: `db/migrations/112_add_performance_indexes.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify Indexes Were Created**
   Run this query to verify all indexes were created:

```sql
-- Verify all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname LIKE 'idx_%'
    AND indexname IN (
        'idx_match_suggestions_user_status',
        'idx_match_suggestions_member_ids_gin',
        'idx_match_suggestions_status_created',
        'idx_messages_chat_created',
        'idx_messages_user_created',
        'idx_chat_members_user_chat',
        'idx_chat_members_chat_id',
        'idx_profiles_user_id',
        'idx_profiles_university_id',
        'idx_message_reads_message_user',
        'idx_message_reads_user_id'
    )
ORDER BY tablename, indexname;
```

**Expected Result**: You should see 11 indexes listed.

### Option B: Using Supabase CLI (For Local Development)

```bash
# If using Supabase CLI locally
supabase db push
```

This will run all migrations including the new one.

---

## Step 2: Testing Checklist

### Quick Smoke Tests

Run these tests to verify everything works:

#### 1. Test Match Pagination

```bash
# Test with a real user ID (replace USER_ID with actual user ID)
curl -X GET "http://localhost:3000/api/match/suggestions/my?limit=10&offset=0" \
  -H "Cookie: your-auth-cookie"
```

**Expected**: Returns JSON with `suggestions` array and `pagination` object with `has_more`, `total`, etc.

#### 2. Test Chat Pagination

1. Open a chat with messages
2. Verify only last 50 messages load initially
3. Click "Load Older Messages" button
4. Verify older messages load and button works

#### 3. Test Admin Middleware

```bash
# As non-admin user, try accessing admin route
curl -X GET "http://localhost:3000/admin" \
  -H "Cookie: your-auth-cookie"
```

**Expected**: Redirects to `/dashboard` (status 307/308)

#### 4. Test Profile Validation

```bash
# Test with invalid data
curl -X POST "http://localhost:3000/api/settings/profile" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"firstName": "", "phone": "invalid"}'
```

**Expected**: Returns 400 with validation error messages

#### 5. Test User-Friendly Errors

```bash
# Test unauthorized access
curl -X GET "http://localhost:3000/api/match/suggestions/my"
```

**Expected**: Returns 401 with user-friendly error message (not technical error)

---

## Step 3: Manual Testing Script

### Test Match Pagination

1. **Sign in** as a test user
2. **Navigate to** `/matches`
3. **Verify**:
   - [ ] Matches load (if any exist)
   - [ ] "Load More" button appears if there are more than 20 matches
   - [ ] Clicking "Load More" loads next batch
   - [ ] Button disappears when all matches are loaded
   - [ ] Empty state shows if no matches

### Test Chat Pagination

1. **Open a chat** with many messages (50+)
2. **Verify**:
   - [ ] Only last 50 messages load initially
   - [ ] "Load Older Messages" button appears at top
   - [ ] Clicking button loads older messages
   - [ ] Scroll position is maintained
   - [ ] New messages still scroll to bottom

### Test Message Search

1. **Open a chat** with messages
2. **Press** `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
3. **Verify**:
   - [ ] Search dialog opens
   - [ ] Type a search query
   - [ ] Results appear with highlighted text
   - [ ] Use ↑↓ arrows to navigate
   - [ ] Press Enter to select a message
   - [ ] Message scrolls into view and highlights

### Test Mobile Responsiveness

1. **Open browser DevTools** (F12)
2. **Toggle device toolbar** (Cmd/Ctrl + Shift + M)
3. **Test on**:
   - iPhone SE (375px)
   - iPhone 14 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)
4. **Verify**:
   - [ ] Chat interface is usable on all sizes
   - [ ] Message bubbles don't overflow
   - [ ] Input area is accessible
   - [ ] Buttons are at least 44x44px on mobile
   - [ ] No horizontal scrolling

### Test Admin Protection

1. **Sign in** as a regular user (not admin)
2. **Try to access** `/admin` or `/admin/users`
3. **Verify**:
   - [ ] Redirected to `/dashboard`
   - [ ] No error page shown
4. **Sign in** as admin user
5. **Access** `/admin`
6. **Verify**:
   - [ ] Admin dashboard loads
   - [ ] No redirect

### Test Error Messages

1. **Test various error scenarios**:
   - [ ] Sign in with wrong password → Friendly error
   - [ ] Access protected route without auth → Friendly error
   - [ ] Send message to closed chat → Friendly error
   - [ ] Rate limit exceeded → Shows retry time
   - [ ] Network error → Friendly message

### Test Loading States

1. **Open chat** (slow network in DevTools)
2. **Verify**:
   - [ ] Loading skeletons appear
   - [ ] Skeletons match message layout
   - [ ] No flash of empty content

### Test Empty States

1. **Create new user** (no matches yet)
2. **Navigate to** `/matches`
3. **Verify**:
   - [ ] Empty state component shows
   - [ ] Shows "Complete Questionnaire" if not done
   - [ ] Shows "Refresh Matches" if done
   - [ ] Responsive on mobile

---

## Step 4: Performance Verification

### Check Index Usage

Run this query to verify indexes are being used:

```sql
-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
    AND schemaname = 'public'
ORDER BY idx_scan DESC;
```

**Expected**: Indexes should show scan counts after queries run.

### Test Query Performance

```sql
-- Test match suggestions query performance
EXPLAIN ANALYZE
SELECT * FROM match_suggestions
WHERE 'user-id-here' = ANY(member_ids)
ORDER BY created_at DESC
LIMIT 20;
```

**Expected**: Should use `idx_match_suggestions_member_ids_gin` index.

```sql
-- Test messages query performance
EXPLAIN ANALYZE
SELECT * FROM messages
WHERE chat_id = 'chat-id-here'
ORDER BY created_at DESC
LIMIT 50;
```

**Expected**: Should use `idx_messages_chat_created` index.

---

## Step 5: Automated Verification Script

Create a simple test script to verify everything:

```bash
# Create test-verification.sh
cat > test-verification.sh << 'EOF'
#!/bin/bash

echo "🧪 Running Verification Tests..."
echo ""

# Check if indexes exist
echo "1. Checking database indexes..."
# (Run the SQL query from Step 1 to verify)

# Check if API endpoints respond
echo "2. Testing API endpoints..."
# Add curl tests here

# Check if build succeeds
echo "3. Testing build..."
npm run build

echo ""
echo "✅ Verification complete!"
EOF

chmod +x test-verification.sh
./test-verification.sh
```

---

## Step 6: Browser Console Checks

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Verify**:
   - [ ] No `console.log` statements in production build
   - [ ] Only `safeLogger` messages appear
   - [ ] No TypeScript errors
   - [ ] No React errors

---

## Common Issues & Solutions

### Issue: Indexes already exist
**Solution**: The migration uses `CREATE INDEX IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: GIN index fails
**Solution**: Ensure `pgvector` extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: Migration takes too long
**Solution**: Indexes are created in the background. Large tables may take a few minutes.

### Issue: "Load More" button doesn't appear
**Solution**: Check browser console for errors. Verify pagination metadata is returned from API.

---

## Next Steps

After verifying everything works:

1. ✅ Run the migration in **production** Supabase
2. ✅ Test all features in **production** environment
3. ✅ Monitor error logs (Sentry)
4. ✅ Check performance metrics
5. ✅ Verify rate limiting is working (check Upstash Redis)

---

## Quick Reference

### Migration File Location
```
db/migrations/112_add_performance_indexes.sql
```

### Key Files Changed
- `app/api/match/suggestions/my/route.ts` - Added pagination
- `app/chat/[roomId]/components/chat-interface.tsx` - Added message pagination
- `middleware.ts` - Added admin protection
- `lib/errors/user-friendly-messages.ts` - Error mapping
- `db/migrations/112_add_performance_indexes.sql` - Performance indexes

### Environment Variables to Verify
- `UPSTASH_REDIS_REST_URL` - Required for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Required for rate limiting
- `ADMIN_SHARED_SECRET` - Required for admin routes










