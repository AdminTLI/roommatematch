import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification, NotificationCounts } from '@/lib/notifications/types'
import {
  type NotificationFilterCategory,
  type NotificationListEntry,
  CATEGORY_TYPES,
  type NotificationViewModel,
} from '@/types/notification'
import { logger } from '@/lib/utils/logger'

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

  const response = await fetch(`/api/notifications/my?${search}`)
  if (!response.ok) {
    throw new Error('Failed to fetch notifications')
  }
  const data = await response.json()
  const notifications: Notification[] = data.notifications || []
  const hasMore = Boolean(data.pagination?.has_more)
  return { notifications, hasMore }
}

export async function fetchNotificationCounts(): Promise<NotificationCounts> {
  const response = await fetch('/api/notifications/count')
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
 * Merge consecutive chat notifications from the same sender with the same preview
 * (list is expected newest-first).
 */
export function buildNotificationListEntries(notifications: Notification[]): NotificationListEntry[] {
  const out: NotificationListEntry[] = []

  const chatKey = (n: Notification) => {
    const meta = n.metadata || {}
    const sender = (meta.sender_id as string | undefined) || (meta.sender_name as string | undefined) || ''
    const preview = extractChatPreview(n.message)
    return `${sender}::${preview}`
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
      chatKey(prev.notifications[0]) === chatKey(n)
    ) {
      prev.notifications.push(n)
    } else if (
      prev &&
      prev.kind === 'single' &&
      prev.notification.type === 'chat_message' &&
      chatKey(prev.notification) === chatKey(n)
    ) {
      out[out.length - 1] = {
        kind: 'group',
        notifications: [prev.notification, n],
      }
    } else {
      out.push({ kind: 'single', notification: n })
    }
  }

  // Convert trailing single chat that might need to stay single — already handled
  return out
}

function extractChatPreview(message: string): string {
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
 * Privacy sanitization for match notifications (same rules as the previous dropdown).
 */
export async function processNotificationsWithPrivacy(
  supabase: SupabaseClient,
  notifications: Notification[]
): Promise<Notification[]> {
  return Promise.all(
    notifications.map(async (notif) => {
      if (notif.type !== 'match_created' && notif.type !== 'match_accepted') {
        return notif
      }

      let bothUsersAccepted = false
      let hasName = false
      let genericMessage = ''

      if (notif.type === 'match_created' && notif.message && notif.message.includes('match with')) {
        const matchWithPattern = /match with ([^!]+)!/i
        const match = notif.message.match(matchWithPattern)
        if (match) {
          const namePart = match[1].toLowerCase().trim()
          hasName =
            !namePart.includes('someone') &&
            !namePart.includes('a potential roommate') &&
            !namePart.includes('user') &&
            namePart.length > 0
        }
        genericMessage = 'You have matched with someone! Check out your matches to see who.'
      } else if (
        notif.type === 'match_accepted' &&
        notif.message &&
        notif.message.includes('accepted your match request')
      ) {
        hasName =
          !notif.message.includes('Someone') &&
          !notif.message.includes('someone') &&
          !notif.message.includes('Someone accepted your match request')
        genericMessage = 'Someone accepted your match request!'
      }

      if (hasName && notif.metadata?.match_id) {
        try {
          const { data: suggestion } = await supabase
            .from('match_suggestions')
            .select('status, accepted_by, member_ids')
            .eq('id', notif.metadata.match_id)
            .single()

          if (suggestion) {
            const acceptedBy = suggestion.accepted_by || []
            const memberIds = suggestion.member_ids || []
            bothUsersAccepted =
              suggestion.status === 'confirmed' ||
              (memberIds.length === 2 && memberIds.every((id: string) => acceptedBy.includes(id)))
          } else {
            const { data: match } = await supabase
              .from('matches')
              .select('status, a_user, b_user')
              .eq('id', notif.metadata.match_id)
              .single()

            if (match) {
              bothUsersAccepted = match.status === 'confirmed'
            }
          }
        } catch (error) {
          logger.warn('Failed to verify match acceptance status, assuming not both accepted', {
            detail: error instanceof Error ? error.message : String(error),
          })
          bothUsersAccepted = false
        }
      }

      if (hasName && (!bothUsersAccepted || !notif.metadata?.match_id)) {
        return { ...notif, message: genericMessage }
      }
      return notif
    })
  )
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
