import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 30 requests per minute per user
    // Wrap rate limiting in try-catch to prevent failures from blocking the request
    let rateLimitResult
    try {
      const rateLimitKey = getUserRateLimitKey('chat_online_users', user.id)
      rateLimitResult = await checkRateLimit('chat_online_users', rateLimitKey)
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Too many requests',
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': '30',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }
    } catch (rateLimitError) {
      // If rate limiting fails, log but continue (fail-open behavior)
      safeLogger.error('Rate limiting check failed, continuing without rate limit', rateLimitError)
      // Set a default rate limit result to avoid errors later
      rateLimitResult = {
        allowed: true,
        remaining: 30,
        resetTime: Date.now() + 60 * 1000,
        totalHits: 0
      }
    }

    // Get user's chat memberships to find users they chat with
    const { data: memberships, error: membershipError } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id)

    if (membershipError) {
      safeLogger.error('Failed to fetch chat memberships', membershipError)
      return NextResponse.json({ error: 'Failed to fetch chat memberships' }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ users: [] })
    }

    const chatIds = memberships.map(m => m.chat_id)

    // Get all other users in these chats
    const admin = await createAdminClient()
    const { data: chatMembers, error: chatMembersError } = await admin
      .from('chat_members')
      .select('user_id, chat_id')
      .in('chat_id', chatIds)
      .neq('user_id', user.id)

    if (chatMembersError) {
      safeLogger.error('Failed to fetch chat members', chatMembersError)
      return NextResponse.json({ error: 'Failed to fetch chat members' }, { status: 500 })
    }

    if (!chatMembers || chatMembers.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Get unique user IDs
    const otherUserIds = [...new Set(chatMembers.map(m => m.user_id))]

    if (otherUserIds.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Get users who have sent messages in the last 15 minutes (more reliable than user_journey_events)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const { data: recentMessages, error: messagesError } = await admin
      .from('messages')
      .select('user_id')
      .in('user_id', otherUserIds)
      .gte('created_at', fifteenMinutesAgo.toISOString())
      .neq('content', "You're matched! Start your conversation 👋") // Exclude system messages

    if (messagesError) {
      safeLogger.error('Failed to fetch recent messages', messagesError)
      // Fallback: return empty list instead of error
      return NextResponse.json({ users: [] })
    }

    // Get unique active user IDs from recent messages
    const activeUserIds = [...new Set(recentMessages?.map(m => m.user_id) || [])]

    if (activeUserIds.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Get user's blocklist to exclude blocked users
    // Handle blocklist query errors gracefully - if it fails, just don't filter blocked users
    let blockedUserIds = new Set<string>()
    try {
      const { data: blocklist, error: blocklistError } = await admin
        .from('match_blocklist')
        .select('blocked_user_id')
        .eq('user_id', user.id)

      if (!blocklistError && blocklist) {
        blockedUserIds = new Set(blocklist.map(b => b.blocked_user_id) || [])
      }
    } catch (blocklistErr) {
      // If blocklist query fails, log but continue without filtering blocked users
      safeLogger.error('Failed to fetch blocklist, continuing without blocklist filter', blocklistErr)
    }

    // Filter out blocked users
    const allowedUserIds = activeUserIds.filter(id => !blockedUserIds.has(id))

    if (allowedUserIds.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Fetch profiles for active users
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', allowedUserIds)

    if (profilesError) {
      safeLogger.error('Failed to fetch profiles', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // Format response with first name only
    const users = (profiles || []).map((profile: any) => ({
      id: profile.user_id,
      firstName: profile.first_name?.trim() || 'User',
      avatar: undefined // Can be extended later if avatars are stored
    }))

    return NextResponse.json({ 
      users: users
    }, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': (rateLimitResult?.remaining ?? 30).toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult?.resetTime ?? Date.now() + 60 * 1000).toISOString()
      }
    })
  } catch (error) {
    safeLogger.error('Error fetching online users', error)
    return NextResponse.json(
      { error: 'Failed to fetch online users' },
      { status: 500 }
    )
  }
}
