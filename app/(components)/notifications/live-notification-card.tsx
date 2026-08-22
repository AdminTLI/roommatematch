'use client'

import {
  AlertTriangle,
  Ban,
  CheckCircle,
  FileCheck,
  FileText,
  Flag,
  Home,
  Megaphone,
  MessageCircle,
  Shield,
  Smile,
  Sparkles,
  UserCheck,
  UserPen,
  Users,
} from 'lucide-react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/notifications/types'
import { NOTIFICATION_CONFIG } from '@/lib/notifications/types'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
})

const iconMap = {
  Users,
  UserCheck,
  UserPen,
  CheckCircle,
  MessageCircle,
  Smile,
  FileText,
  Shield,
  Home,
  FileCheck,
  AlertTriangle,
  Megaphone,
  Flag,
  Ban,
  Sparkles,
} as const

export type LiveNotificationTone =
  | 'message'
  | 'reaction'
  | 'match'
  | 'mutual'
  | 'system'
  | 'alert'

export interface LiveNotificationCardModel {
  id: string
  type: Notification['type']
  title: string
  message: string
  eyebrow?: string
  avatarUrl?: string | null
  createdAtLabel?: string
  tone?: LiveNotificationTone
  /** Optional metadata flags used for icon tinting (reports, etc.) */
  metaKind?: string | null
}

interface LiveNotificationCardProps {
  notification: LiveNotificationCardModel
  onOpen: () => void
  className?: string
}

function toneForType(type: Notification['type']): LiveNotificationTone {
  switch (type) {
    case 'chat_message':
      return 'message'
    case 'chat_message_reaction':
      return 'reaction'
    case 'match_confirmed':
      return 'mutual'
    case 'match_created':
    case 'match_accepted':
    case 'group_invitation':
      return 'match'
    case 'safety_alert':
    case 'admin_alert':
      return 'alert'
    default:
      return 'system'
  }
}

function avatarClasses(tone: LiveNotificationTone, metaKind?: string | null): string {
  if (metaKind === 'user_report') {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
  }
  if (metaKind === 'user_blocked') {
    return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
  }
  switch (tone) {
    case 'mutual':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
    case 'match':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
    case 'alert':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
    case 'reaction':
    case 'message':
      return 'bg-zinc-100/90 text-violet-600 dark:bg-slate-800/80 dark:text-violet-400'
    default:
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
  }
}

function defaultEyebrow(type: Notification['type'], tone: LiveNotificationTone): string {
  switch (type) {
    case 'chat_message':
      return 'New Message'
    case 'chat_message_reaction':
      return 'New Reaction'
    case 'match_confirmed':
      return 'Mutual Match'
    case 'match_created':
      return 'New Match'
    case 'match_accepted':
      return 'Match Accepted'
    case 'group_invitation':
      return 'Group Invite'
    case 'profile_updated':
      return 'Profile Update'
    case 'safety_alert':
      return 'Safety Alert'
    case 'system_announcement':
    case 'admin_alert':
      return 'Announcement'
    default:
      return tone === 'alert' ? 'Important' : 'Notification'
  }
}

/** Same icon choices as the notifications panel. */
function TypeIcon({
  type,
  metaKind,
}: {
  type: Notification['type']
  metaKind?: string | null
}) {
  if (metaKind === 'user_report') return <Flag className="h-5 w-5" strokeWidth={2} />
  if (metaKind === 'user_blocked') return <Ban className="h-5 w-5" strokeWidth={2} />
  if (type === 'match_created') return <Users className="h-5 w-5" strokeWidth={2} />
  if (type === 'match_accepted') return <UserCheck className="h-5 w-5" strokeWidth={2} />
  if (type === 'match_confirmed') return <Sparkles className="h-5 w-5" strokeWidth={2} />
  if (type === 'profile_updated') return <UserPen className="h-5 w-5" strokeWidth={2} />

  const cfg = NOTIFICATION_CONFIG[type as keyof typeof NOTIFICATION_CONFIG]
  const key = (cfg?.icon ?? 'MessageCircle') as keyof typeof iconMap
  const Icon = iconMap[key] ?? MessageCircle
  return <Icon className="h-5 w-5" strokeWidth={2} />
}

export function LiveNotificationCard({
  notification,
  onOpen,
  className,
}: LiveNotificationCardProps) {
  const tone = notification.tone ?? toneForType(notification.type)
  const usePhoto =
    notification.type === 'chat_message' || notification.type === 'chat_message_reaction'
  const eyebrow = notification.eyebrow ?? defaultEyebrow(notification.type, tone)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${eyebrow}: ${notification.title}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        plusJakarta.className,
        'relative w-full cursor-pointer rounded-2xl border border-zinc-200/80 bg-white/95 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.28)] outline-none backdrop-blur-xl transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:border-white/10 dark:bg-slate-900/92 dark:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.55)] dark:hover:bg-slate-900',
        className
      )}
    >
      <div className="flex items-center gap-3 px-3.5 py-3.5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full',
            avatarClasses(tone, notification.metaKind)
          )}
          aria-hidden
        >
          {usePhoto && notification.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote / programmatic avatars
            <img src={notification.avatarUrl} alt="" className="h-full w-full object-cover object-center" />
          ) : (
            <TypeIcon type={notification.type} metaKind={notification.metaKind} />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[11px] font-semibold leading-normal text-violet-600 dark:text-violet-300">
              {eyebrow}
            </p>
            {notification.createdAtLabel ? (
              <span className="shrink-0 text-[10px] font-medium tabular-nums leading-normal text-zinc-400 dark:text-slate-500">
                {notification.createdAtLabel}
              </span>
            ) : null}
          </div>

          <p className="truncate text-[13px] font-semibold leading-normal text-zinc-900 dark:text-white">
            {notification.title}
          </p>
          {notification.message ? (
            <p className="line-clamp-2 text-[12px] leading-normal text-zinc-600 dark:text-slate-300">
              {notification.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
