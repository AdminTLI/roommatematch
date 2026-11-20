'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VerifiedBadge } from '@/components/verification/verified-badge'
import {
  chatHousingContextKey,
  fetchChatHousingContext,
  type ChatHousingContextPayload,
} from '@/lib/chat/fetch-chat-housing-context'
import { formatNlEuroCompact } from '@/lib/housing/format'
import { cn } from '@/lib/utils'
import {
  MessengerPaneFactRow,
  MessengerPaneHeader,
  MessengerPaneInsightList,
  MessengerPaneSection,
  MessengerPaneSectionTitle,
  paneBodyClass,
  paneFlatContentClass,
  paneMutedClass,
  paneScrollClass,
  paneShellClass,
} from './messenger-pane-chrome'
import { vibeAlignmentBarClass, vibeAlignmentTextClass } from '@/lib/chat/vibe-alignment'

interface MessengerHousingListingPaneProps {
  chatId: string
  isOpen: boolean
  onClose?: () => void
  /** insights = listing + fit; host = host-first framing (same data) */
  mode?: 'insights' | 'host'
}

function pctLabel(n: number | null | undefined): number | null {
  if (n == null || Number.isNaN(n)) return null
  return n <= 1 ? Math.round(n * 100) : Math.round(n)
}

function roomTypeLabel(roomType: string | null): string | null {
  if (!roomType) return null
  return roomType.replace(/_/g, ' ')
}

