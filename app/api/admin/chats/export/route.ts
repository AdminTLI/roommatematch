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

    // Fetch all messages for this chat
    const { data: messages, error } = await admin
      .from('messages')
      .select(`
        id,
        chat_id,
        user_id,
        content,
        created_at,
        profiles!messages_user_id_fkey(first_name, last_name, email)
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

    // Format as CSV
    const csvRows = [
      ['Message ID', 'Sender', 'Email', 'Content', 'Timestamp'].join(',')
    ]

    messages?.forEach(msg => {
      const profiles = msg.profiles as any
      const senderName = profiles 
        ? `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim() || profiles.email
        : 'Unknown'
      const email = profiles?.email || ''
      const content = (msg.content || '').replace(/"/g, '""') // Escape quotes
      const timestamp = new Date(msg.created_at).toISOString()
      
      csvRows.push([
        msg.id,
        `"${senderName}"`,
        `"${email}"`,
        `"${content}"`,
        timestamp
      ].join(','))
    })

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

