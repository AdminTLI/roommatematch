'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Users,
  Heart,
  CheckCircle,
  MessageCircle,
  User,
  FileText,
  Shield,
  Home,
  FileCheck,
  AlertTriangle,
  Megaphone,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/notifications/types'
import { NOTIFICATION_CONFIG } from '@/lib/notifications/types'
import type { NotificationListEntry } from '@/types/notification'
import type { NotificationViewModel } from '@/types/notification'

const iconMap = {
  Users,
  Heart,
  CheckCircle,
  MessageCircle,
  User,
  FileText,
  Shield,
  Home,
  FileCheck,
  AlertTriangle,
  Megaphone,
} as const

function primaryActionLabel(type: Notification['type']): string {
  switch (type) {
    case 'chat_message':
      return 'Open'
    case 'group_invitation':
      return 'Open'
    case 'match_created':
    case 'match_accepted':
    case 'match_confirmed':
      return 'View'
    case 'profile_updated':
      return 'Settings'
    case 'questionnaire_completed':
      return 'Matches'
    case 'verification_status':
      return 'Verify'
    case 'housing_update':
      return 'Housing'
    case 'agreement_update':
      return 'Agreements'
    case 'safety_alert':
      return 'View'
    case 'system_announcement':
    case 'admin_alert':
      return 'Open'
    default:
      return 'Open'
  }
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
  const idx = notification.message.indexOf(':')
  const raw = idx >= 0 ? notification.message.slice(idx + 1) : notification.message
  return raw.trim()
}

type HeadlineParts = { primary: string; body: string; time: string }

function headlineForEntry(entry: NotificationListEntry): HeadlineParts {
  if (entry.kind === 'group') {
    const newest = entry.notifications[0]!
    const oldest = entry.notifications[entry.notifications.length - 1]!
    const name = parseChatSender(newest)
    const preview = chatPreview(newest)
    const count = entry.notifications.length
    const body = `${preview.slice(0, 56)}${preview.length > 56 ? '…' : ''}`
    const time =
      count > 1
        ? `${formatDistanceToNow(new Date(oldest.created_at), { addSuffix: true })} → ${formatDistanceToNow(new Date(newest.created_at), { addSuffix: true })}`
        : formatDistanceToNow(new Date(newest.created_at), { addSuffix: true })
    return {
      primary: `${name} · ${count} messages`,
      body,
      time,
    }
  }

  const n = entry.notification
  if (n.type === 'chat_message') {
    const name = parseChatSender(n)
    const preview = chatPreview(n)
    return {
      primary: `${name} messaged you`,
      body: `${preview.slice(0, 72)}${preview.length > 72 ? '…' : ''}`,
      time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
    }
  }

  if (n.type === 'system_announcement' || n.type === 'admin_alert' || n.type === 'safety_alert') {
    return {
      primary: n.title,
      body: `${n.message.slice(0, 80)}${n.message.length > 80 ? '…' : ''}`,
      time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
    }
  }

  return {
    primary: n.title,
    body: `${n.message.slice(0, 80)}${n.message.length > 80 ? '…' : ''}`,
    time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
  }
}