function titleCaseWords(value: string): string {
  return value
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function FitBar({
  label,
  value,
  description,
}: {
  label: string
  value: number | undefined
  description?: string | null
}) {
  if (value == null || Number.isNaN(value)) return null
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

export function MessengerHousingListingPane({
  chatId,
  isOpen,
  onClose,
  mode = 'insights',
}: MessengerHousingListingPaneProps) {
  const { data, isLoading, isFetching, error } = useQuery<ChatHousingContextPayload | null>({
    queryKey: chatHousingContextKey(chatId),
    queryFn: () => fetchChatHousingContext(chatId),
    staleTime: 60_000,
    enabled: isOpen && !!chatId,
  })

  if (!isOpen) return null

  const pending = (isLoading || isFetching) && !data
  const fitPct = pctLabel(data?.application.fit_score)
  const title = mode === 'host' ? 'Host & listing' : 'Listing & fit'
  const subtitle =
    mode === 'host'
      ? 'Who you are messaging and the home you applied for'
      : 'Your application context for this host conversation'

  return (
    <div data-messenger-housing-listing-pane className={paneShellClass}>
      <MessengerPaneHeader
        title={title}
        subtitle={subtitle}
        onClose={onClose}
        closeLabel="Close listing panel"
      />

      <div
        data-profile-pane-scroll
        className={paneScrollClass}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className={paneFlatContentClass}>
          {pending ? (
            <div className="space-y-8 pt-2">
              <div className="h-36 w-full animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
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
              Couldn&apos;t load listing details. Try again in a moment.
            </p>
          ) : (
            <>
              {data.listing.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.listing.photo_url}
                  alt=""
                  className="aspect-[16/10] w-full rounded-2xl object-cover"
                />
              ) : null}

              <MessengerPaneSection>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[1.65rem] sm:leading-snug">
                  {data.listing.title}
                </h3>
                <p className={paneMutedClass}>
                  {[data.listing.city, data.listing.address].filter(Boolean).join(' · ') ||
                    'Housing listing'}
                </p>
                {data.listing.rent_monthly != null ? (
                  <p className={cn(paneBodyClass, 'font-semibold text-slate-900 dark:text-slate-100')}>
                    {formatNlEuroCompact(data.listing.rent_monthly)}
                    /mo
                    {data.listing.utilities_included ? ' · utilities included' : ''}
                  </p>
                ) : null}
              </MessengerPaneSection>

              {data.listing.description ? (
                <MessengerPaneSection>
                  <MessengerPaneSectionTitle>About this home</MessengerPaneSectionTitle>
                  <p className={cn(paneBodyClass, 'whitespace-pre-wrap')}>
                    {data.listing.description}
                  </p>
                </MessengerPaneSection>
              ) : null}

              <div>
                <Link
                  href={`/housing/${data.listing.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View full listing
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              {fitPct != null ? (
                <MessengerPaneSection className="space-y-4">
                  <MessengerPaneSectionTitle>Your fit with this listing</MessengerPaneSectionTitle>
                  <div className="flex flex-col items-center text-center">
                    <p
                      className={cn(
                        'text-4xl font-semibold tabular-nums tracking-tight',
                        vibeAlignmentTextClass(fitPct),
                      )}
                    >
                      {fitPct}
                      <span className="text-xl font-medium text-slate-400">%</span>
                    </p>
                    <p className={cn(paneMutedClass, 'mt-1.5 max-w-xs')}>
                      {data.insights?.overall ||
                        'How your preferences line up with this home — useful talking points with the host.'}
                    </p>
                  </div>

                  {data.application.score_breakdown ? (
                    <div className="space-y-5">
                      <FitBar
                        label="Lifestyle"
                        value={data.application.score_breakdown.lifestyle}
                        description={data.insights?.lifestyle}
                      />
                      <FitBar
                        label="Budget"
                        value={data.application.score_breakdown.budget}
                        description={data.insights?.budget}
                      />
                      <FitBar
                        label="Timeline"
                        value={data.application.score_breakdown.timeline}
                        description={data.insights?.timeline}
                      />
                    </div>
                  ) : null}

                  <MessengerPaneInsightList
                    title="Worth confirming with the host"
                    items={data.application.watch_outs}
                    tone="watch"
                  />
                </MessengerPaneSection>
              ) : null}

              <MessengerPaneSection>
                <MessengerPaneSectionTitle>Listing details</MessengerPaneSectionTitle>
                <div className="space-y-4">
                  {roomTypeLabel(data.listing.room_type) ? (
                    <MessengerPaneFactRow label="Room type">
                      <span className="capitalize">
                        {roomTypeLabel(data.listing.room_type)}
                      </span>
                    </MessengerPaneFactRow>
                  ) : null}
                  {data.listing.available_from ? (
                    <MessengerPaneFactRow label="Available from">
                      {data.listing.available_from}
                    </MessengerPaneFactRow>
                  ) : null}
                  {data.listing.min_stay_months != null ? (
                    <MessengerPaneFactRow label="Minimum stay">
                      {data.listing.min_stay_months} months
                    </MessengerPaneFactRow>
                  ) : null}
                  <MessengerPaneFactRow label="Furnished">
                    {data.listing.furnished ? 'Yes' : 'No'}
                  </MessengerPaneFactRow>
                  <MessengerPaneFactRow label="Pets">
                    {data.listing.pet_friendly ? 'Allowed' : 'Not allowed'}
                  </MessengerPaneFactRow>
                  <MessengerPaneFactRow label="Smoking">
                    {data.listing.smoking_allowed ? 'Allowed' : 'Not allowed'}
                  </MessengerPaneFactRow>
                  <MessengerPaneFactRow label="Application status">
                    <span className="capitalize">
                      {String(data.application.status).replace(/_/g, ' ')}
                    </span>
                  </MessengerPaneFactRow>
                </div>
              </MessengerPaneSection>

              {data.listing.amenities.length > 0 ? (
                <MessengerPaneSection>
                  <MessengerPaneSectionTitle>Amenities</MessengerPaneSectionTitle>
                  <p className={paneBodyClass}>
                    {data.listing.amenities.map(titleCaseWords).join(' · ')}
                  </p>
                </MessengerPaneSection>
              ) : null}

              <MessengerPaneSection>
                <MessengerPaneSectionTitle>Host</MessengerPaneSectionTitle>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-indigo-200/70 dark:ring-indigo-500/30">
                    <AvatarImage src={data.host.avatar_url || undefined} alt="" />
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {data.host.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {data.host.display_name}
                      </p>
                      <VerifiedBadge verified={data.host.verified} />
                    </div>
                    <p className={paneMutedClass}>
                      {[data.host.host_type_label, data.host.company_name]
                        .filter(Boolean)
                        .join(' · ') || 'Host'}
                    </p>
                  </div>
                </div>
                {data.host.bio ? (
                  <p className={cn(paneBodyClass, 'mt-3')}>{data.host.bio}</p>
                ) : (
                  <p className={cn(paneMutedClass, 'mt-3')}>
                    No host bio yet — ask about house rules, move-in timing, and viewing options in
                    chat.
                  </p>
                )}
              </MessengerPaneSection>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
