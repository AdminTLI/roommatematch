import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> | { chatId: string } }
) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const resolvedParams = await Promise.resolve(params)
    const { chatId } = resolvedParams
    
    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId parameter required' },
        { status: 400 }
      )
    }
    const admin = await createAdminClient()

    // Fetch all messages for this chat
    const { data: messages, error: messagesError } = await admin
      .from('messages')
      .select(`
        id,
        user_id,
        content,
        created_at
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      safeLogger.error('[Admin] Failed to fetch messages', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Fetch user profiles and emails for all message senders
    const userIds = new Set<string>()
    messages?.forEach((msg: any) => {
      userIds.add(msg.user_id)
    })

    const userIdsArray = Array.from(userIds)
    
    // Fetch profiles
    const profilesMap = new Map()
    if (userIdsArray.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIdsArray)
      
      profiles?.forEach((profile: any) => {
        profilesMap.set(profile.user_id, profile)
      })
    }

    // Fetch users for emails
    const usersMap = new Map()
    if (userIdsArray.length > 0) {
      const { data: users } = await admin
        .from('users')
        .select('id, email')
        .in('id', userIdsArray)
      
      users?.forEach((user: any) => {
        usersMap.set(user.id, user)
      })
    }

    // Enrich messages with user info
    const enrichedMessages = messages?.map((msg: any) => {
      const profile = profilesMap.get(msg.user_id)
      const user = usersMap.get(msg.user_id)
      
      const name = profile?.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : user?.email?.split('@')[0] || 'Unknown'
      
      return {
        id: msg.id,
        user_id: msg.user_id,
        user_name: name,
        user_email: user?.email || '',
        content: msg.content,
        created_at: msg.created_at,
        timestamp: new Date(msg.created_at).toISOString()
      }
    }) || []

    return NextResponse.json({
      messages: enrichedMessages
    })
  } catch (error) {
    safeLogger.error('[Admin] Messages fetch error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

