import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId parameter required' },
        { status: 400 }
      )
    }

    await logAdminAction(user!.id, 'export_chat_logs', 'chat_room', chatId, {
      action: 'Admin exported chat logs',
      chat_id: chatId,
      role: adminRecord!.role
    })

    const admin = await createAdminClient()

    // Fetch chat details
    const { data: chat } = await admin
      .from('chats')
      .select('id, is_group, created_at, created_by')
      .eq('id', chatId)
      .single()

    // Fetch all participants
    const { data: participants } = await admin
      .from('chat_members')
      .select('user_id, joined_at')
      .eq('chat_id', chatId)

    // Fetch all messages for this chat
    const { data: messages, error } = await admin
      .from('messages')
      .select(`
        id,
        chat_id,
        user_id,
        content,
        created_at
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) {
      safeLogger.error('[Admin] Failed to export chat logs', error)
      return NextResponse.json(
        { error: 'Failed to export chat logs' },
        { status: 500 }
      )
    }

    // Fetch user profiles and emails for all message senders
    const userIds = new Set<string>()
    messages?.forEach((msg: any) => {
      userIds.add(msg.user_id)
    })
    participants?.forEach((p: any) => {
      userIds.add(p.user_id)
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

    // Try to get IP addresses from auth sessions (if available)
    // Note: IP addresses may not be stored, so we'll mark as N/A if unavailable
    const ipAddressMap = new Map<string, string>()
    for (const userId of userIdsArray) {
      try {
        // Try to get user sessions - IP might be in metadata
        const { data: authUser } = await admin.auth.admin.getUserById(userId)
        // IP addresses are typically not stored in Supabase auth by default
        // We'll mark as N/A for now
        ipAddressMap.set(userId, 'N/A - Not tracked')
      } catch (error) {
        ipAddressMap.set(userId, 'N/A - Not available')
      }
    }

    // Build comprehensive CSV export
    const escapeCSV = (str: string) => {
      if (str === null || str === undefined) return '""'
      return `"${String(str).replace(/"/g, '""')}"`
    }

    const csvRows: string[] = []
    
    // Header section with chat metadata
    csvRows.push('=== CHAT LOG EXPORT ===')
    csvRows.push('')
    csvRows.push(`Chat ID,${escapeCSV(chatId)}`)
    csvRows.push(`Chat Type,${escapeCSV(chat?.is_group ? 'Group Chat' : '1-on-1 Chat')}`)
    csvRows.push(`Created At,${escapeCSV(chat?.created_at ? new Date(chat.created_at).toISOString() : 'N/A')}`)
    csvRows.push(`Total Messages,${messages?.length || 0}`)
    csvRows.push(`Total Participants,${participants?.length || 0}`)
    csvRows.push('')
    csvRows.push('=== PARTICIPANTS ===')
    csvRows.push('User ID,Name,Email,Joined At')
    
    participants?.forEach((p: any) => {
      const profile = profilesMap.get(p.user_id)
      const user = usersMap.get(p.user_id)
      const name = profile?.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : user?.email?.split('@')[0] || 'Unknown'
      const email = user?.email || ''
      const joinedAt = p.joined_at ? new Date(p.joined_at).toISOString() : 'N/A'
      
      csvRows.push([
        escapeCSV(p.user_id),
        escapeCSV(name),
        escapeCSV(email),
        escapeCSV(joinedAt)
      ].join(','))
    })
    
    csvRows.push('')
    csvRows.push('=== MESSAGES ===')
    csvRows.push('Message ID,Timestamp,User ID,User Name,User Email,IP Address,Content')
    
    messages?.forEach((msg: any) => {
      const profile = profilesMap.get(msg.user_id)
      const user = usersMap.get(msg.user_id)
      const name = profile?.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : user?.email?.split('@')[0] || 'Unknown'
      const email = user?.email || ''
      const ipAddress = ipAddressMap.get(msg.user_id) || 'N/A - Not available'
      const content = msg.content || ''
      const timestamp = new Date(msg.created_at).toISOString()
      
      csvRows.push([
        escapeCSV(msg.id),
        escapeCSV(timestamp),
        escapeCSV(msg.user_id),
        escapeCSV(name),
        escapeCSV(email),
        escapeCSV(ipAddress),
        escapeCSV(content) // Content includes emojis and all text
      ].join(','))
    })
    
    csvRows.push('')
    csvRows.push('=== END OF EXPORT ===')
    csvRows.push(`Export Date,${escapeCSV(new Date().toISOString())}`)
    csvRows.push(`Exported By,${escapeCSV(user!.email || 'Unknown')}`)

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="chat-${chatId}-${Date.now()}.csv"`
      }
    })
  } catch (error) {
    safeLogger.error('[Admin] Chat export error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

