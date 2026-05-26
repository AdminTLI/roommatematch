'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Users } from 'lucide-react'
import { DiscoveryCard } from './discovery-card'
import { cn } from '@/lib/utils'

export interface DiscoveryFeedMatch {
  id: string
  userId?: string
  name?: string
  score?: number
  harmonyScore?: number
  contextScore?: number
  dimensionScores?: { [key: string]: number } | null
}

interface DiscoveryFeedMobileCarouselProps {
  matches: DiscoveryFeedMatch[]
  className?: string
}

/** One full-width slide per viewport; slight peek of the next card encourages horizontal scroll. */
const SLIDE_CLASS =
  'w-[min(100%,calc(100vw-2.5rem))] shrink-0 snap-start snap-always overflow-visible'

function matchProfile(match: DiscoveryFeedMatch) {
  const rawScore = match.score || 0
  const matchPercentage =
    Math.round(rawScore * 100) > 100 ? Math.round(rawScore) : Math.round(rawScore * 100)

  return {
    id: match.userId || match.id,
    name: match.name,
    matchPercentage,
    harmonyScore: match.harmonyScore,
    contextScore: match.contextScore,
    dimensionScores: match.dimensionScores || null,
  }
}

export function DiscoveryFeedMobileCarousel({
  matches,
  className,
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
          '[-webkit-overflow-scrolling:touch]',
        )}
      >
        {previewMatches.map((match) => (
          <div key={match.id} className={SLIDE_CLASS}>
            <DiscoveryCard profile={matchProfile(match)} />
          </div>
        ))}

        <button
          type="button"
          onClick={() => router.push('/matches')}
          className={cn(
            SLIDE_CLASS,
            'group flex min-h-[20rem] flex-col items-center justify-center rounded-2xl',
            'border border-slate-700 bg-slate-800 p-8 text-left shadow-xl',
            'transition-colors hover:border-violet-500/50 active:scale-[0.99]',
          )}
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 transition-transform duration-500 group-hover:scale-110">
            <Users className="h-10 w-10 text-violet-400" />
          </div>
          <p className="max-w-[280px] text-center text-xl font-bold leading-snug text-white">
            To find more matches, click here
          </p>
          <p className="mt-3 max-w-[280px] text-center text-sm text-slate-400">
            View all your suggestions on the matches page.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 group-hover:text-violet-300">
            Go to matches
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>
    </div>
  )
}
