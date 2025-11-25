import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 60 requests per minute per user
    const rateLimitKey = getUserRateLimitKey('api', user.id)
    const rateLimitResult = await checkRateLimit('api', rateLimitKey)
    
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

    // Get user's chat memberships with last read times
    const { data: memberships, error: membershipsError } = await supabase
      .from('chat_members')
      .select(`
        chat_id,
        last_read_at,
        chats!inner(
          id,
          updated_at
        )
      `)
      .eq('user_id', user.id)

    if (membershipsError) {
      safeLogger.error('Failed to fetch chat memberships', membershipsError)
      return NextResponse.json({ error: 'Failed to fetch chat memberships' }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        total_unread: 0,
        chat_counts: []
      }, { status: 200 })
    }

    // Optimize: Use a single aggregated query instead of O(n) queries
    // Get all chat IDs and their last_read_at times
    const chatIds = memberships.map(m => m.chat_id)
    const lastReadMap = new Map(memberships.map(m => [m.chat_id, m.last_read_at || new Date(0).toISOString()]))

    // Fetch all unread messages for all chats in one query
    // Only fetch messages NOT sent by the current user (exclude user's own messages)
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select('chat_id, created_at, user_id')
      .in('chat_id', chatIds)
      .neq('user_id', user.id) // Exclude messages sent by the current user

    if (messagesError) {
      safeLogger.error('Failed to fetch unread messages', messagesError)
      return NextResponse.json({ error: 'Failed to fetch unread messages' }, { status: 500 })
    }

    // Aggregate unread counts per chat
    const unreadCountsMap = new Map<string, number>()
    
    // Initialize all chats with 0 unread
    chatIds.forEach(chatId => {
      unreadCountsMap.set(chatId, 0)
    })

    // Count unread messages (messages created after last_read_at)
    // Only count messages from OTHER users (already filtered in query, but double-check for safety)
    unreadMessages?.forEach(msg => {
      // Skip messages sent by the current user (shouldn't happen due to query filter, but safety check)
      if (msg.user_id === user.id) {
        return
      }
      
      const lastReadAt = lastReadMap.get(msg.chat_id) || new Date(0).toISOString()
      if (new Date(msg.created_at) > new Date(lastReadAt)) {
        unreadCountsMap.set(msg.chat_id, (unreadCountsMap.get(msg.chat_id) || 0) + 1)
      }
    })

    // Convert to array format
    const unreadCounts = Array.from(unreadCountsMap.entries()).map(([chat_id, unread_count]) => ({
      chat_id,
      unread_count
    }))

    // Calculate total unread count
    const totalUnread = unreadCounts.reduce((sum, chat) => sum + chat.unread_count, 0)

    return NextResponse.json({
      total_unread: totalUnread,
      chat_counts: unreadCounts
    }, { status: 200 })

  } catch (error) {
    safeLogger.error('Unread count error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
