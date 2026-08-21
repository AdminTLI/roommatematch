import { createAdminClient } from '@/lib/supabase/server'

const MESSAGE_NOTIFICATION_TYPES = ['chat_message', 'chat_message_reaction'] as const

/**
 * Remove in-app message notifications for one conversation (or one sender when
 * chat_id is missing). Never clears other users' / other chats' notifications.
 */
export async function deleteMessageNotificationsForThread(params: {
  userId: string
  chatId?: string | null
  senderId?: string | null
  notificationId?: string | null
}): Promise<void> {
  const { userId, chatId, senderId, notificationId } = params
  const admin = createAdminClient()

  try {
    if (chatId) {
      const { error } = await admin
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .in('type', MESSAGE_NOTIFICATION_TYPES)
        .eq('metadata->>chat_id', chatId)

      if (error) {
        console.warn('Failed to delete message notifications by chat_id:', error)
      }
    } else if (senderId) {
      const { error: messageError } = await admin
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'chat_message')
        .eq('metadata->>sender_id', senderId)

      if (messageError) {
        console.warn('Failed to delete message notifications by sender_id:', messageError)
      }

      const { error: reactionError } = await admin
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('type', 'chat_message_reaction')
        .eq('metadata->>reactor_id', senderId)

      if (reactionError) {
        console.warn('Failed to delete reaction notifications by reactor_id:', reactionError)
      }
    }

    // Always drop the clicked row so legacy notifications without chat_id/sender_id still leave the panel.
    if (notificationId) {
      const { error } = await admin
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('id', notificationId)
        .in('type', MESSAGE_NOTIFICATION_TYPES)

      if (error) {
        console.warn('Failed to delete specific message notification:', error)
      }
    }
  } catch (error) {
    console.warn('Failed to delete chat message notifications:', error)
  }
}
