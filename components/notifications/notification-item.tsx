'use client'

import { useCallback, useState } from 'react'
import {
  Users,
  CheckCircle,
  MessageCircle,
  User,
  UserCheck,
  UserPen,
  FileText,
  Shield,
  Home,
  FileCheck,
  AlertTriangle,
  Megaphone,
  Smile,
  Sparkles,
  ChevronDown,
  Flag,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/notifications/types'
import { NOTIFICATION_CONFIG } from '@/lib/notifications/types'
import type { NotificationListEntry } from '@/types/notification'
import type { NotificationViewModel } from '@/types/notification'
import { extractChatPreview } from '@/services/notificationsService'

const iconMap = {
  Users,
  UserCheck,
  UserPen,
  CheckCircle,
  MessageCircle,
  Smile,
  User,
  FileText,
  Shield,
  Home,
  FileCheck,
  AlertTriangle,
  Megaphone,
} as const

/** Compact relative time aligned with chat list style (`17h ago`, `1m ago`, `1d ago`). */
function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''

  const now = Date.now()
  const diffMs = Math.max(0, now - date.getTime())
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 30) return `${diffDay}d ago`
  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth}mo ago`
  return `${Math.floor(diffDay / 365)}y ago`
}

function parseChatSender(notification: Notification): string {
  const meta = notification.metadata || {}
  if (typeof meta.sender_name === 'string' && meta.sender_name.trim()) {
    return meta.sender_name.trim()
  }
  const idx = notification.message.indexOf(':')
  if (idx > 0) return notification.message.slice(0, idx).trim()
  return 'Someone'
}

function chatPreview(notification: Notification): string {
  return extractChatPreview(notification.message)
}

type HeadlineParts = { primary: string; body: string; time: string }

function headlineForEntry(entry: NotificationListEntry): HeadlineParts {
  if (entry.kind === 'group') {
    const newest = entry.notifications[0]!
    const name = parseChatSender(newest)
    const preview = chatPreview(newest)
    const count = entry.notifications.length
    return {
      primary: `${name} · ${count} new messages`,
      body: `${preview.slice(0, 72)}${preview.length > 72 ? '…' : ''}`,
      time: formatNotificationTime(newest.created_at),
    }
  }

  const n = entry.notification
  const meta = n.metadata || {}
  const time = formatNotificationTime(n.created_at)

  if (n.type === 'chat_message') {
    const name = parseChatSender(n)
    const preview = chatPreview(n)
    return {
      primary: `${name} messaged you`,
      body: `${preview.slice(0, 72)}${preview.length > 72 ? '…' : ''}`,
      time,
    }
  }

  if (n.type === 'chat_message_reaction') {
    const name =
      typeof meta.reactor_name === 'string' && meta.reactor_name.trim()
        ? meta.reactor_name.trim()
        : 'Someone'
    const emoji = typeof meta.emoji === 'string' ? meta.emoji : ''
    return {
      primary: `${name} reacted ${emoji}`,
      body: n.message.includes('to your message')
        ? 'to your message'
        : `${n.message.slice(0, 72)}${n.message.length > 72 ? '…' : ''}`,
      time,
    }
  }

  if (n.type === 'match_confirmed') {
    const other =
      typeof meta.other_user_name === 'string' && meta.other_user_name.trim()
        ? meta.other_user_name.trim()
        : null
    return {
      primary: other ? `Mutual Match! You & ${other} connected` : 'Mutual Match!',
      body: 'Tap to start chatting with an icebreaker →',
      time,
    }
  }

  if (n.type === 'match_accepted') {
    return {
      primary: n.title,
      body: `${n.message.slice(0, 80)}${n.message.length > 80 ? '…' : ''}`,
      time,
    }
  }

  if (n.type === 'match_created') {
    const pct =
      typeof meta.compatibility_pct === 'number'
        ? Math.round(meta.compatibility_pct)
        : typeof meta.match_score === 'number'
          ? Math.round(meta.match_score > 1 ? meta.match_score : meta.match_score * 100)
          : null
    return {
      primary: pct != null ? `New suggested match · ${pct}%` : n.title,
      body: `${n.message.slice(0, 80)}${n.message.length > 80 ? '…' : ''}`,
      time,
    }
  }

  if (n.type === 'system_announcement' || n.type === 'admin_alert' || n.type === 'safety_alert') {
    return {
      primary: n.title,
      body: `${n.message.slice(0, 80)}${n.message.length > 80 ? '…' : ''}`,
      time,
    }
  }

  return {
    primary: n.title,
    body: `${n.message.slice(0, 80)}${n.message.length > 80 ? '…' : ''}`,
    time,
  }
}

function avatarForEntry(
  entry: NotificationListEntry,
  viewById: Map<string, NotificationViewModel>
): { url: string | null | undefined; fallbackName: string; usePhoto: boolean } {
  if (entry.kind === 'group') {
    const n = entry.notifications[0]!
    const vm = viewById.get(n.id)
    return { url: vm?.sender_avatar_url, fallbackName: parseChatSender(n), usePhoto: true }
  }
  const n = entry.notification
  if (n.type === 'chat_message') {
    const vm = viewById.get(n.id)
    return { url: vm?.sender_avatar_url, fallbackName: parseChatSender(n), usePhoto: true }
  }
  if (n.type === 'chat_message_reaction') {
    const vm = viewById.get(n.id)
    const meta = n.metadata || {}
    const name =
      typeof meta.reactor_name === 'string' && meta.reactor_name.trim()
        ? meta.reactor_name.trim()
        : 'Someone'
    return { url: vm?.sender_avatar_url, fallbackName: name, usePhoto: true }
  }
  // Matches / system: always use the type icon — never cryptic initials like "MA"
  return { url: null, fallbackName: '', usePhoto: false }
}

function typeIcon(type: Notification['type']) {
  const cfg = NOTIFICATION_CONFIG[type as keyof typeof NOTIFICATION_CONFIG]
  const key = (cfg?.icon ?? 'MessageCircle') as keyof typeof iconMap
  return iconMap[key] ?? MessageCircle
}

function allIds(entry: NotificationListEntry): string[] {
  if (entry.kind === 'single') return [entry.notification.id]
  return entry.notifications.map((n) => n.id)
}

function isUnreadEntry(entry: NotificationListEntry): boolean {
  if (entry.kind === 'single') return !entry.notification.is_read
  return entry.notifications.some((n) => !n.is_read)
}

function leadNotification(entry: NotificationListEntry): Notification {
  return entry.kind === 'single' ? entry.notification : entry.notifications[0]!
}

/** Only reaction emoji is shown — tiny type badges were illegible and confusing. */
function ReactionBadge({ emoji }: { emoji?: string }) {
  if (!emoji) return null
  return (
    <span
      className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] shadow-sm ring-2 ring-white dark:bg-slate-800 dark:ring-slate-700"
      aria-hidden
    >
      {emoji}
    </span>
  )
}

function ReportStatusPill({ status }: { status: string }) {
  if (status === 'open') {
    return (
      <span className="inline-flex w-fit shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold leading-tight text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
        Under Review
      </span>
    )
  }
  if (status === 'actioned') {
    return (
      <span className="inline-flex w-fit shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold leading-tight text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
        Action Taken
      </span>
    )
  }
  if (status === 'dismissed') {
    return (
      <span className="inline-flex w-fit shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold leading-tight text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
        Reviewed
      </span>
    )
  }
  return null
}

interface NotificationItemProps {
  entry: NotificationListEntry
  viewById: Map<string, NotificationViewModel>
  layout: 'mobile' | 'desktop'
  onOpen: (notification: Notification) => Promise<void>
  onMarkAsRead: (ids: string[]) => Promise<void>
}

export function NotificationItem({
  entry,
  viewById,
  layout,
  onOpen,
  onMarkAsRead,
}: NotificationItemProps) {
  const n = leadNotification(entry)
  const unread = isUnreadEntry(entry)
  const { primary, body, time } = headlineForEntry(entry)
  const { url, fallbackName, usePhoto } = avatarForEntry(entry, viewById)
  const Icon = typeIcon(n.type)
  const isMutual = n.type === 'match_confirmed'
  const isGroup = entry.kind === 'group'
  const reactionEmoji =
    n.type === 'chat_message_reaction' && typeof n.metadata?.emoji === 'string'
      ? n.metadata.emoji
      : undefined
  const reportStatus =
    typeof n.metadata?.report_status === 'string' ? n.metadata.report_status : null
  const metaKind =
    typeof n.metadata?.type === 'string' ? n.metadata.type : null
  const isUserReport = metaKind === 'user_report' || n.title === 'New User Report'
  const isUserBlocked = metaKind === 'user_blocked' || n.title === 'User Blocked'

  const [expanded, setExpanded] = useState(false)

  const handleOpen = useCallback(async () => {
    const isChatMessage =
      n.type === 'chat_message' || n.type === 'chat_message_reaction'
    // Chat threads are deleted from the panel on open; don't just mark them read.
    if (!isChatMessage) {
      const toMark = allIds(entry).filter((id) => {
        const notif =
          entry.kind === 'single'
            ? entry.notification
            : entry.notifications.find((x) => x.id === id)!
        return !notif.is_read
      })
      if (toMark.length) await onMarkAsRead(toMark)
    }
    await onOpen(n)
  }, [entry, n, onMarkAsRead, onOpen])

  const stopExpandFromOpening = (e: React.SyntheticEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className={cn(
        'notif-glass-card relative overflow-hidden rounded-xl',
        isMutual && 'shadow-[0_0_0_1px_rgba(124,58,237,0.28),0_8px_24px_rgba(124,58,237,0.12)]'
      )}
    >
      {unread && (
        <span
          className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-violet-500 via-fuchsia-500 to-violet-400 opacity-90"
          aria-hidden
        />
      )}
      <div className="group/item relative">
        <div
          className={cn(
            'relative flex w-full items-start gap-3 px-3 text-left',
            layout === 'mobile' ? 'min-h-[44px] py-2.5' : 'py-2.5'
          )}
        >
          <div
            role="button"
            tabIndex={0}
            className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
            onClick={() => void handleOpen()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                void handleOpen()
              }
            }}
          >
            <div className="relative mt-0.5 h-11 w-11 shrink-0">
              <div
                className={cn(
                  'flex h-full w-full items-center justify-center overflow-hidden rounded-full',
                  n.type === 'match_created'
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                    : n.type === 'match_accepted'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : n.type === 'match_confirmed'
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                        : n.type === 'profile_updated'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : isUserReport
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                            : isUserBlocked
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                              : 'bg-zinc-100/80 text-violet-600 dark:bg-slate-800/80 dark:text-violet-400'
                )}
              >
                {usePhoto && url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs
                  <img src={url} alt="" className="h-full w-full object-cover object-center" />
                ) : usePhoto ? (
                  <span className="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                    {fallbackName.slice(0, 2).toUpperCase()}
                  </span>
                ) : n.type === 'match_created' ? (
                  <Users className="h-5 w-5" strokeWidth={2} />
                ) : n.type === 'match_accepted' ? (
                  <UserCheck className="h-5 w-5" strokeWidth={2} />
                ) : n.type === 'match_confirmed' ? (
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                ) : n.type === 'profile_updated' ? (
                  <UserPen className="h-5 w-5" strokeWidth={2} />
                ) : isUserReport ? (
                  <Flag className="h-5 w-5" strokeWidth={2} />
                ) : isUserBlocked ? (
                  <Ban className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <ReactionBadge emoji={reactionEmoji} />
            </div>

            <div className="flex min-h-11 min-w-0 flex-1 flex-col justify-center gap-1">
              <p
                className={cn(
                  'truncate pr-1 text-[13px] font-medium leading-snug text-zinc-900 dark:text-white',
                  !unread && 'text-zinc-700 dark:text-slate-300'
                )}
              >
                {isMutual && (
                  <Sparkles
                    className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom text-amber-500"
                    aria-hidden
                  />
                )}
                {primary}
              </p>
              {/* Hide duplicate preview when the stacked message list is expanded */}
              {body && !(isGroup && expanded) ? (
                <p className="truncate text-[12px] leading-snug text-zinc-600 dark:text-slate-300">
                  {body}
                </p>
              ) : null}
              {reportStatus ? <ReportStatusPill status={reportStatus} /> : null}
            </div>

            <span className="shrink-0 self-start whitespace-nowrap pt-0.5 text-[10px] font-medium tabular-nums leading-none text-zinc-400 dark:text-slate-500">
              {time}
            </span>
          </div>

          {isGroup && (
            <button
              type="button"
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-slate-200"
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse messages' : 'Expand messages'}
              onPointerDown={stopExpandFromOpening}
              onMouseDown={stopExpandFromOpening}
              onClick={(e) => {
                stopExpandFromOpening(e)
                setExpanded((v) => !v)
              }}
            >
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
              />
            </button>
          )}
        </div>

        {entry.kind === 'group' && expanded && (
          <ul className="space-y-1.5 px-3 pb-2.5 pl-[3.75rem]">
            {entry.notifications.map((msg) => (
              <li
                key={msg.id}
                className="truncate text-[11px] text-zinc-600 dark:text-slate-400"
              >
                {chatPreview(msg)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
