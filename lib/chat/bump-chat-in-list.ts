import { queryClient } from '@/app/query-client'
import { queryKeys } from '@/app/query-keys'

export type SidebarChatPreview = {
  id: string
  lastMessage?: {
    content: string
    sender: string
    timestamp: string
    isRead: boolean
    created_at?: string
  }
  unreadCount: number
  isRecentlyMatched: boolean
  mostRecentMessageTime?: number
  [key: string]: unknown
}

export type BumpChatInListParams = {
  viewerUserId: string
  chatId: string
  content: string
  senderLabel: string
  createdAt: string
  /** Increment unread when the message is for a chat that isn't currently open */
  incrementUnread?: boolean
  /** Move out of "recently matched" into active conversations */
  markAsActiveConversation?: boolean
  /** When true, also schedule a background refetch for authoritative data */
  refetch?: boolean
}

/**
 * Instantly reorder / update the /chat left-pane list in React Query cache.
 * Sort keys off `mostRecentMessageTime`, so bumping that moves the row to the top.
 */
export function bumpChatInList({
  viewerUserId,
  chatId,
  content,
  senderLabel,
  createdAt,
  incrementUnread = false,
  markAsActiveConversation = true,
  refetch = true,
}: BumpChatInListParams): void {
  const key = queryKeys.chats(viewerUserId)
  const createdMs = Date.parse(createdAt)
  const activityMs = Number.isFinite(createdMs) ? createdMs : Date.now()
  let missingChat = false

  queryClient.setQueryData<SidebarChatPreview[]>(key, (prev) => {
    if (!Array.isArray(prev) || prev.length === 0) {
      missingChat = true
      return prev
    }

    const idx = prev.findIndex((chat) => chat.id === chatId)
    if (idx < 0) {
      missingChat = true
      return prev
    }

    const chat = prev[idx]!
    const existingTime = chat.mostRecentMessageTime || 0
    const samePreview =
      chat.lastMessage?.created_at === createdAt && chat.lastMessage?.content === content

    // Same event can arrive via broadcast, postgres_changes, and notifications —
    // ignore duplicates so unread doesn't double-count.
    if (samePreview) return prev
    if (activityMs < existingTime) return prev

    const isNewer = activityMs > existingTime

    const next: SidebarChatPreview = {
      ...chat,
      isRecentlyMatched: markAsActiveConversation ? false : chat.isRecentlyMatched,
      mostRecentMessageTime: Math.max(existingTime, activityMs),
      lastMessage: {
        content,
        sender: senderLabel,
        timestamp: new Date(activityMs).toLocaleString(),
        isRead: !(incrementUnread && isNewer),
        created_at: createdAt,
      },
      unreadCount:
        incrementUnread && isNewer
          ? (typeof chat.unreadCount === 'number' ? chat.unreadCount : 0) + 1
          : chat.unreadCount,
    }

    const copy = prev.slice()
    copy[idx] = next
    return copy
  })

  if (refetch || missingChat) {
    void queryClient.invalidateQueries({ queryKey: key })
  }
}
