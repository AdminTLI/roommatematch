'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Heart,
  Home,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ScoreInfoPopover,
  scoreInfoIconTriggerBaseClass,
} from '@/components/compatibility/score-info-popover'
import {
  discoveryMatchTierLabel,
  discoveryScoreBarClass,
  discoveryScoreTextClass,
} from '@/lib/compatibility/discovery-score-visuals'
import { cn } from '@/lib/utils'

export type HostApplicationCardData = {
  id: string
  listing_id?: string
  listing_title: string
  anonymous_label: string
  fit_score: number
  cohesion_score: number
  score_breakdown: Record<string, number>
  watch_outs: string[]
  verification_badges: string[]
  group_size: number
  application_type?: string
  status: string
  hard_gates_passed: boolean
  identity_revealed: boolean
  host_chat_id?: string | null
  revealed_members?: Array<{
    first_name?: string
    last_name?: string
    verification_status?: string
  }>
}

const FIT_DIMENSIONS: Array<{
  key: string
  label: string
  hint: string
  group: 'living' | 'practical'
}> = [
  {
    key: 'lifestyle',
    label: 'Living habits',
    hint: 'Cleanliness, quiet hours, guests, and daily rhythm',
    group: 'living',
  },
  {
    key: 'budget',
    label: 'Rent vs budget',
    hint: 'Whether their budget covers your monthly rent',
    group: 'practical',
  },
  {
    key: 'capacity',
    label: 'Group size',
    hint: 'Whether the number of people fits the rooms you offer',
    group: 'practical',
  },
  {
    key: 'timeline',
    label: 'Move-in overlap',
    hint: 'How well their dates line up with your availability',
    group: 'practical',
  },
  {
    key: 'amenities',
    label: 'Home features',
    hint: 'Match to amenities they care about',
    group: 'practical',
  },
]

