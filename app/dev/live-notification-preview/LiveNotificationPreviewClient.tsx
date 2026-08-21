'use client'

import { useMemo, useState } from 'react'
import {
  LiveNotificationCard,
  type LiveNotificationCardModel,
} from '@/app/(components)/notifications/live-notification-card'

const SAMPLES: LiveNotificationCardModel[] = [
  {
    id: 'chat-1',
    type: 'chat_message',
    title: 'Tilburg University',
    message: 'Hello - are you still looking for a place near campus?',
    eyebrow: 'New Message',
    createdAtLabel: 'Just now',
    avatarUrl: '/api/avatar/programmatic?seed=tilburg-university',
  },
  {
    id: 'reaction-1',
    type: 'chat_message_reaction',
    title: 'Alex Rivera',
    message: 'Reacted to your message.',
    eyebrow: 'New Reaction',
    createdAtLabel: '1m ago',
    avatarUrl: '/api/avatar/programmatic?seed=alex-rivera',
  },
  {
    id: 'match-1',
    type: 'match_confirmed',
    title: 'You & Sam connected!',
    message: 'Tap to start chatting with an icebreaker.',
    eyebrow: 'Mutual Match',
    createdAtLabel: 'Just now',
  },
  {
    id: 'suggest-1',
    type: 'match_created',
    title: 'New suggested match - 87%',
    message: 'Based on your lifestyle and schedule compatibility.',
    eyebrow: 'New Match',
    createdAtLabel: '2m ago',
  },
  {
    id: 'alert-1',
    type: 'safety_alert',
    title: 'Safety reminder',
    message: 'Never share payment details outside Roommate Match.',
    eyebrow: 'Safety Alert',
    createdAtLabel: 'Just now',
  },
]

export function LiveNotificationPreviewClient() {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [visibleIds, setVisibleIds] = useState<string[]>(['chat-1', 'match-1'])

  const visible = useMemo(
    () => SAMPLES.filter((s) => visibleIds.includes(s.id)),
    [visibleIds]
  )

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-surface-alt))] text-zinc-900 dark:text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-8 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-300">
            Dev preview
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Live notification toast</h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-slate-300">
            Click the toast body to open. Toggle samples and viewport below.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewport === 'desktop'
                ? 'bg-violet-600 text-white'
                : 'bg-white text-zinc-700 ring-1 ring-zinc-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10'
            }`}
          >
            Desktop placement
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              viewport === 'mobile'
                ? 'bg-violet-600 text-white'
                : 'bg-white text-zinc-700 ring-1 ring-zinc-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10'
            }`}
          >
            Mobile placement
          </button>
          <button
            type="button"
            onClick={() => setVisibleIds(SAMPLES.map((s) => s.id))}
            className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-white/10"
          >
            Show all
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div
            className={`relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-slate-100 via-white to-violet-50 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/40 ${
              viewport === 'mobile' ? 'mx-auto w-full max-w-[390px]' : 'min-h-[560px]'
            }`}
            style={{ minHeight: viewport === 'mobile' ? 720 : 560 }}
          >
            <div className="absolute inset-x-0 top-0 h-12 border-b border-zinc-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex h-full items-center justify-between px-4 text-xs font-medium text-zinc-500">
                <span>Roommate Match</span>
                <span>{viewport === 'mobile' ? '390 x 844' : 'Desktop shell'}</span>
              </div>
            </div>

            <div
              className={
                viewport === 'mobile'
                  ? 'absolute inset-x-0 top-12 flex justify-center px-3 pt-3'
                  : 'absolute right-4 top-16 w-[22rem]'
              }
            >
              <div className="flex w-full max-w-[22rem] flex-col gap-3">
                {visible.map((notification) => (
                  <LiveNotificationCard
                    key={notification.id}
                    notification={notification}
                    onOpen={() => undefined}
                  />
                ))}
                {visible.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-4 py-8 text-center text-sm text-zinc-500 dark:border-white/15 dark:bg-slate-900/40 dark:text-slate-400">
                    No samples selected - use the list on the right
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
            <h2 className="text-sm font-semibold">Samples</h2>
            <ul className="space-y-2">
              {SAMPLES.map((sample) => {
                const on = visibleIds.includes(sample.id)
                return (
                  <li key={sample.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleIds((ids) =>
                          on ? ids.filter((id) => id !== sample.id) : [...ids, sample.id]
                        )
                      }
                      className={`w-full rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        on
                          ? 'bg-violet-50 text-violet-800 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:ring-violet-800'
                          : 'bg-zinc-50 text-zinc-500 ring-1 ring-transparent dark:bg-slate-800/60 dark:text-slate-400'
                      }`}
                    >
                      <span className="block font-semibold">{sample.eyebrow}</span>
                      <span className="block truncate opacity-80">{sample.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}
