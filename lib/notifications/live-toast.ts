/**
 * Shared helpers for live toast + notification panel navigation/copy.
 */

import type { Notification } from '@/lib/notifications/types'
import { chatHrefFromMetadata } from '@/lib/notifications/chat-navigation'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'

/** Replace en/em dashes with a regular hyphen. */
export function normalizeDashes(value: string): string {
  return value.replace(/[\u2013\u2014\u2212]/g, '-')
}

/** Ensure a short sentence ends with terminal punctuation. */
export function ensureSentencePunctuation(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (/[.!?…]$/.test(trimmed)) return trimmed
  // Short exclamatory titles already handled by callers; default to period.
  return `${trimmed}.`
}

export function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value
  return `${value.slice(0, maxChars).trimEnd()}...`
}

export function hrefForNotification(notification: Notification): string {
  const meta = (notification.metadata || {}) as Record<string, unknown>

  switch (notification.type) {
    case 'match_created':
      if (typeof meta.chat_id === 'string' && meta.chat_id.length > 0) {
        return chatHrefFromMetadata(meta)
      }
      return '/matches?tab=suggested'
    case 'match_accepted':
      if (typeof meta.chat_id === 'string' && meta.chat_id.length > 0) {
        return chatHrefFromMetadata(meta)
      }
      return '/matches?tab=pending'
    case 'match_confirmed':
      if (typeof meta.chat_id === 'string' && meta.chat_id.length > 0) {
        return chatHrefFromMetadata(meta)
      }
      return '/matches?tab=confirmed'
    case 'chat_message':
    case 'chat_message_reaction':
    case 'group_invitation':
      return chatHrefFromMetadata(meta)
    case 'profile_updated':
      return '/settings'
    case 'questionnaire_completed':
      return '/matches?tab=suggested'
    case 'verification_status':
      return '/verify'
    case 'housing_update':
      return '/housing'
    case 'agreement_update':
      return '/agreements'
    case 'safety_alert':
      return '/safety'
    case 'system_announcement':
    case 'admin_alert':
      if (typeof meta.link === 'string' && meta.link.startsWith('/')) {
        return meta.link
      }
      if (meta.report_status) {
        return '/safety'
      }
      return '/notifications'
    default:
      return '/notifications'
  }
}

export function displayTitleForNotification(notification: Notification): string {
  const metadata = notification.metadata || {}

  if (
    notification.type === 'chat_message' &&
    typeof metadata.sender_name === 'string' &&
    metadata.sender_name.trim()
  ) {
    return normalizeDashes(metadata.sender_name.trim())
  }

  if (
    notification.type === 'chat_message_reaction' &&
    typeof metadata.reactor_name === 'string' &&
    metadata.reactor_name.trim()
  ) {
    return normalizeDashes(metadata.reactor_name.trim())
  }

  if (notification.type === 'match_confirmed') {
    const other =
      typeof metadata.other_user_name === 'string' && metadata.other_user_name.trim()
        ? metadata.other_user_name.trim()
        : null
    if (other) return `You & ${other} connected!`
    // Fall back: strip duplicated "Mutual Match" prefix from stored title/message
    const fromMessage = notification.message.match(/You\s*&\s*([^!.]+)/i)
    if (fromMessage?.[1]) return `You & ${fromMessage[1].trim()} connected!`
    return 'You connected!'
  }

  if (notification.type === 'match_created') {
    const pct =
      typeof metadata.compatibility_pct === 'number'
        ? Math.round(metadata.compatibility_pct)
        : typeof metadata.match_score === 'number'
          ? Math.round(metadata.match_score > 1 ? metadata.match_score : metadata.match_score * 100)
          : null
    if (pct != null) return `New suggested match - ${pct}%`
  }

  return normalizeDashes(notification.title)
}

export function displayMessageForNotification(notification: Notification): string {
  const metadata = notification.metadata || {}
  let message = notification.message || ''

  if (notification.type === 'chat_message') {
    if (typeof metadata.sender_name === 'string' && metadata.sender_name.trim()) {
      const escaped = metadata.sender_name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      message = message.replace(new RegExp(`^${escaped}:\\s*`, 'i'), '')
    } else {
      message = message.replace(/^[^:]{1,40}:\s*/, '')
    }
    return ensureSentencePunctuation(truncateText(normalizeDashes(message.trim()), 140))
  }

  if (notification.type === 'chat_message_reaction') {
    return ensureSentencePunctuation(truncateText(normalizeDashes(message.trim()), 140))
  }

  if (notification.type === 'match_confirmed') {
    // Avoid repeating "Mutual Match" in the body when the eyebrow already says it.
    let body = message
      .replace(/^Mutual Match[!?]?\s*/i, '')
      .replace(/^You\s*&\s*[^!.]+connected\.?\s*/i, '')
      .trim()
    if (!body) body = 'Tap to start chatting with an icebreaker.'
    return ensureSentencePunctuation(truncateText(normalizeDashes(body), 180))
  }

  return ensureSentencePunctuation(truncateText(normalizeDashes(message.trim()), 180))
}

export function fallbackAvatarUrlForNotification(notification: Notification): string | null {
  const meta = notification.metadata || {}
  const fromMeta =
    typeof meta.sender_avatar_url === 'string'
      ? meta.sender_avatar_url
      : typeof (notification as { sender_avatar_url?: string | null }).sender_avatar_url === 'string'
        ? (notification as { sender_avatar_url?: string | null }).sender_avatar_url
        : null
  if (fromMeta) return fromMeta

  if (notification.type !== 'chat_message' && notification.type !== 'chat_message_reaction') {
    return null
  }

  const senderId =
    notification.type === 'chat_message_reaction'
      ? (typeof meta.reactor_id === 'string' ? meta.reactor_id : null)
      : (typeof meta.sender_id === 'string' ? meta.sender_id : null)

  if (!senderId) return null
  return programmaticAvatarUrl(undefined, senderId)
}
