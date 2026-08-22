'use client'

import { useMemo, useRef } from 'react'
import { CheckCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/notifications/types'
import type { NotificationCounts } from '@/lib/notifications/types'
import {
  NOTIFICATION_FILTER_CATEGORIES,
  type NotificationFilterCategory,
  CATEGORY_LABEL,
} from '@/types/notification'
import { unreadCountForCategory } from '@/services/notificationsService'
import {
  buildNotificationListEntries,
  groupEntriesByTime,
  TIME_GROUP_LABEL,
} from '@/services/notificationsService'
import type { NotificationListEntry } from '@/types/notification'
import type { NotificationViewModel } from '@/types/notification'
import { NotificationItem } from './notification-item'

export interface NotificationsListProps {
  layout: 'modal' | 'panel'
  notifications: NotificationViewModel[]
  counts: NotificationCounts | null
  isLoading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  category: NotificationFilterCategory
  onCategoryChange: (c: NotificationFilterCategory) => void
  unreadOnly: boolean
  onUnreadOnlyChange: (value: boolean) => void
  onClose: () => void
  onMarkAllAsRead: () => Promise<void>
  onMarkAsRead: (ids: string[]) => Promise<void>
  onOpen: (notification: Notification) => Promise<void>
  unreadTotal: number
  listScrollRef?: React.RefObject<HTMLDivElement | null>
}

export function NotificationsList({
  layout,
  notifications,
  counts,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  category,
  onCategoryChange,
  unreadOnly,
  onUnreadOnlyChange,
  onClose,
  onMarkAllAsRead,
  onMarkAsRead,
  onOpen,
  unreadTotal,
  listScrollRef,
}: NotificationsListProps) {
  const internalRef = useRef<HTMLDivElement>(null)
  const scrollRef = listScrollRef ?? internalRef

  const viewById = useMemo(() => {
    const m = new Map<string, NotificationViewModel>()
    for (const n of notifications) m.set(n.id, n)
    return m
  }, [notifications])

  const entries = useMemo(() => buildNotificationListEntries(notifications), [notifications])
  const grouped = useMemo(() => groupEntriesByTime(entries), [entries])

  const byType = counts?.by_type as Record<string, { total: number; unread: number }> | undefined

  const hasUnreadInList = notifications.some((n) => !n.is_read)
  const markAllDisabled = unreadTotal === 0 && !hasUnreadInList
  const isMobile = layout === 'modal'

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-transparent">
      <header
        className={cn(
          'flex shrink-0 flex-col gap-2.5 border-b border-white/40 px-4 pb-3 pt-3 dark:border-white/10',
          isMobile && 'pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
              Notifications
            </h2>
            {unreadTotal > 0 && (
              <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800 dark:bg-violet-950/70 dark:text-violet-200">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 rounded-full p-0 text-zinc-500 hover:bg-white/40 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="flex w-full gap-1 overflow-x-auto rounded-full bg-zinc-100/80 p-1 [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-slate-800/55 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Notification categories"
        >
          {NOTIFICATION_FILTER_CATEGORIES.map((cat) => {
            const unread =
              cat === 'all' ? (counts?.unread ?? 0) : unreadCountForCategory(cat, byType)
            const active = category === cat
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  'flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs',
                  isMobile ? 'min-h-[40px] py-2' : 'min-h-[34px] py-1.5',
                  active
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
                    : 'bg-transparent text-zinc-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10'
                )}
              >
                <span>{CATEGORY_LABEL[cat]}</span>
                {unread > 0 && (
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tabular-nums',
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-200'
                    )}
                  >
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-pressed={unreadOnly}
            onClick={() => onUnreadOnlyChange(!unreadOnly)}
            className={cn(
              'inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors',
              unreadOnly
                ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                : 'border-violet-200 bg-violet-50 text-violet-800 hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/40 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-950/80'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                unreadOnly ? 'bg-white' : 'bg-violet-600 dark:bg-violet-300'
              )}
              aria-hidden
            />
            Unread only
          </button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={markAllDisabled}
            title="Mark all as read"
            aria-label="Mark all as read"
            className="h-9 gap-1.5 px-2.5 text-xs font-medium text-violet-700 hover:bg-white/40 hover:text-violet-800 disabled:opacity-40 dark:text-violet-300 dark:hover:bg-white/10 dark:hover:text-violet-200"
            onClick={() => void onMarkAllAsRead()}
          >
            <CheckCheck className="h-4 w-4" aria-hidden />
            Mark all read
          </Button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain bg-transparent px-3 py-2',
          isMobile && 'pb-[max(1rem,env(safe-area-inset-bottom))]'
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
        onWheel={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <p className="py-8 text-center text-xs text-zinc-500 dark:text-slate-400">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-sm font-medium text-zinc-800 dark:text-slate-100">
              You&apos;re caught up
            </p>
            <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-slate-400">
              {unreadOnly
                ? 'No unread notifications in this filter.'
                : 'New matches, messages, and alerts will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {grouped.map((section) => (
              <section key={section.key}>
                <p className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-slate-500">
                  {TIME_GROUP_LABEL[section.key]}
                </p>
                <div className="flex flex-col gap-2">
                  {section.entries.map((entry: NotificationListEntry, idx) => (
                    <NotificationItem
                      key={
                        entry.kind === 'single'
                          ? entry.notification.id
                          : `${entry.notifications[0]!.id}-grp-${idx}`
                      }
                      entry={entry}
                      viewById={viewById}
                      layout={isMobile ? 'mobile' : 'desktop'}
                      onOpen={onOpen}
                      onMarkAsRead={onMarkAsRead}
                    />
                  ))}
                </div>
              </section>
            ))}

            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] border-white/50 bg-white/40 text-xs backdrop-blur-sm dark:border-white/10 dark:bg-white/5 sm:min-h-0"
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
