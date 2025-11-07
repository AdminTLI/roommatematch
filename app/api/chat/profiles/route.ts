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

    const { chatId, chatIds } = await request.json()
    
    // Support both single chatId and array of chatIds for batch requests
    const chatIdsToProcess = chatIds || (chatId ? [chatId] : [])
    
    if (!chatIdsToProcess || chatIdsToProcess.length === 0) {
      return NextResponse.json({ error: 'chatId or chatIds is required' }, { status: 400 })
    }

    // Limit batch size to prevent abuse
    if (chatIdsToProcess.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 chatIds allowed per request' }, { status: 400 })
    }

    // Verify user is a member of all requested chats
    const { data: memberships, error: membershipError } = await supabase
        .from('chat_members')
        .select('chat_id')
        .in('chat_id', chatIdsToProcess)
        .eq('user_id', user.id)

    if (membershipError) {
      safeLogger.error('Failed to check chat membership', membershipError)
      return NextResponse.json({ error: 'Failed to verify chat membership' }, { status: 500 })
    }

    const userChatIds = new Set(memberships?.map(m => m.chat_id) || [])
    const unauthorizedChats = chatIdsToProcess.filter(id => !userChatIds.has(id))
    
    if (unauthorizedChats.length > 0) {
      return NextResponse.json({ 
        error: 'Not a member of some chats',
        unauthorizedChats 
      }, { status: 403 })
    }

    // Fetch all chat members for all requested chats server-side (prevents client-controlled enumeration)
    const admin = await createAdminClient()
    const { data: chatMembers, error: chatMembersError } = await admin
        .from('chat_members')
        .select('chat_id, user_id')
        .in('chat_id', chatIdsToProcess)

    if (chatMembersError) {
      safeLogger.error('Failed to fetch chat members', chatMembersError)
      return NextResponse.json({ error: 'Failed to fetch chat members' }, { status: 500 })
    }

    if (!chatMembers || chatMembers.length === 0) {
      return NextResponse.json({ profiles: [] })
    }

    // Get all unique user IDs (cap to max 200 total members across all chats)
    const allUserIds = [...new Set(chatMembers.slice(0, 200).map(m => m.user_id))]

    // Fetch profiles for all chat members
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', allUserIds)

    if (profilesError) {
      safeLogger.error('Failed to fetch profiles', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      profiles: profiles || []
    }, {
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
