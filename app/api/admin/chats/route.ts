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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const admin = await createAdminClient()

    // Fetch chat rooms with member counts and message counts
    const { data: chats, error } = await admin
      .from('chats')
      .select(`
        id,
        is_group,
        group_id,
        created_by,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      safeLogger.error('[Admin] Failed to fetch chats', error)
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      )
    }

    // Get detailed participant info for each chat
    const enrichedChats = await Promise.all(
      (chats || []).map(async (chat) => {
        // Get participants
        const { data: participants } = await admin
          .from('chat_members')
          .select(`
            user_id,
            last_read_at,
            profiles!inner(first_name, last_name, email)
          `)
          .eq('chat_id', chat.id)

        // Get message count
        const { count: messageCount } = await admin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('chat_id', chat.id)

        // Calculate unread counts per user (messages after last_read_at)
        const unreadCounts = await Promise.all(
          (participants || []).map(async (p) => {
            const lastRead = p.last_read_at ? new Date(p.last_read_at).toISOString() : null
            let query = admin
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('chat_id', chat.id)
              .neq('user_id', p.user_id) // Don't count own messages
            
            if (lastRead) {
              query = query.gt('created_at', lastRead)
            }
            
            const { count } = await query
            return {
              user_id: p.user_id,
              count: count || 0
            }
          })
        )

        return {
          id: chat.id,
          is_group: chat.is_group,
          group_id: chat.group_id,
          created_by: chat.created_by,
          created_at: chat.created_at,
          member_count: participants?.length || 0,
          members: participants?.map(p => ({
            id: p.user_id,
            name: `${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim() || p.profiles?.email || 'Unknown',
            email: p.profiles?.email || ''
          })) || [],
          message_count: messageCount || 0,
          unread_counts: unreadCounts
        }
      })
    )

    // Get total count
    const { count } = await admin
      .from('chats')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      chats: enrichedChats,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    safeLogger.error('[Admin] Chats list error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const body = await request.json()
    const { action, chatId } = body

    if (action === 'close') {
      await logAdminAction(user!.id, 'close_chat', 'chat_room', chatId, {
        action: 'Admin closed chat',
        chat_id: chatId,
        role: adminRecord!.role
      })

      const admin = await createAdminClient()
      
      // Remove all participants (effectively closing the chat)
      const { error } = await admin
        .from('chat_members')
        .delete()
        .eq('chat_id', chatId)

      if (error) {
        safeLogger.error('[Admin] Failed to close chat', error)
        return NextResponse.json(
          { error: 'Failed to close chat' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Chat closed successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    safeLogger.error('[Admin] Chats action error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