const STATUS_COPY: Record<string, string> = {
  submitted: 'New',
  under_review: 'In review',
  shortlisted: 'Shortlisted',
  accepted: 'Chatting',
  offer_pending: 'Offer sent',
  offer_accepted: 'Offer accepted',
  offer_declined: 'Offer declined',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const SHELL =
  'h-[34rem] min-h-[34rem] max-h-[34rem] shrink-0 sm:h-[36rem] sm:min-h-[36rem] sm:max-h-[36rem]'

function pct(value: number | null | undefined) {
  return Math.round(Number(value || 0) * 100)
}

function averagePct(values: number[]) {
  if (!values.length) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

type HostApplicationCardProps = {
  app: HostApplicationCardData
  rejectId: string | null
  reason: string
  reasonOptions: readonly string[]
  acceptLabel?: string
  rejectLabel?: string
  onReasonChange: (value: string) => void
  onShortlist: () => void
  onAccept: () => void
  onSendOffer: () => void
  onRejectOpen: () => void
  onRejectConfirm: () => void
  onRejectCancel: () => void
}

export function HostApplicationCard({
  app,
  rejectId,
  reason,
  reasonOptions,
  acceptLabel = 'Accept & chat',
  rejectLabel = 'Not a fit',
  onReasonChange,
  onShortlist,
  onAccept,
  onSendOffer,
  onRejectOpen,
  onRejectConfirm,
  onRejectCancel,
}: HostApplicationCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const fit = pct(app.fit_score)
  const cohesion = pct(app.cohesion_score)
  const statusLabel = STATUS_COPY[app.status] || app.status.replace(/_/g, ' ')

  const dimensions = useMemo(() => {
    const mapped = FIT_DIMENSIONS.map((dim) => ({
      ...dim,
      value: pct(app.score_breakdown?.[dim.key]),
      present: Boolean(app.score_breakdown && dim.key in app.score_breakdown),
    })).filter((d) => d.present)

    if (mapped.length) return mapped

    return Object.entries(app.score_breakdown || {}).map(([key, value]) => ({
      key,
      label: key.replace(/_/g, ' '),
      hint: '',
      group: 'practical' as const,
      value: pct(value),
      present: true,
    }))
  }, [app.score_breakdown])

  const livingScore = averagePct(
    dimensions.filter((d) => d.group === 'living').map((d) => d.value)
  )
  const practicalScore = averagePct(
    dimensions.filter((d) => d.group === 'practical').map((d) => d.value)
  )

  const highlights = useMemo(() => {
    return [...dimensions]
      .sort((a, b) => b.value - a.value)
      .filter((d) => d.value >= 70)
      .slice(0, 3)
      .map((d) => `Strong on ${d.label.toLowerCase()}`)
  }, [dimensions])

  const watchItems = useMemo(() => {
    const fromScores = [...dimensions]
      .sort((a, b) => a.value - b.value)
      .filter((d) => d.value < 60)
      .slice(0, 2)
      .map((d) => `Check ${d.label.toLowerCase()}`)

    const notes = [
      ...(app.watch_outs || []),
      ...(!app.hard_gates_passed ? ['Some house rules may conflict'] : []),
      ...(app.verification_badges || []).map((b) => b.replace(/_/g, ' ')),
      ...fromScores,
    ]
    return Array.from(new Set(notes)).slice(0, 3)
  }, [app.watch_outs, app.hard_gates_passed, app.verification_badges, dimensions])

  const terminal =
    app.status === 'rejected' ||
    app.status === 'withdrawn' ||
    app.status === 'offer_accepted' ||
    app.status === 'offer_declined'
  const canShortlist =
    !terminal &&
    app.status !== 'shortlisted' &&
    app.status !== 'accepted' &&
    app.status !== 'offer_pending'
  const canAccept =
    !terminal && app.status !== 'accepted' && app.status !== 'offer_pending'
  const canSendOffer = app.status === 'accepted'
  const canReject = !terminal && app.status !== 'rejected'
  const showRejectPanel = rejectId === app.id

  return (
    <div className={cn('w-full', SHELL)} style={{ perspective: '1200px' }}>
      <div
        className={cn('relative h-full w-full', SHELL)}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s ease-in-out',
        }}
      >
        {/* Front */}
        <div
          className={cn('absolute inset-0 flex w-full flex-col', isFlipped && 'pointer-events-none')}
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(6px)' }}
          aria-hidden={isFlipped}
        >
          <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="relative shrink-0 bg-gradient-to-b from-violet-100/95 via-indigo-50/80 to-white px-5 pb-4 pt-6 text-center dark:from-violet-600/20 dark:via-transparent dark:to-transparent">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {app.anonymous_label}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {app.listing_title}
                {' · '}
                {app.group_size === 1 ? '1 person' : `Group of ${app.group_size}`}
                {' · '}
                {statusLabel}
              </p>
              <p className={cn('mt-4 text-5xl font-black tracking-tight', discoveryScoreTextClass(fit))}>
                {fit}%
              </p>
              <div className="mt-3">
                <span
                  className={cn(
                    'rounded-full bg-violet-100/90 px-3 py-1 text-sm font-semibold dark:bg-slate-700/50',
                    discoveryScoreTextClass(fit)
                  )}
                >
                  {discoveryMatchTierLabel(fit)} house fit
                </span>
              </div>
            </div>

            <div className="shrink-0 space-y-3.5 px-5 py-3">
              <ScoreRow
                icon={
                  <ScoreInfoPopover
                    title="Living habits"
                    description="How well their day-to-day preferences match the living style you set for this home."
                  >
                    <button
                      type="button"
                      className={cn(
                        scoreInfoIconTriggerBaseClass,
                        'text-pink-600 hover:bg-violet-100/90 hover:text-pink-700 dark:text-pink-400 dark:hover:bg-slate-700/50'
                      )}
                      aria-label="What is living habits?"
                    >
                      <Heart className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </ScoreInfoPopover>
                }
                label="Living habits"
                value={livingScore || fit}
              />
              <ScoreRow
                icon={
                  <ScoreInfoPopover
                    title="Practical fit"
                    description="Rent vs budget, group size, move-in dates, and home features combined."
                  >
                    <button
                      type="button"
                      className={cn(
                        scoreInfoIconTriggerBaseClass,
                        'text-blue-600 hover:bg-indigo-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50'
                      )}
                      aria-label="What is practical fit?"
                    >
                      <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </ScoreInfoPopover>
                }
                label="Practical fit"
                value={practicalScore || fit}
              />
              {app.group_size > 1 ? (
                <p className="text-[11px] leading-snug text-slate-500">
                  Group gets along: <span className="font-semibold tabular-nums">{cohesion}%</span>
                </p>
              ) : null}
            </div>

            <div className="shrink-0 px-5 pb-3">
              <Button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="h-10 w-full rounded-xl bg-indigo-500 font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600"
              >
                View details
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-2">
              {highlights.length > 0 ? (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Why they fit
                  </h4>
                  <ul className="space-y-1.5">
                    {highlights.map((item) => (
                      <li key={item} className="grid grid-cols-[auto_1fr] gap-x-2">
                        <span className="text-sm text-emerald-600" aria-hidden>
                          ✓
                        </span>
                        <span className="text-sm leading-tight text-slate-700 dark:text-slate-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {watchItems.length > 0 ? (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Worth checking
                  </h4>
                  <ul className="space-y-1.5">
                    {watchItems.map((item) => (
                      <li key={item} className="grid grid-cols-[auto_1fr] gap-x-2">
                        <span className="text-sm text-slate-400" aria-hidden>
                          •
                        </span>
                        <span className="text-sm leading-tight text-slate-600 dark:text-slate-400">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-700/80">
              {canReject ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onRejectOpen}
                  className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  {rejectLabel}
                </Button>
              ) : null}
              {canAccept ? (
                <Button
                  type="button"
                  onClick={onAccept}
                  className="h-10 flex-[1.35] rounded-xl bg-indigo-500 font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600"
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  {acceptLabel}
                </Button>
              ) : canSendOffer ? (
                <Button
                  type="button"
                  onClick={onSendOffer}
                  className="h-10 flex-[1.35] rounded-xl bg-indigo-500 font-semibold text-white hover:bg-indigo-600"
                >
                  Send offer
                </Button>
              ) : canShortlist ? (
                <Button
                  type="button"
                  onClick={onShortlist}
                  className="h-10 flex-[1.35] rounded-xl bg-indigo-500 font-semibold text-white hover:bg-indigo-600"
                >
                  Shortlist
                </Button>
              ) : null}
            </div>

            {showRejectPanel ? (
              <div className="shrink-0 space-y-2 border-t border-slate-100 px-3 py-3 dark:border-slate-700/80">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  value={reason}
                  onChange={(e) => onReasonChange(e.target.value)}
                >
                  {reasonOptions.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" className="flex-1" onClick={onRejectConfirm}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={onRejectCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Back */}
        <div
          className={cn('absolute inset-0 h-full w-full', !isFlipped && 'pointer-events-none')}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(6px)',
          }}
          aria-hidden={!isFlipped}
        >
          <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <div className="shrink-0 px-5 pb-3 pt-5">
              <div className="mb-1 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/80">
                  <Home className="h-5 w-5 text-slate-700 dark:text-slate-200" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Fit breakdown
                  </h3>
                  <p className="truncate text-sm text-slate-500">{app.anonymous_label}</p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
              {!app.hard_gates_passed ? (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                    Some house rules may conflict with this applicant.
                  </p>
                </div>
              ) : null}

              <div className="space-y-3">
                {dimensions.map((dim) => (
                  <div key={dim.key} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                          {dim.label}
                        </p>
                        {dim.hint ? (
                          <p className="truncate text-[11px] text-slate-400">{dim.hint}</p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-sm font-semibold tabular-nums',
                          discoveryScoreTextClass(dim.value)
                        )}
                      >
                        {dim.value}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={cn('h-full rounded-full', discoveryScoreBarClass(dim.value))}
                        style={{ width: `${dim.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {app.group_size > 1 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Group cohesion:{' '}
                  <span className="font-semibold tabular-nums">{cohesion}%</span>
                </p>
              ) : null}

              {app.identity_revealed && app.revealed_members?.length ? (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Identity revealed
                  </h4>
                  <ul className="space-y-1.5">
                    {app.revealed_members.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {m.first_name} {m.last_name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-500">
                  Names stay hidden until you Accept & chat.
                </p>
              )}
            </div>

            <div className="flex shrink-0 gap-2 border-t border-slate-100 p-3 dark:border-slate-700/80">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFlipped(false)}
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-100 font-semibold dark:border-slate-600 dark:bg-slate-700/50"
              >
                Back
              </Button>
              {canShortlist ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onShortlist}
                  className="h-10 flex-1 rounded-xl font-semibold"
                >
                  Shortlist
                </Button>
              ) : null}
              {canAccept ? (
                <Button
                  type="button"
                  onClick={onAccept}
                  className="h-10 flex-1 rounded-xl bg-indigo-500 font-semibold text-white hover:bg-indigo-600"
                >
                  Accept
                </Button>
              ) : canSendOffer ? (
                <Button
                  type="button"
                  onClick={onSendOffer}
                  className="h-10 flex-1 rounded-xl bg-indigo-500 font-semibold text-white hover:bg-indigo-600"
                >
                  Send offer
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: number
}) {
  const score = Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          {icon}
          <span className="truncate pl-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </span>
        </div>
        <span
          className={cn(
            'shrink-0 text-sm font-bold tabular-nums',
            discoveryScoreTextClass(score)
          )}
        >
          {score}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', discoveryScoreBarClass(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
