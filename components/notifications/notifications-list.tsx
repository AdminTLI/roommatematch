'use client'

import { useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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

  const handleDismiss = async (ids: string[]) => {
    const unreadIds = ids.filter((id) => {
      const row = notifications.find((n) => n.id === id)
      return row && !row.is_read
    })
    if (unreadIds.length) await onMarkAsRead(unreadIds)
  }

  const markAllDisabled = unreadTotal === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-slate-900">
      <header
        className={cn(
          'flex shrink-0 flex-col gap-3 border-b border-zinc-200 px-4 pb-3 pt-3 dark:border-slate-700/80',
          layout === 'modal' && 'pb-1'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
            Notifications
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={markAllDisabled}
              className="h-9 px-2 text-xs font-medium text-violet-700 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
              onClick={() => void onMarkAllAsRead()}
            >
              Mark all read
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 p-0 text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-slate-700/60 dark:bg-slate-800/50">
          <Label htmlFor="notif-unread-only" className="text-xs font-medium text-zinc-600 dark:text-slate-300">
            Unread only
          </Label>
          <Switch
            id="notif-unread-only"
            checked={unreadOnly}
            onCheckedChange={(v) => onUnreadOnlyChange(Boolean(v))}
          />
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-thin">
          {NOTIFICATION_FILTER_CATEGORIES.map((cat) => {
            const unread =
              cat === 'all'
                ? (counts?.unread ?? 0)
                : unreadCountForCategory(cat, byType)
            const active = category === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-600'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-500/50'
                )}
              >
                {CATEGORY_LABEL[cat]}
                {unread > 0 && (
                  <span
                    className={cn(
                      'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                      active ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-200'
                    )}
                  >
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-zinc-50/40 px-3 py-2 dark:bg-slate-950/40"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onWheel={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <p className="py-8 text-center text-xs text-zinc-500 dark:text-slate-400">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-sm font-medium text-zinc-800 dark:text-slate-100">You&apos;re caught up</p>
            <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-slate-400">
              {unreadOnly
                ? 'No unread notifications in this filter.'
                : 'New matches, messages, and updates will appear here.'}
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
                      layout={layout === 'modal' ? 'mobile' : 'desktop'}
                      onOpen={onOpen}
                      onMarkAsRead={onMarkAsRead}
                      onDismiss={handleDismiss}
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
                  className="text-xs"
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
