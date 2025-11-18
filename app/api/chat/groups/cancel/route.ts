import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { createNotification } from '@/lib/notifications/create'

// POST /api/chat/groups/cancel - Cancel a group chat (creator only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chat_id } = await request.json()
    
    if (!chat_id) {
      return NextResponse.json(
        { error: 'chat_id is required' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    // Verify user is the creator
    const { data: chat } = await admin
      .from('chats')
      .select('id, name, created_by, is_group')
      .eq('id', chat_id)
      .single()

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    if (!chat.is_group) {
      return NextResponse.json(
        { error: 'This is not a group chat' },
        { status: 400 }
      )
    }

    if (chat.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Only the group creator can cancel the group' },
        { status: 403 }
      )
    }

    // Get all members
    const { data: members } = await admin
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chat_id)

    const memberIds = members?.map(m => m.user_id).filter(id => id !== user.id) || []

    // Update chat status to archived
    await admin
      .from('chats')
      .update({
        invitation_status: 'archived',
        is_locked: false,
        lock_reason: 'Group cancelled by creator'
      })
      .eq('id', chat_id)

    // Notify all members
    for (const memberId of memberIds) {
      try {
        await createNotification({
          user_id: memberId,
          type: 'system_announcement',
          title: 'Group Chat Cancelled',
          message: `The group chat "${chat.name || 'Group'}" has been cancelled by the creator.`,
          metadata: {
            chat_id: chat_id
          }
        })
      } catch (notifError) {
        safeLogger.warn('Failed to send cancellation notification', {
          error: notifError,
          chatId: chat_id,
          userId: memberId
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Group cancelled successfully'
    })
  } catch (error) {
    safeLogger.error('Error cancelling group', error)
    return NextResponse.json(
      { error: 'Failed to cancel group' },
      { status: 500 }
    )
  }
}

