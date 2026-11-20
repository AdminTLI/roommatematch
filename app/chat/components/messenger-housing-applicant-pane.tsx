'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import {
  chatHousingContextKey,
  fetchChatHousingContext,
  type ChatHousingContextPayload,
} from '@/lib/chat/fetch-chat-housing-context'
import { explainHostGateConflicts } from '@/lib/housing/host-listing-fit-insights'
import { cn } from '@/lib/utils'
import {
  MessengerPaneFactRow,
  MessengerPaneHeader,
  MessengerPaneInsightList,
  MessengerPaneSection,
  MessengerPaneSectionTitle,
  paneBodyClass,
  paneMutedClass,
  paneScrollClass,
  paneShellClass,
} from './messenger-pane-chrome'
import { VibeAlignmentRing } from './vibe-alignment-ring'
import {
  vibeAlignmentBand,
  vibeAlignmentBarClass,
  vibeAlignmentSubtitle,
  vibeAlignmentTextClass,
} from '@/lib/chat/vibe-alignment'

interface MessengerHousingApplicantPaneProps {
  chatId: string
  isOpen: boolean
  onClose?: () => void
}

const paneContentClass =
  'w-full space-y-10 px-5 pb-[max(8rem,calc(env(safe-area-inset-bottom,0px)+5rem))] pt-1 sm:px-6'

function pctLabel(n: number | null | undefined): number | null {
  if (n == null || Number.isNaN(n)) return null
  return n <= 1 ? Math.round(n * 100) : Math.round(n)
}

function formatDegreeLevel(level: string | null | undefined): string | null {
  if (!level || typeof level !== 'string') return null
  const trimmed = level.trim()
  if (!trimmed) return null
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

const HOST_FIT_DIMENSIONS: Array<{
  key: 'lifestyle' | 'budget' | 'timeline' | 'capacity' | 'amenities' | 'cohesion'
  label: string
  insightKey: 'lifestyle' | 'budget' | 'timeline' | 'capacity' | 'amenities' | 'cohesion'
  hideWhenSolo?: boolean
}> = [
  { key: 'lifestyle', label: 'Living habits', insightKey: 'lifestyle' },
  { key: 'budget', label: 'Rent vs budget', insightKey: 'budget' },
  { key: 'timeline', label: 'Move-in overlap', insightKey: 'timeline' },
  { key: 'capacity', label: 'Group size fit', insightKey: 'capacity' },
  { key: 'amenities', label: 'Home features', insightKey: 'amenities' },
  { key: 'cohesion', label: 'Group cohesion', insightKey: 'cohesion', hideWhenSolo: true },
]

function FitBar({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description?: string | null
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
        <span className={cn('text-sm font-bold tabular-nums', vibeAlignmentTextClass(value))}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn('h-full rounded-full transition-all duration-500', vibeAlignmentBarClass(value))}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {description ? <p className={paneMutedClass}>{description}</p> : null}
    </div>
  )
}

