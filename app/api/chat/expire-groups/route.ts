import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { createNotification } from '@/lib/notifications/create'
import { requireAdminResponse } from '@/lib/auth/admin'

// POST /api/chat/expire-groups - Cleanup expired locked groups (should be called by cron)
export async function POST(request: NextRequest) {
  // This should be called by a cron job or scheduled task
  // For now, require admin authentication
  const authError = await requireAdminResponse(request, true)
  if (authError) {
    return authError
  }

  try {
    const admin = await createAdminClient()
    const now = new Date().toISOString()

    // Find all locked groups that have expired
    const { data: expiredChats, error: expiredError } = await admin
      .from('chats')
      .select('id, name, created_by')
      .eq('is_locked', true)
      .lt('lock_expires_at', now)

    if (expiredError) {
      return NextResponse.json(
        { error: `Failed to find expired chats: ${expiredError.message}` },
        { status: 500 }
      )
    }

    if (!expiredChats || expiredChats.length === 0) {
      return NextResponse.json({ 
        message: 'No expired groups found',
        expired_count: 0
      })
    }

    // Get all members of expired chats
    const chatIds = expiredChats.map(c => c.id)
    const { data: allMembers } = await admin
      .from('chat_members')
      .select('chat_id, user_id')
      .in('chat_id', chatIds)

    // Group members by chat_id
    const membersByChat = new Map<string, string[]>()
    allMembers?.forEach(m => {
      const existing = membersByChat.get(m.chat_id) || []
      membersByChat.set(m.chat_id, [...existing, m.user_id])
    })

    // Notify all members and update chat status
    let notifiedCount = 0
    for (const chat of expiredChats) {
      const memberIds = membersByChat.get(chat.id) || []
      
      // Update chat status to archived
      await admin
        .from('chats')
        .update({
          invitation_status: 'archived',
          is_locked: false,
          lock_reason: 'Group failed to unlock: Not all members accepted matches within 72 hours'
        })
        .eq('id', chat.id)

      // Notify all members
      for (const memberId of memberIds) {
        try {
          await createNotification({
            user_id: memberId,
            type: 'system_announcement',
            title: 'Group Chat Expired',
            message: 'The group chat failed to unlock because not everyone accepted to match with each other within 72 hours.',
            metadata: {
              chat_id: chat.id,
              group_name: chat.name
            }
          })
          notifiedCount++
        } catch (notifError) {
          safeLogger.warn('Failed to send expiration notification', {
            error: notifError,
            chatId: chat.id,
            userId: memberId
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Expired groups processed',
      expired_count: expiredChats.length,
      notified_count: notifiedCount
    })
  } catch (error) {
    safeLogger.error('Error processing expired groups', error)
    return NextResponse.json(
      { error: 'Failed to process expired groups' },
      { status: 500 }
    )
  }
}

