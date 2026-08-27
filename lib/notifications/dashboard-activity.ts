import type { NotificationType } from './types'

/**
 * Notification types that belong on the student dashboard "Recent Activity" strip.
 * Admin moderation queue items (reports, blocks, flagged messages) are excluded —
 * those belong in /admin, not the personal dashboard preview.
 */
export const DASHBOARD_ACTIVITY_TYPES: readonly NotificationType[] = [
  'match_created',
  'match_accepted',
  'match_confirmed',
  'chat_message',
  'chat_message_reaction',
  'group_invitation',
  'profile_updated',
  'questionnaire_completed',
  'verification_status',
  'housing_update',
  'agreement_update',
  'safety_alert',
] as const

const ADMIN_MODERATION_META_KINDS = new Set([
  'user_report',
  'user_blocked',
  'flagged_message',
  'auto_flagged',
])

const ADMIN_MODERATION_TITLES = new Set([
  'suspicious message flagged',
  'new user report',
  'user blocked',
])

export type DashboardActivityCandidate = {
  type?: string | null
  title?: string | null
  metadata?: Record<string, unknown> | null
}

/**
 * True when a notification is personal/social product activity suitable for the
 * dashboard Recent Activity section (not admin ops noise).
 */
export function isDashboardActivityNotification(
  notification: DashboardActivityCandidate
): boolean {
  const type = notification.type
  if (!type) return false

  // Explicitly never show admin-ops alerts on the student dashboard.
  if (type === 'admin_alert') return false

  // system_announcement is overloaded: product news vs admin moderation digests.
  if (type === 'system_announcement') {
    return !isAdminModerationNotification(notification)
  }

  return (DASHBOARD_ACTIVITY_TYPES as readonly string[]).includes(type)
}

export function isAdminModerationNotification(
  notification: DashboardActivityCandidate
): boolean {
  const meta = notification.metadata || {}
  const metaKind =
    typeof meta.type === 'string' ? meta.type.toLowerCase() : null
  if (metaKind && ADMIN_MODERATION_META_KINDS.has(metaKind)) return true

  const title = (notification.title || '').trim().toLowerCase()
  if (title && ADMIN_MODERATION_TITLES.has(title)) return true

  const link = typeof meta.link === 'string' ? meta.link : ''
  if (link.startsWith('/admin')) return true

  return false
}
