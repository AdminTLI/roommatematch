# Real Data Integration - Roommate Match

This document describes the transition from mock data to real Supabase integration with live database operations.

## Overview

The Roommate Match platform has been fully integrated with Supabase for real-time data operations, replacing all mock data with live database queries, RPC functions, and real-time subscriptions.

## Database Architecture

### Core Tables

#### User Management
- `profiles` - User profile information
- `user_academic` - Academic information (university, programme, study year)
- `user_vectors` - Compatibility vectors for matching algorithm
- `verifications` - ID verification documents and status

#### Matching System
- `match_decisions` - User accept/reject decisions
- `groups` - Group matching entities
- `group_members` - Group membership relationships

#### Communication
- `chat_rooms` - Chat room entities
- `chat_room_participants` - Room membership
- `chat_messages` - Real-time chat messages

#### Community
- `forum_posts` - Community forum posts
- `forum_likes` - Post likes and engagement
- `reports` - User reporting system

#### Administration
- `admins` - Admin user roles and permissions
- `universities` - University data
- `programs` - Academic programmes

### RPC Functions

#### Matching Engine Functions

**`compute_compatibility_score(user_a_id, user_b_id)`**
- Computes compatibility score between two users
- Returns detailed breakdown including academic affinity
- Implements the full matching algorithm with weights

**`get_user_matches(user_id, filters...)`**
- Retrieves compatible matches for a user
- Supports filtering by university, degree level, programme, study year
- Returns formatted match data with compatibility scores

**`get_group_matches(user_id, limit, offset)`**
- Finds compatible group matches
- Returns group suggestions with member compatibility

**`get_admin_analytics(admin_university_id)`**
- Provides comprehensive analytics for admin dashboard
- Includes user statistics, programme distribution, study year breakdown

## Real-Time Features

### Chat System
- **Supabase Realtime** for instant message delivery
- **Presence tracking** for online/offline status
- **Typing indicators** using real-time subscriptions
- **Read receipts** with database updates

### Live Updates
- **Match notifications** when new compatible users join
- **Forum post updates** in real-time
- **Admin notifications** for pending reports

## Security & Privacy

### Row Level Security (RLS)
All tables implement comprehensive RLS policies:
- Users can only access their own data
- Admins have scoped access to their university
- Service role has full access for processing

### Data Protection
- **Encrypted storage** for verification documents
- **Secure file uploads** with size and type restrictions
- **Privacy-first design** with minimal data collection

## API Integration

### Supabase Client Usage
```typescript
// Real-time subscription example
const subscription = supabase
  .channel(`chat:${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe()

// RPC function call example
const { data, error } = await supabase.rpc('get_user_matches', {
  p_user_id: user.id,
  p_limit: 20,
  p_university_ids: selectedUniversities
})
```

### Error Handling
- **Graceful fallbacks** to cached data when network fails
- **User-friendly error messages** for common issues
- **Retry mechanisms** for transient failures

## Performance Optimizations

### Database Indexes
- **Composite indexes** on frequently queried columns
- **Partial indexes** for filtered queries
- **Vector indexes** for similarity search

### Caching Strategy
- **TanStack Query** for client-side caching
- **Database query optimization** with proper joins
- **Pagination** for large datasets

## Testing Strategy

### Integration Tests
- **Real database operations** in test environment
- **End-to-end user journeys** with live data
- **Error scenario testing** with network failures

### Data Validation
- **Zod schemas** for type safety
- **Database constraints** for data integrity
- **Input sanitization** for security

## Deployment Considerations

### Environment Setup
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional for programme imports
SKDB_API_BASE=https://api.studiekeuzedatabase.nl
SKDB_API_KEY=your_api_key
```

### Database Migrations
```bash
# Run migrations in order
pnpm db:push

# Seed initial data
pnpm db:seed

# Import programmes
pnpm import:programs
```

### Storage Configuration
- **Verification documents bucket** with 10MB limit
- **Image optimization** for profile pictures
- **Secure file access** with RLS policies

## Monitoring & Analytics

### Application Events
- **User actions** tracked in `app_events` table
- **Performance metrics** for optimization
- **Error tracking** for debugging

### Admin Analytics
- **Real-time dashboard** with live data
- **University-specific metrics** for admins
- **Moderation queue** for content review

## Migration from Mock Data

### Completed Transitions
✅ **Matches Interface** - Real RPC calls with filtering
✅ **Chat System** - Live messaging with real-time updates
✅ **Admin Dashboard** - Live analytics and moderation
✅ **Forum** - Real posts with moderation queue
✅ **Verification** - Secure document upload and processing
✅ **Academic Features** - Live programme data integration

### Data Flow
1. **User Registration** → Profile creation with academic data
2. **Onboarding** → Questionnaire responses stored as vectors
3. **Matching** → RPC functions compute compatibility scores
4. **Communication** → Real-time chat with presence tracking
5. **Community** → Forum posts with moderation workflow
6. **Administration** → Live analytics and user management

## Troubleshooting

### Common Issues

**RPC Function Errors**
```sql
-- Check function permissions
GRANT EXECUTE ON FUNCTION compute_compatibility_score TO authenticated;

-- Verify function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'compute_compatibility_score';
```

**Real-time Subscription Issues**
```typescript
// Check channel subscription status
const channel = supabase.channel('test')
channel.subscribe((status) => {
  console.log('Channel status:', status)
})
```

**Storage Upload Failures**
```sql
-- Verify bucket exists and has correct policies
SELECT * FROM storage.buckets WHERE id = 'verification-documents';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Performance Issues

**Slow Query Performance**
- Check database indexes are being used
- Monitor query execution plans
- Consider query optimization or caching

**Real-time Lag**
- Verify network connectivity
- Check Supabase service status
- Monitor subscription health

## Future Enhancements

### Planned Features
- **Advanced matching algorithms** with machine learning
- **Video verification** for enhanced security
- **Mobile app** with offline capabilities
- **Analytics dashboard** for universities

### Scalability Considerations
- **Database sharding** for large user bases
- **CDN integration** for global performance
- **Microservices architecture** for complex features
- **Caching layers** for improved response times

## Support

For technical support or questions about the real data integration:

1. **Check the logs** in Supabase dashboard
2. **Review RLS policies** for permission issues
3. **Test RPC functions** directly in SQL editor
4. **Monitor real-time subscriptions** in network tab
5. **Verify environment variables** are correctly set

The platform now operates entirely with real data, providing a production-ready experience for users while maintaining security, performance, and scalability.
