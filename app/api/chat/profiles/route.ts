import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 60 requests per minute per user
    const rateLimitKey = getUserRateLimitKey('chat_profiles', user.id)
    const rateLimitResult = await checkRateLimit('chat_profiles', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const { chatId } = await request.json()
    
    // Require chatId only - no userIds parameter to prevent enumeration
    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
    }

    // Verify user is a member of this chat
    const { data: membership, error: membershipError } = await supabase
        .from('chat_members')
        .select('id')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (membershipError) {
      safeLogger.error('Failed to check chat membership', membershipError)
      return NextResponse.json({ error: 'Failed to verify chat membership' }, { status: 500 })
    }

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    // Fetch all chat members server-side (prevents client-controlled enumeration)
    const admin = await createAdminClient()
    const { data: chatMembers, error: chatMembersError } = await admin
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', chatId)

    if (chatMembersError) {
      safeLogger.error('Failed to fetch chat members', chatMembersError)
      return NextResponse.json({ error: 'Failed to fetch chat members' }, { status: 500 })
    }

    if (!chatMembers || chatMembers.length === 0) {
      return NextResponse.json({ profiles: [] })
    }

    // Cap to max 10 members per chat (security limit)
    const memberUserIds = chatMembers.slice(0, 10).map(m => m.user_id)

    // Fetch profiles for chat members only
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', memberUserIds)

    if (profilesError) {
      safeLogger.error('Failed to fetch profiles', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      profiles: profiles || [],
      // Include rate limit headers
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': (rateLimitResult.remaining - 1).toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
      }
    })
  } catch (error) {
    safeLogger.error('Error fetching chat profiles', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
