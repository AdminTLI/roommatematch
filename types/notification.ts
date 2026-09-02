import type { Notification, NotificationType } from '@/lib/notifications/types'

/**
 * High-level filters mapped to concrete {@link NotificationType} values in the database.
 * `alerts` merges former Updates + System (profile/housing feedback + safety/moderation).
 */
export const NOTIFICATION_FILTER_CATEGORIES = [
  'all',
  'messages',
  'matches',
  'alerts',
] as const

export type NotificationFilterCategory = (typeof NOTIFICATION_FILTER_CATEGORIES)[number]

export const CATEGORY_TYPES: Record<NotificationFilterCategory, NotificationType[] | null> = {
  all: null,
  messages: ['chat_message', 'chat_message_reaction', 'group_invitation'],
  matches: ['match_created', 'match_accepted', 'match_confirmed'],
  alerts: [
    'profile_updated',
    'questionnaire_completed',
    'verification_status',
    'housing_update',
    'agreement_update',
    'safety_alert',
    'system_announcement',
    'admin_alert',
    'lab_wish_shipped',
  ],
}

export const CATEGORY_LABEL: Record<NotificationFilterCategory, string> = {
  all: 'All',
  messages: 'Messages',
  matches: 'Matches',
  alerts: 'Alerts',
}

/** Map legacy filter query values to the current category set. */
export function normalizeNotificationFilterCategory(
  value: string
): NotificationFilterCategory | null {
  if ((NOTIFICATION_FILTER_CATEGORIES as readonly string[]).includes(value)) {
    return value as NotificationFilterCategory
  }
  if (value === 'updates' || value === 'system') return 'alerts'
  return null
}

export type NotificationListEntry =
  | { kind: 'single'; notification: Notification }
  | { kind: 'group'; notifications: Notification[] }

export interface NotificationViewModel extends Notification {
  sender_avatar_url?: string | null
}

export function isNotificationFilterCategory(value: string): value is NotificationFilterCategory {
  return normalizeNotificationFilterCategory(value) !== null
}