export function MessengerHousingApplicantPane({
  chatId,
  isOpen,
  onClose,
}: MessengerHousingApplicantPaneProps) {
  const { data, isLoading, isFetching, error } = useQuery<ChatHousingContextPayload | null>({
    queryKey: chatHousingContextKey(chatId),
    queryFn: () => fetchChatHousingContext(chatId),
    staleTime: 60_000,
    enabled: isOpen && !!chatId,
  })

  const gateExplanations = useMemo(() => {
    const conflicts = data?.application.gate_conflicts || []
    if (conflicts.length) return explainHostGateConflicts(conflicts)
    if (data?.applicant && !data.applicant.hard_gates_passed) {
      return [
        'One or more of your hard house rules (for example smoking, pets, short-lets, or group size) do not match this applicant. Check the watch-outs below for the specific mismatch.',
      ]
    }
    return []
  }, [data?.application.gate_conflicts, data?.applicant])

  if (!isOpen) return null

  const pending = (isLoading || isFetching) && !data
  const fitPct = pctLabel(data?.application.fit_score)
  const applicant = data?.applicant
  const groupSize = applicant?.group_size ?? 1
  const breakdown = data?.application.score_breakdown
  const dimensions = HOST_FIT_DIMENSIONS.map((dim) => {
    if (dim.hideWhenSolo && groupSize <= 1) return null
    const raw = breakdown?.[dim.key]
    if (raw == null || Number.isNaN(raw)) return null
    return {
      ...dim,
      value: pctLabel(raw) ?? 0,
      description: data?.insights?.[dim.insightKey] || null,
    }
  }).filter(Boolean) as Array<{
    key: string
    label: string
    value: number
    description?: string | null
  }>

  const studiesLine = applicant
    ? [
        formatDegreeLevel(applicant.degree_level),
        applicant.program,
        applicant.university,
        applicant.study_year ? `started ${applicant.study_year}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  const hasAbout =
    Boolean(applicant?.bio) ||
    Boolean(studiesLine) ||
    Boolean(applicant?.interests?.length) ||
    Boolean(applicant?.motivation_letter)

  return (
    <div data-messenger-housing-applicant-pane className={paneShellClass}>
      <MessengerPaneHeader
        title="Applicant fit"
        subtitle="Why this applicant fits (or doesn't) with your listing"
        onClose={onClose}
        closeLabel="Close applicant fit panel"
      />

      <div
        data-profile-pane-scroll
        className={paneScrollClass}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className={paneContentClass}>
          {pending ? (
            <div className="space-y-8 pt-2">
              <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <div className="mx-auto h-4 w-40 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          ) : error || !data ? (
            <p className={`${paneMutedClass} py-12 text-center`}>
              Couldn&apos;t load fit details. Try again in a moment.
            </p>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                {fitPct != null ? (
                  <>
                    <VibeAlignmentRing percent={fitPct} />
                    <p
                      className={cn(
                        'mt-4 text-sm font-semibold',
                        vibeAlignmentTextClass(fitPct),
                      )}
                    >
                      {vibeAlignmentBand(fitPct)}
                    </p>
                    <p className="mx-auto mt-1.5 max-w-md text-sm leading-snug text-slate-500 dark:text-slate-400">
                      {data.insights?.overall || vibeAlignmentSubtitle(fitPct)}
                    </p>
                  </>
                ) : (
                  <p className={paneMutedClass}>
                    Fit details will appear once this application has been scored.
                  </p>
                )}
              </div>

              {dimensions.length > 0 ? (
                <MessengerPaneSection className="space-y-5">
                  <MessengerPaneSectionTitle>Breakdown</MessengerPaneSectionTitle>
                  {dimensions.map((dim) => (
                    <FitBar
                      key={dim.key}
                      label={dim.label}
                      value={dim.value}
                      description={dim.description}
                    />
                  ))}
                </MessengerPaneSection>
              ) : null}

              {gateExplanations.length > 0 ? (
                <MessengerPaneSection>
                  <MessengerPaneSectionTitle>House rule conflicts</MessengerPaneSectionTitle>
                  <p className={cn(paneMutedClass, 'mb-3')}>
                    Hard house rules are deal-breakers you set on the listing (smoking, pets,
                    short-lets, max group size). A conflict means something in their preferences
                    clashes with those rules.
                  </p>
                  <MessengerPaneInsightList
                    title="What conflicts"
                    items={gateExplanations}
                    tone="watch"
                  />
                </MessengerPaneSection>
              ) : applicant?.hard_gates_passed ? (
                <MessengerPaneSection>
                  <MessengerPaneSectionTitle>House rules</MessengerPaneSectionTitle>
                  <p className={paneBodyClass}>
                    They pass your hard house rules: no smoking, pets, short-let, or group-size
                    deal-breakers detected against this listing.
                  </p>
                </MessengerPaneSection>
              ) : null}

              <MessengerPaneInsightList
                title="Worth confirming in chat"
                items={data.application.watch_outs}
                tone="watch"
              />

              {hasAbout ? (
                <MessengerPaneSection>
                  <MessengerPaneSectionTitle>About them</MessengerPaneSectionTitle>
                  <div className="space-y-4">
                    {studiesLine ? (
                      <MessengerPaneFactRow label="Studies">{studiesLine}</MessengerPaneFactRow>
                    ) : null}
                    {applicant?.interests?.length ? (
                      <MessengerPaneFactRow label="Hobbies & interests">
                        {applicant.interests.join(' · ')}
                      </MessengerPaneFactRow>
                    ) : null}
                    {applicant?.bio ? (
                      <MessengerPaneFactRow label="Bio">
                        <p className={cn(paneBodyClass, 'whitespace-pre-wrap')}>{applicant.bio}</p>
                      </MessengerPaneFactRow>
                    ) : null}
                    {applicant?.motivation_letter ? (
                      <MessengerPaneFactRow label="Their note to you">
                        <p className={cn(paneBodyClass, 'whitespace-pre-wrap')}>
                          {applicant.motivation_letter}
                        </p>
                      </MessengerPaneFactRow>
                    ) : null}
                  </div>
                </MessengerPaneSection>
              ) : null}

              {applicant?.verification_badges?.length ? (
                <MessengerPaneSection>
                  <MessengerPaneSectionTitle>Verification</MessengerPaneSectionTitle>
                  <p className={paneBodyClass}>
                    {applicant.verification_badges.map((b) => b.replace(/_/g, ' ')).join(' · ')}
                  </p>
                </MessengerPaneSection>
              ) : null}

              <MessengerPaneSection>
                <Link
                  href={`/host/applications?listing=${data.listing.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Open applications for this listing
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </MessengerPaneSection>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
