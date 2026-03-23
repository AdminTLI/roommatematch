import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

function extractSenderName(notification: { message?: string; metadata?: Record<string, any> }) {
  const metadataName = notification.metadata?.sender_name
  if (typeof metadataName === 'string' && metadataName.trim().length > 0) {
    return metadataName.trim()
  }

  const message = notification.message || ''
  const colonIndex = message.indexOf(':')
  if (colonIndex > 0) {
    const prefix = message.slice(0, colonIndex).trim()
    if (prefix.length > 0) return prefix
  }
  return null
}

async function findSenderIdByName(admin: Awaited<ReturnType<typeof createAdminClient>>, senderName: string) {
  const parts = senderName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return null

  // Best-effort exact name matching for older notifications that only stored sender name.
  if (parts.length >= 2) {
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    const { data } = await admin
      .from('profiles')
      .select('user_id')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .limit(1)

    if (data && data.length > 0) return data[0].user_id as string
  }

  const { data } = await admin
    .from('profiles')
    .select('user_id')
    .eq('first_name', senderName)
    .limit(1)

  if (data && data.length > 0) return data[0].user_id as string
  return null
}

async function findDirectChatId(admin: Awaited<ReturnType<typeof createAdminClient>>, userId: string, otherUserId: string) {
  const { data: myMemberships } = await admin
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', userId)

  const myChatIds = (myMemberships || []).map((row: any) => row.chat_id).filter(Boolean)
  if (myChatIds.length === 0) return null

  const { data: sharedMemberships } = await admin
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', otherUserId)
    .in('chat_id', myChatIds)

  const sharedChatIds = (sharedMemberships || []).map((row: any) => row.chat_id).filter(Boolean)
  if (sharedChatIds.length === 0) return null

  const { data: directChats } = await admin
    .from('chats')
    .select('id')
    .eq('is_group', false)
    .in('id', sharedChatIds)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (directChats && directChats.length > 0) return directChats[0].id as string
  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const notificationId = body?.notificationId

    if (!notificationId || typeof notificationId !== 'string') {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 })
    }

    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('id, type, message, metadata')
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (notificationError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.type !== 'chat_message') {
      return NextResponse.json({ error: 'Notification is not a chat message' }, { status: 400 })
    }

    const metadata = (notification.metadata || {}) as Record<string, any>
    const admin = await createAdminClient()

    let chatId: string | null = typeof metadata.chat_id === 'string' ? metadata.chat_id : null
    let senderId: string | null = typeof metadata.sender_id === 'string' ? metadata.sender_id : null
    const senderName = extractSenderName(notification)

    if (!senderId && senderName) {
      senderId = await findSenderIdByName(admin, senderName)
    }

    if (!chatId && senderId) {
      chatId = await findDirectChatId(admin, user.id, senderId)
    }

    // Mark this message notification family as read to keep notification panel in sync.
    const nowIso = new Date().toISOString()
    if (chatId) {
      await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: nowIso })
        .eq('user_id', user.id)
        .eq('type', 'chat_message')
        .eq('metadata->>chat_id', chatId)
    }

    if (senderId) {
      await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: nowIso })
        .eq('user_id', user.id)
        .eq('type', 'chat_message')
        .eq('metadata->>sender_id', senderId)
    }

    if (senderName) {
      await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: nowIso })
        .eq('user_id', user.id)
        .eq('type', 'chat_message')
        .eq('metadata->>sender_name', senderName)
    }

    return NextResponse.json({
      chatId,
      senderId,
      senderName,
      href: chatId ? `/chat?chatId=${chatId}` : senderId ? `/chat?userId=${senderId}` : '/chat',
    })
  } catch (error) {
    console.error('Error resolving chat notification target:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
