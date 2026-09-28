import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification, NotificationCounts } from '@/lib/notifications/types'
import { anonymizeMatchNotificationMessage } from '@/lib/notifications/anonymize-match-message'
import {
  type NotificationFilterCategory,
  type NotificationListEntry,
  CATEGORY_TYPES,
  type NotificationViewModel,
} from '@/types/notification'

export const NOTIFICATIONS_PAGE_SIZE = 30

export interface FetchMyNotificationsParams {
  limit?: number
  offset?: number
  isRead?: boolean
  /** Single DB type (legacy) */
  type?: string
  /** Category maps to multiple DB types */
  category?: NotificationFilterCategory
}

export interface FetchMyNotificationsResult {
  notifications: Notification[]
  hasMore: boolean
}

export async function fetchMyNotifications(
  params: FetchMyNotificationsParams = {}
): Promise<FetchMyNotificationsResult> {
  const limit = params.limit ?? NOTIFICATIONS_PAGE_SIZE
  const offset = params.offset ?? 0
  const search = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  if (params.isRead !== undefined) {
    search.set('is_read', params.isRead ? 'true' : 'false')
  }
  if (params.category && params.category !== 'all') {
    search.set('category', params.category)
  } else if (params.type) {
    search.set('type', params.type)
  }

  const response = await fetch(`/api/notifications/my?${search}`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to fetch notifications')
  }
  const data = await response.json()
  const notifications: Notification[] = data.notifications || []
  const hasMore = Boolean(data.pagination?.has_more)
  return { notifications, hasMore }
}

export async function fetchNotificationCounts(): Promise<NotificationCounts> {
  const response = await fetch('/api/notifications/count', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to fetch notification counts')
  }
  return response.json()
}

export function unreadCountForCategory(
  category: NotificationFilterCategory,
  byType: Record<string, { total: number; unread: number }> | undefined
): number {
  if (!byType) return 0
  if (category === 'all') {
    return Object.values(byType).reduce((s, v) => s + (v.unread ?? 0), 0)
  }
  const types = CATEGORY_TYPES[category]
  if (!types) return 0
  return types.reduce((sum, t) => sum + (byType[t]?.unread ?? 0), 0)
}

/**
 * Merge consecutive chat notifications from the same sender/thread
 * (list is expected newest-first). Different message previews still stack.
 */
export function buildNotificationListEntries(notifications: Notification[]): NotificationListEntry[] {
  const out: NotificationListEntry[] = []

  const chatThreadKey = (n: Notification) => {
    const meta = n.metadata || {}
    const chatId = typeof meta.chat_id === 'string' ? meta.chat_id : ''
    const sender =
      (typeof meta.sender_id === 'string' && meta.sender_id) ||
      (typeof meta.sender_name === 'string' && meta.sender_name) ||
      ''
    return `${chatId}::${sender}`
  }

  for (const n of notifications) {
    if (n.type !== 'chat_message') {
      out.push({ kind: 'single', notification: n })
      continue
    }

    const prev = out[out.length - 1]
    if (
      prev &&
      prev.kind === 'group' &&
      prev.notifications[0]?.type === 'chat_message' &&
      chatThreadKey(prev.notifications[0]) === chatThreadKey(n)
    ) {
      prev.notifications.push(n)
    } else if (
      prev &&
      prev.kind === 'single' &&
      prev.notification.type === 'chat_message' &&
      chatThreadKey(prev.notification) === chatThreadKey(n)
    ) {
      out[out.length - 1] = {
        kind: 'group',
        notifications: [prev.notification, n],
      }
    } else {
      out.push({ kind: 'single', notification: n })
    }
  }

  return out
}

export function extractChatPreview(message: string): string {
  const idx = message.indexOf(':')
  if (idx === -1) return message.trim().slice(0, 200)
  return message.slice(idx + 1).trim().slice(0, 200)
}

export async function attachSenderAvatars(
  _supabase: SupabaseClient,
  notifications: Notification[]
): Promise<NotificationViewModel[]> {
  return notifications.map((n) => {
    if (n.type !== 'chat_message' && n.type !== 'chat_message_reaction') return { ...n }
    const fromServer = (n as { sender_avatar_url?: string | null }).sender_avatar_url
    if (fromServer) {
      return { ...n, sender_avatar_url: fromServer }
    }
    const senderId =
      n.type === 'chat_message_reaction'
        ? (n.metadata?.reactor_id as string | undefined)
        : (n.metadata?.sender_id as string | undefined)
    return { ...n, sender_avatar_url: senderId ? null : null }
  })
}

/**
 * Privacy sanitization for match suggestion / one-sided-accept notifications.
 * Peer names are never shown for these types (no DB verification).
 */
export function processNotificationsWithPrivacy(
  notifications: Notification[]
): Notification[] {
  return notifications.map((notif) => {
    if (notif.type !== 'match_created' && notif.type !== 'match_accepted') {
      return notif
    }
    return {
      ...notif,
      message: anonymizeMatchNotificationMessage(notif.type, notif.message),
    }
  })
}

export type TimeGroupKey = 'new' | 'yesterday' | 'earlier'

export function timeGroupForNotification(createdAt: string): TimeGroupKey {
  const d = new Date(createdAt)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startYesterday = new Date(startToday)
  startYesterday.setDate(startYesterday.getDate() - 1)
  if (d >= startToday) return 'new'
  if (d >= startYesterday) return 'yesterday'
  return 'earlier'
}

export const TIME_GROUP_LABEL: Record<TimeGroupKey, string> = {
  new: 'New',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
}

export function groupEntriesByTime(entries: NotificationListEntry[]): { key: TimeGroupKey; entries: NotificationListEntry[] }[] {
  const bucket: Record<TimeGroupKey, NotificationListEntry[]> = {
    new: [],
    yesterday: [],
    earlier: [],
  }

  for (const entry of entries) {
    const ts = entry.kind === 'single' ? entry.notification.created_at : entry.notifications[0]!.created_at
    bucket[timeGroupForNotification(ts)].push(entry)
  }

  return (['new', 'yesterday', 'earlier'] as const)
    .map((key) => ({ key, entries: bucket[key] }))
    .filter((g) => g.entries.length > 0)
}
