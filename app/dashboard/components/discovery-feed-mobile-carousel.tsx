'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Users } from 'lucide-react'
import { DiscoveryCard, DISCOVERY_CARD_SHELL_HEIGHT_CLASS } from './discovery-card'
import { cn } from '@/lib/utils'

export interface DiscoveryFeedMatch {
  id: string
  userId?: string
  suggestionId?: string
  score?: number
  harmonyScore?: number
  contextScore?: number
  dimensionScores?: { [key: string]: number } | null
  otherUserUnverified?: boolean
  otherUserHarmonyIncomplete?: boolean
}

interface DiscoveryFeedMobileCarouselProps {
  matches: DiscoveryFeedMatch[]
  className?: string
  /** When false, lock harmony / dimensions until the viewer finishes the full questionnaire */
  viewerHasFullQuestionnaire?: boolean
  onSkip?: (match: DiscoveryFeedMatch) => void
  onConnect?: (match: DiscoveryFeedMatch) => void
  onUnlockQuestionnaire?: () => void
  /** Extra slide that links to /matches. Hide when a shared button sits under the cards. */
  showViewAllSlide?: boolean
}

/** One full-width slide per viewport; slight peek of the next card encourages horizontal scroll. */
const SLIDE_CLASS =
  // Keep slides visually centered (snap-center) while still allowing a small “peek”.
  // Width is relative to the scroll container (which has px-4), so it won't feel left-indented.
  'w-[calc(100%-2rem)] shrink-0 snap-center snap-always overflow-visible mx-auto'

function matchProfile(match: DiscoveryFeedMatch) {
  const rawScore = match.score || 0
  const matchPercentage =
    Math.round(rawScore * 100) > 100 ? Math.round(rawScore) : Math.round(rawScore * 100)

  return {
    id: match.userId || match.id,
    matchPercentage,
    harmonyScore: match.harmonyScore,
    contextScore: match.contextScore,
    dimensionScores: match.dimensionScores || null,
    otherUserUnverified: match.otherUserUnverified,
    otherUserHarmonyIncomplete: match.otherUserHarmonyIncomplete,
  }
}

export function DiscoveryFeedMobileCarousel({
  matches,
  className,
  viewerHasFullQuestionnaire = true,
  onSkip,
  onConnect,
  onUnlockQuestionnaire,
  showViewAllSlide = true,
}: DiscoveryFeedMobileCarouselProps) {
  const router = useRouter()
  const previewMatches = matches.slice(0, 3)

  return (
    <div className={cn('-mx-4', className)}>
      <div
        role="region"
        aria-label="Suggested matches"
        className={cn(
          'flex gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2',
          'scroll-smooth snap-x snap-mandatory scrollbar-hide',
          'scroll-px-4',
          '[-webkit-overflow-scrolling:touch]',
        )}
      >
        {previewMatches.map((match) => (
          <div key={match.id} className={SLIDE_CLASS}>
            <DiscoveryCard
              profile={matchProfile(match)}
              viewerHasFullQuestionnaire={viewerHasFullQuestionnaire}
              onSkip={onSkip ? () => onSkip(match) : undefined}
              onConnect={onConnect ? () => onConnect(match) : undefined}
              onUnlockQuestionnaire={onUnlockQuestionnaire}
            />
          </div>
        ))}

        {showViewAllSlide && (
          <button
            type="button"
            onClick={() => router.push('/matches')}
            className={cn(
              SLIDE_CLASS,
              DISCOVERY_CARD_SHELL_HEIGHT_CLASS,
              'group flex flex-col items-center justify-center rounded-2xl',
              'border border-slate-700 bg-slate-800 p-8 text-left shadow-xl',
              'transition-colors hover:border-violet-500/50 active:scale-[0.99]',
            )}
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 transition-transform duration-500 group-hover:scale-110">
              <Users className="h-10 w-10 text-violet-400" />
            </div>
            <p className="max-w-[280px] text-center text-xl font-bold leading-snug text-white">
              See everyone suggested for you
            </p>
            <p className="mt-3 max-w-[280px] text-center text-sm text-slate-400">
              Open Matches for the full list.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 group-hover:text-violet-300">
              Go to Matches
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
