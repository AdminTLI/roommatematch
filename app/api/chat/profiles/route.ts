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

    const { userIds, chatId } = await request.json()
    
    // Require chatId - no fallback path
    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 })
    }
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    // Limit to max 10 userIds per request
    if (userIds.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 userIds per request' }, { status: 400 })
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

    // Verify all requested userIds are members of this chat
    const { data: chatMembers, error: chatMembersError } = await supabase
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chatId)
      .in('user_id', userIds)

    if (chatMembersError) {
      safeLogger.error('Failed to fetch chat members', chatMembersError)
      return NextResponse.json({ error: 'Failed to verify chat members' }, { status: 500 })
    }

    const allowedUserIds = new Set(chatMembers?.map(m => m.user_id) || [])
    const invalidUserIds = userIds.filter(id => !allowedUserIds.has(id))
    
    if (invalidUserIds.length > 0) {
      return NextResponse.json(
        { error: `User IDs not in chat: ${invalidUserIds.length} invalid` },
        { status: 403 }
      )
    }

    // Use admin client to fetch profiles (bypasses RLS)
    // At this point, we've verified all userIds are authorized members of the chat
    const admin = await createAdminClient()
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIds)

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
