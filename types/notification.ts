import type { Notification, NotificationType } from '@/lib/notifications/types'

/**
 * High-level filters mapped to concrete {@link NotificationType} values in the database.
 * The platform does not yet emit likes/mentions/replies; those can be added when types exist.
 */
export const NOTIFICATION_FILTER_CATEGORIES = [
  'all',
  'messages',
  'matches',
  'updates',
  'system',
] as const

export type NotificationFilterCategory = (typeof NOTIFICATION_FILTER_CATEGORIES)[number]

export const CATEGORY_TYPES: Record<NotificationFilterCategory, NotificationType[] | null> = {
  all: null,
  messages: ['chat_message', 'group_invitation'],
  matches: ['match_created', 'match_accepted', 'match_confirmed'],
  updates: [
    'profile_updated',
    'questionnaire_completed',
    'verification_status',
    'housing_update',
    'agreement_update',
  ],
  system: ['safety_alert', 'system_announcement', 'admin_alert'],
}

export const CATEGORY_LABEL: Record<NotificationFilterCategory, string> = {
  all: 'All',
  messages: 'Messages',
  matches: 'Matches',
  updates: 'Updates',
  system: 'System',
}

export type NotificationListEntry =
  | { kind: 'single'; notification: Notification }
  | { kind: 'group'; notifications: Notification[] }

export interface NotificationViewModel extends Notification {
  sender_avatar_url?: string | null
}

export function isNotificationFilterCategory(value: string): value is NotificationFilterCategory {
  return (NOTIFICATION_FILTER_CATEGORIES as readonly string[]).includes(value)
}
