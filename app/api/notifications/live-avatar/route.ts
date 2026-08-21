import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { senderAvatarForChatNotification } from '@/lib/privacy/profile-access-server'
import { isChatPanelNotificationType } from '@/lib/notifications/chat-navigation'

/**
 * Resolve a privacy-aware avatar URL for a chat notification toast.
 * POST { notificationId }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const notificationId = typeof body?.notificationId === 'string' ? body.notificationId : null
    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId required' }, { status: 400 })
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .select('id, user_id, type, metadata')
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !notification) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!isChatPanelNotificationType(notification.type)) {
      return NextResponse.json({ avatarUrl: null })
    }

    const meta = (notification.metadata || {}) as Record<string, unknown>
    const senderId =
      notification.type === 'chat_message_reaction'
        ? (typeof meta.reactor_id === 'string' ? meta.reactor_id : null)
        : (typeof meta.sender_id === 'string' ? meta.sender_id : null)
    const chatId = typeof meta.chat_id === 'string' ? meta.chat_id : null

    if (!senderId) {
      return NextResponse.json({ avatarUrl: null })
    }

    const admin = createAdminClient()
    const avatarUrl = await senderAvatarForChatNotification(admin, user.id, senderId, chatId)
    return NextResponse.json({ avatarUrl })
  } catch (err) {
    console.error('[notifications/live-avatar]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