function avatarForEntry(
  entry: NotificationListEntry,
  viewById: Map<string, NotificationViewModel>
): { url: string | null | undefined; fallbackName: string } {
  if (entry.kind === 'group') {
    const n = entry.notifications[0]!
    const vm = viewById.get(n.id)
    return { url: vm?.sender_avatar_url, fallbackName: parseChatSender(n) }
  }
  const n = entry.notification
  if (n.type === 'chat_message') {
    const vm = viewById.get(n.id)
    return { url: vm?.sender_avatar_url, fallbackName: parseChatSender(n) }
  }
  return { url: null, fallbackName: 'System' }
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

/** Newest notification in a group (feed is ordered newest-first). */
function leadNotification(entry: NotificationListEntry): Notification {
  return entry.kind === 'single' ? entry.notification : entry.notifications[0]!
}

interface NotificationItemProps {
  entry: NotificationListEntry
  viewById: Map<string, NotificationViewModel>
  layout: 'mobile' | 'desktop'
  onOpen: (notification: Notification) => Promise<void>
  onMarkAsRead: (ids: string[]) => Promise<void>
  onDismiss: (ids: string[]) => Promise<void>
}

export function NotificationItem({
  entry,
  viewById,
  layout,
  onOpen,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) {
  const n = leadNotification(entry)
  const unread = isUnreadEntry(entry)
  const { primary, body, time } = headlineForEntry(entry)
  const { url, fallbackName } = avatarForEntry(entry, viewById)
  const Icon = typeIcon(n.type)
  const showAvatar = n.type === 'chat_message' || entry.kind === 'group'

  const [dragX, setDragX] = useState(0)
  const startX = useRef(0)

  const handleOpen = useCallback(async () => {
    const toMark = allIds(entry).filter((id) => {
      const notif =
        entry.kind === 'single'
          ? entry.notification
          : entry.notifications.find((x) => x.id === id)!
      return !notif.is_read
    })
    if (toMark.length) await onMarkAsRead(toMark)
    await onOpen(n)
  }, [entry, n, onMarkAsRead, onOpen])

  const onTouchStart = (e: React.TouchEvent) => {
    if (layout !== 'mobile') return
    startX.current = e.touches[0]!.clientX
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (layout !== 'mobile') return
    const dx = e.touches[0]!.clientX - startX.current
    if (dx > 0) setDragX(Math.min(dx, 120))
  }
  const onTouchEnd = async () => {
    if (layout !== 'mobile') return
    if (dragX > 72) {
      const ids = allIds(entry)
      await onDismiss(ids)
    }
    setDragX(0)
  }

  const action = primaryActionLabel(n.type)

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-slate-700/80 dark:bg-slate-900/40">
      {layout === 'mobile' && dragX > 8 && (
        <div
          className="absolute inset-y-0 left-0 flex w-16 items-center justify-center bg-emerald-500/90 text-[10px] font-semibold text-white"
          style={{ width: dragX }}
        >
          Read
        </div>
      )}
      <div
        style={{ transform: layout === 'mobile' ? `translateX(${dragX}px)` : undefined }}
        className={cn('transition-transform', layout === 'mobile' && 'touch-pan-y')}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={cn(
            'group/item relative flex items-center gap-2.5 px-3 py-2.5 sm:gap-[0.875rem] sm:px-4 sm:py-3',
            unread && 'bg-violet-50/50 dark:bg-violet-950/20'
          )}
        >
          <div className="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
            {showAvatar && url ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : showAvatar ? (
              <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                {fallbackName.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <span className="flex h-full w-full items-center justify-center text-violet-600 dark:text-violet-400">
                <Icon className="h-6 w-6" />
              </span>
            )}
          </div>

          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={() => void handleOpen()}
          >
            <p
              className={cn(
                'text-[13px] font-medium leading-snug text-zinc-900 dark:text-white',
                !unread && 'text-zinc-700 dark:text-slate-300'
              )}
            >
              {primary}
            </p>
            {body ? (
              <p className="mt-1 text-[11px] leading-snug text-zinc-600 dark:text-slate-300">{body}</p>
            ) : null}
            <div className="mt-2 flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0 text-zinc-400 dark:text-slate-500" aria-hidden />
              <span className="text-[10px] font-medium tabular-nums leading-snug text-zinc-400 dark:text-slate-500">
                {time}
              </span>
            </div>
          </button>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {unread && (
              <span className="h-2 w-2 rounded-full bg-violet-600 shadow-[0_0_6px_rgba(124,58,237,0.45)]" />
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className={cn(
                'h-8 shrink-0 rounded-lg bg-violet-600 text-xs font-medium text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500',
                layout === 'desktop'
                  ? 'w-[7.5rem] justify-center px-2'
                  : 'min-w-[5.625rem] justify-center px-[0.9375rem]'
              )}
              onClick={(e) => {
                e.stopPropagation()
                void handleOpen()
              }}
            >
              {action}
            </Button>
          </div>
        </div>

        {layout === 'desktop' && (
          <button
            type="button"
            className="absolute right-1 top-1 hidden h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 group-hover/item:flex dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation()
              void onDismiss(allIds(entry))
            }}
          >
            <span className="text-lg leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  )
}
