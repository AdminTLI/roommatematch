/**
 * Build `/chat` URL from notification metadata (supports deep-link to a message).
 */
export function chatHrefFromMetadata(metadata: Record<string, unknown>): string {
  let path = '/chat'
  if (typeof metadata.chat_id === 'string' && metadata.chat_id.length > 0) {
    path = `/chat?chatId=${encodeURIComponent(metadata.chat_id)}`
  } else if (typeof metadata.sender_id === 'string' && metadata.sender_id.length > 0) {
    path = `/chat?userId=${encodeURIComponent(metadata.sender_id)}`
  }
  const mid = typeof metadata.message_id === 'string' && metadata.message_id.length > 0 ? metadata.message_id : null
  if (mid) {
    path += path.includes('?') ? `&messageId=${encodeURIComponent(mid)}` : `?messageId=${encodeURIComponent(mid)}`
  }
  return path
}
