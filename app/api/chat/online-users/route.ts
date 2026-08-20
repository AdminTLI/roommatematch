import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'

export type PresenceTier = 'online' | 'recent'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 30 requests per minute per user
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
      safeLogger.error('Rate limiting check failed, continuing without rate limit', rateLimitError)
      rateLimitResult = {
        allowed: true,
        remaining: 30,
        resetTime: Date.now() + 60 * 1000,
        totalHits: 0
      }
    }

    const { data: memberships, error: membershipError } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id)

    if (membershipError) {
      safeLogger.error('Failed to fetch chat memberships', membershipError)
      return NextResponse.json({ error: 'Failed to fetch chat memberships' }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ users: [], activeTodayCount: 0 })
    }

    const chatIds = memberships.map(m => m.chat_id)

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
      return NextResponse.json({ users: [], activeTodayCount: 0 })
    }

    const otherUserIds = [...new Set(chatMembers.map(m => m.user_id))]

    if (otherUserIds.length === 0) {
      return NextResponse.json({ users: [], activeTodayCount: 0 })
    }

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
      safeLogger.error('Failed to fetch blocklist, continuing without blocklist filter', blocklistErr)
    }

    const allowedPartnerIds = otherUserIds.filter(id => !blockedUserIds.has(id))
    if (allowedPartnerIds.length === 0) {
      return NextResponse.json({ users: [], activeTodayCount: 0 })
    }

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

    const { data: recentMessages, error: messagesError } = await admin
      .from('messages')
      .select('user_id, created_at')
      .in('user_id', allowedPartnerIds)
      .gte('created_at', startOfToday.toISOString())
      .neq('content', "You're matched! Start your conversation 👋")

    if (messagesError) {
      safeLogger.error('Failed to fetch recent messages', messagesError)
      return NextResponse.json({ users: [], activeTodayCount: 0 })
    }

    const latestByUser = new Map<string, Date>()
    for (const row of recentMessages || []) {
      const ts = new Date(row.created_at)
      const prev = latestByUser.get(row.user_id)
      if (!prev || ts > prev) latestByUser.set(row.user_id, ts)
    }

    const activeTodayCount = latestByUser.size

    const presenceRows: { id: string; tier: PresenceTier; at: Date }[] = []
    for (const [id, at] of latestByUser) {
      if (at >= fifteenMinutesAgo) {
        presenceRows.push({ id, tier: 'online', at })
      } else if (at >= threeHoursAgo) {
        presenceRows.push({ id, tier: 'recent', at })
      }
    }

    presenceRows.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === 'online' ? -1 : 1
      return b.at.getTime() - a.at.getTime()
    })

    const presenceIds = presenceRows.map(r => r.id)
    if (presenceIds.length === 0) {
      return NextResponse.json({ users: [], activeTodayCount })
    }

    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_id')
      .in('user_id', presenceIds)

    if (profilesError) {
      safeLogger.error('Failed to fetch profiles', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]))
    const users = presenceRows
      .map(row => {
        const profile = profileMap.get(row.id)
        if (!profile) return null
        return {
          id: profile.user_id,
          firstName: profile.first_name?.trim() || 'User',
          avatar: programmaticAvatarUrl(profile.avatar_id, profile.user_id),
          presence: row.tier as PresenceTier,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ 
      users,
      activeTodayCount,
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
