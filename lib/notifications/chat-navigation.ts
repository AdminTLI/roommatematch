export const CHAT_PANEL_NOTIFICATION_TYPES = ['chat_message', 'chat_message_reaction'] as const

export function isChatPanelNotificationType(
  type: string
): type is (typeof CHAT_PANEL_NOTIFICATION_TYPES)[number] {
  return type === 'chat_message' || type === 'chat_message_reaction'
}

export function threadFromNotificationMetadata(metadata: Record<string, unknown> | null | undefined): {
  chatId: string | null
  senderId: string | null
} {
  const meta = metadata || {}
  const chatId = typeof meta.chat_id === 'string' && meta.chat_id.length > 0 ? meta.chat_id : null
  const senderId =
    (typeof meta.sender_id === 'string' && meta.sender_id.length > 0 && meta.sender_id) ||
    (typeof meta.reactor_id === 'string' && meta.reactor_id.length > 0 && meta.reactor_id) ||
    null
  return { chatId, senderId }
}

/**
 * True when this notification belongs to the opened conversation only —
 * same chat, or same sender when chat_id is missing.
 */
export function notificationBelongsToChatThread(
  notification: { type: string; metadata?: Record<string, unknown> | null },
  thread: { chatId?: string | null; senderId?: string | null }
): boolean {
  if (!isChatPanelNotificationType(notification.type)) return false
  const meta = notification.metadata || {}

  if (thread.chatId) {
    return typeof meta.chat_id === 'string' && meta.chat_id === thread.chatId
  }

  if (thread.senderId) {
    if (notification.type === 'chat_message') {
      return meta.sender_id === thread.senderId
    }
    return meta.reactor_id === thread.senderId
  }

  return false
}

/**
 * Build `/chat` URL from notification metadata (supports deep-link to a message,
 * icebreaker draft, and composer focus).
 */
export function chatHrefFromMetadata(metadata: Record<string, unknown>): string {
  let path = '/chat'
  if (typeof metadata.chat_id === 'string' && metadata.chat_id.length > 0) {
    path = `/chat?chatId=${encodeURIComponent(metadata.chat_id)}`
  } else if (typeof metadata.sender_id === 'string' && metadata.sender_id.length > 0) {
    path = `/chat?userId=${encodeURIComponent(metadata.sender_id)}`
  }

  const mid =
    typeof metadata.message_id === 'string' && metadata.message_id.length > 0
      ? metadata.message_id
      : null
  if (mid) {
    path += path.includes('?')
      ? `&messageId=${encodeURIComponent(mid)}`
      : `?messageId=${encodeURIComponent(mid)}`
  }

  const icebreaker =
    typeof metadata.icebreaker === 'string' && metadata.icebreaker.trim().length > 0
      ? metadata.icebreaker.trim()
      : null
  if (icebreaker) {
    path += path.includes('?')
      ? `&draft=${encodeURIComponent(icebreaker)}`
      : `?draft=${encodeURIComponent(icebreaker)}`
    path += '&focus=1'
  }

  return path
}
