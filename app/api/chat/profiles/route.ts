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
    
    // Normalize input: support both single chatId and array of chatIds, ensuring strings
    let chatIdsToProcess: string[] = []
    if (Array.isArray(chatIds)) {
      chatIdsToProcess = chatIds.map((id: any) => String(id)).filter((id) => id != null && id !== '')
    } else if (typeof chatId === 'string') {
      chatIdsToProcess = [chatId]
    } else if (typeof chatId === 'number') {
      chatIdsToProcess = [String(chatId)]
    } else {
      chatIdsToProcess = []
    }
    
    if (!chatIdsToProcess || chatIdsToProcess.length === 0) {
      return NextResponse.json({ error: 'chatId or chatIds is required' }, { status: 400 })
    }

    // Limit batch size to prevent abuse
    if (chatIdsToProcess.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 chatIds allowed per request' }, { status: 400 })
    }

    // Verify user is a member of requested chats - return profiles only for chats they're a member of
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
    const authorizedChatIds = chatIdsToProcess.filter(id => userChatIds.has(id))
    
    // If user is not a member of any requested chats, return empty profiles (not 403)
    if (authorizedChatIds.length === 0) {
      safeLogger.warn('User not a member of any requested chats', {
        userId: user.id,
        requestedChatIds: chatIdsToProcess
      })
      return NextResponse.json({ profiles: [] })
    }

    // Log if some chats were filtered out
    if (authorizedChatIds.length < chatIdsToProcess.length) {
      const unauthorizedChats = chatIdsToProcess.filter(id => !userChatIds.has(id))
      safeLogger.warn('User not a member of some requested chats, returning profiles for authorized chats only', {
        userId: user.id,
        authorizedChatIds,
        unauthorizedChatIds
      })
    }

    // Fetch all chat members for authorized chats only (prevents client-controlled enumeration)
    const admin = await createAdminClient()
    const { data: chatMembers, error: chatMembersError } = await admin
        .from('chat_members')
        .select('chat_id, user_id')
        .in('chat_id', authorizedChatIds)

    if (chatMembersError) {
      safeLogger.error('Failed to fetch chat members', chatMembersError)
      return NextResponse.json({ error: 'Failed to fetch chat members' }, { status: 500 })
    }

    if (!chatMembers || chatMembers.length === 0) {
      return NextResponse.json({ profiles: [] })
    }

    // Get all unique user IDs (cap to max 200 total members across all chats)
    const allUserIds = [...new Set(chatMembers.slice(0, 200).map(m => m.user_id))]

    // Get user's blocklist to exclude profiles they have blocked from their own view
    // and to anonymize the name of users who have blocked the current user.
    const { data: blocklist, error: blocklistError } = await admin
      .from('match_blocklist')
      .select('user_id, blocked_user_id')
      .in('user_id', [user.id, ...allUserIds])

    const blockedByCurrentUser = new Set(
      (blocklist || [])
        .filter(b => b.user_id === user.id)
        .map(b => b.blocked_user_id)
    )

    const blockedCurrentUser = new Set(
      (blocklist || [])
        .filter(b => b.blocked_user_id === user.id)
        .map(b => b.user_id)
    )

    // Filter out profiles the current user has blocked (they don't need to see them)
    const allowedUserIds = allUserIds.filter(id => !blockedByCurrentUser.has(id))

    // Fetch profiles for all allowed chat members
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', allowedUserIds.length > 0 ? allowedUserIds : [])

    if (profilesError) {
      // If not found, return empty profiles gracefully
      const isNotFound = (profilesError as any)?.status === 404 ||
        (typeof (profilesError as any)?.message === 'string' && (profilesError as any).message.toLowerCase().includes('not found'))
      if (isNotFound) {
        safeLogger.warn('Profiles not found for given user IDs; returning empty list', {
          userId: user.id,
          requestedIds: allowedUserIds
        })
        return NextResponse.json({ profiles: [] })
      }
      safeLogger.error('Failed to fetch profiles', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    // Post-process profiles:
    // - For users who have blocked the current user, anonymize their name to "User"
    const safeProfiles = (profiles || []).map((profile: any) => {
      if (blockedCurrentUser.has(profile.user_id)) {
        return {
          ...profile,
          first_name: 'User',
          last_name: ''
        }
      }
      return profile
    })

    return NextResponse.json({ 
      profiles: safeProfiles
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
