'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, UserPlus, Zap, Heart, Users, MessageCircle, LucideIcon, Droplets, Volume2, Moon, Coffee, BookOpen, Home, Sparkles, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreInfoPopover, scoreInfoIconTriggerBaseClass } from '@/components/compatibility/score-info-popover'
import {
  discoveryMatchTierLabel,
  discoveryScoreBarClass,
  discoveryScoreTextClass,
} from '@/lib/compatibility/discovery-score-visuals'
import { cn } from '@/lib/utils'

interface DiscoveryCardProps {
    profile: {
        id: string
        name?: string // Optional - not displayed for anonymization
        matchPercentage?: number
        harmonyScore?: number
        contextScore?: number
        compatibilityHighlights?: string[]
        dimensionScores?: { [key: string]: number } | null
        /** True when the other user has incomplete university info (missing university, programme, start year, or selected "I haven't selected a programme yet") - explains why context score may be lower */
        otherUserHasIncompleteAcademic?: boolean
    }
    onSkip?: (id: string) => void
    onConnect?: (id: string) => void
    connectButtonText?: string
    connectButtonIcon?: LucideIcon
}

// Dimension labels, descriptions, and icons
const dimensionConfig: { [key: string]: { label: string; description: string; icon: any } } = {
  cleanliness: {
    label: 'Cleanliness',
    description: 'Measures how well your cleanliness standards align across shared spaces like kitchen, bathroom, and living areas.',
    icon: Droplets
  },
  noise: {
    label: 'Noise Tolerance',
    description: 'Assesses compatibility around noise sensitivity, including preferences for parties, music volume, and quiet hours.',
    icon: Volume2
  },
  guests: {
    label: 'Guest Frequency',
    description: 'Evaluates alignment on how often friends, partners, or visitors stay overnight and use shared spaces.',
    icon: Users
  },
  sleep: {
    label: 'Sleep Schedule',
    description: 'Compares sleep schedule compatibility, including wake-up times and bedtimes (early bird vs night owl preferences).',
    icon: Moon
  },
  shared_spaces: {
    label: 'Shared Spaces',
    description: 'Measures preferences for using common areas versus private spaces and how you like to utilize shared living areas.',
    icon: Home
  },
  substances: {
    label: 'Substances',
    description: 'Assesses comfort levels and boundaries around alcohol consumption or other substances within the home environment.',
    icon: Coffee
  },
  study_social: {
    label: 'Study/Social Balance',
    description: 'Evaluates the balance between study time and social activities, and how these priorities align in daily life.',
    icon: BookOpen
  },
  home_vibe: {
    label: 'Home Vibe',
    description: 'Compares home atmosphere preferences, whether you prefer a quiet retreat for focus or a social hub for interaction.',
    icon: Heart
  }
}

export function DiscoveryCard({ profile, onSkip, onConnect, connectButtonText = 'Connect', connectButtonIcon = UserPlus }: DiscoveryCardProps) {
    const router = useRouter()
    const [isFlipped, setIsFlipped] = useState(false)
    const matchScore = Math.round(profile.matchPercentage || 0)
    // Convert scores from 0-1 range to 0-100, default to 0 if not provided
    const harmonyScore = profile.harmonyScore != null && profile.harmonyScore !== undefined 
      ? Math.round(profile.harmonyScore * 100) 
      : 0
    const contextScore = profile.contextScore != null && profile.contextScore !== undefined
      ? Math.round(profile.contextScore * 100)
      : 0

    // Default compatibility highlights if none provided
    const highlights = profile.compatibilityHighlights || [
        'Similar lifestyle preferences',
        'Compatible schedules',
        'Shared interests'
    ]
    
    const ConnectIcon = connectButtonIcon

    const handleSkip = () => {
        if (onSkip) {
            onSkip(profile.id)
        }
    }

    const handleConnect = () => {
        if (onConnect) {
            onConnect(profile.id)
        } else {
            router.push(`/chat?userId=${profile.id}`)
        }
    }

    // Mobile (< md): tall enough for front (incl. Chat) + safe area; inner surface scrolls if needed.
    const mobileCardShellClass =
      'max-md:h-[min(46rem,calc(100dvh-4.5rem))] max-md:min-h-0 max-md:shrink-0'

    return (
        <div
          className={`w-full min-h-[28rem] sm:min-h-[30rem] ${mobileCardShellClass}`}
          style={{ perspective: '1200px', WebkitPerspective: '1200px' }}
        >
          {/*
            perspective lives on this shell; the flipper is the next child only.
            Never put overflow:hidden between perspective and preserve-3d  -  WebKit then
            fails backface-visibility and shows a mirrored front instead of the back.
          */}
          <div
            className="relative h-full min-h-[28rem] w-full sm:min-h-[30rem] max-md:min-h-0 max-md:h-full"
            style={{
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform 0.6s ease-in-out',
              willChange: 'transform',
            }}
          >
            {/* Front Face */}
            <div
              className={cn(
                'absolute inset-0 h-full w-full',
                isFlipped && 'pointer-events-none',
              )}
              style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(6px)',
                WebkitTransform: 'translateZ(6px)',
              }}
              aria-hidden={isFlipped}
            >
              <div className="group relative flex h-full min-h-[28rem] max-md:min-h-0 flex-col overflow-y-auto overscroll-y-contain rounded-2xl border border-slate-200/90 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:shadow-xl md:overflow-hidden sm:min-h-[30rem]">
            {/* Hero Match Score Section */}
            <div className="relative shrink-0 bg-gradient-to-b from-violet-100/95 via-indigo-50/80 to-white px-6 pb-4 pt-6 text-center dark:from-violet-600/20 dark:via-transparent dark:to-transparent">
                <div className="mb-3 inline-flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <span className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Match Score</span>
                </div>

                {/* Large Match Percentage */}
                <div className="relative">
                    <span className={`text-6xl font-black tracking-tight ${discoveryScoreTextClass(matchScore)}`}>
                        {matchScore}%
                    </span>
                    <div className="mt-2">
                        <span className={`rounded-full bg-violet-100/90 px-3 py-1 text-sm font-semibold dark:bg-slate-700/50 ${discoveryScoreTextClass(matchScore)}`}>
                            {discoveryMatchTierLabel(matchScore)} Match
                        </span>
                    </div>
                </div>
            </div>

            {/* Score Breakdown Section */}
            <div className="shrink-0 space-y-4 border-t border-slate-200/90 px-6 py-4 dark:border-slate-700/50">
                {/* Harmony Score */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Harmony score"
                              description="Measures how well your day-to-day living preferences align  -  cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-pink-600 transition-colors hover:bg-violet-100/90 hover:text-pink-700 dark:text-pink-400 dark:hover:bg-slate-700/50 dark:hover:text-pink-300',
                                )}
                                aria-label="What is the Harmony score? Opens explanation."
                              >
                                <Heart className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">Harmony</span>
                        </div>
                        <span className={`flex-shrink-0 text-sm font-bold tabular-nums ${discoveryScoreTextClass(harmonyScore)}`}>
                            {harmonyScore}%
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${harmonyScore}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${discoveryScoreBarClass(harmonyScore)}`}
                        />
                    </div>
                </div>

                {/* Context Score */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Context score"
                              description="Measures how similar your academic context is  -  university, programme, and study year."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-blue-600 transition-colors hover:bg-indigo-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300',
                                )}
                                aria-label="What is the Context score? Opens explanation."
                              >
                                <Users className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">Context</span>
                        </div>
                        <span className={`flex-shrink-0 text-sm font-bold tabular-nums ${discoveryScoreTextClass(contextScore)}`}>
                            {contextScore}%
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${contextScore}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                            className={`h-full rounded-full ${discoveryScoreBarClass(contextScore)}`}
                        />
                    </div>
                </div>
                <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-500">
                  Tap the heart or people icons for an explanation of each score. Tap outside the popup to close it.
                </p>
            </div>

            {/* View Details Button */}
            <div className="shrink-0 px-6 pb-4">
              <Button
                onClick={() => setIsFlipped(true)}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 active:scale-95 dark:shadow-violet-900/30 transform hover:scale-[1.02]"
              >
                View Details
              </Button>
            </div>

            {/* Highlights: desktop scrolls here; mobile scrolls the whole card surface above */}
            <div className="max-md:flex-none border-t border-slate-200/90 px-6 py-4 dark:border-slate-700/50 md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-y-contain">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Why you match
                </h4>
                <ul className="space-y-2">
                    {highlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">✓</span>
                            <span className="text-sm leading-tight text-slate-700 dark:text-slate-300">{highlight}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions - only show if at least one action handler is provided */}
            {(onSkip || onConnect) && (
                <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
                    {onSkip && (
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-100 font-semibold text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Skip
                        </Button>
                    )}
                    {onConnect && (
                        <Button
                            onClick={handleConnect}
                            className={`${onSkip ? 'flex-1' : 'w-full'} h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 active:scale-95 dark:shadow-violet-900/30 transform hover:scale-[1.02]`}
                        >
                            <ConnectIcon className="mr-2 h-4 w-4" />
                            {connectButtonText}
                        </Button>
                    )}
                </div>
            )}
              </div>
            </div>

            {/* Back Face */}
            <div
              className={cn(
                'absolute inset-0 h-full w-full',
                !isFlipped && 'pointer-events-none',
              )}
              style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(6px)',
                WebkitTransform: 'rotateY(180deg) translateZ(6px)',
              }}
              aria-hidden={!isFlipped}
            >
              <div className="flex h-full w-full min-h-[28rem] max-md:min-h-0 flex-col overflow-y-auto overscroll-y-contain rounded-2xl border border-slate-200/90 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:shadow-xl md:overflow-hidden sm:min-h-[30rem] sm:p-6">
                {/* User Details Heading */}
                <div className="mb-4 shrink-0">
                  <h3 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">User Details</h3>
                  {profile.name && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{profile.name}</p>
                  )}
                </div>

                {/* Incomplete Academic Info Notice - explains lower context score */}
                {profile.otherUserHasIncompleteAcademic && (
                  <div className="mb-5 shrink-0 border-b border-slate-200/90 pb-5 dark:border-slate-700/50">
                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
                      <GraduationCap className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="min-w-0">
                        <p className="mb-1 text-sm font-medium text-amber-900 dark:text-amber-200">
                          Context score may be lower
                        </p>
                        <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                          This score may be lower because they haven&apos;t completed key university details yet.
                          It can improve once they finish their profile.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Harmony & Context Scores - Horizontal Layout */}
                {(harmonyScore > 0 || contextScore > 0) && (
                  <div className="mb-3 grid shrink-0 grid-cols-2 gap-4 border-b border-slate-200/90 pb-5 dark:border-slate-700/50">
                    {harmonyScore > 0 && (
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Harmony score"
                              description="Measures how well your day-to-day living preferences align  -  cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-pink-600 transition-colors hover:bg-violet-100/90 hover:text-pink-700 dark:text-pink-400 dark:hover:bg-slate-700/50 dark:hover:text-pink-300',
                                )}
                                aria-label="What is the Harmony score? Opens explanation."
                              >
                                <Heart className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">Harmony</span>
                          </div>
                          <span className={`flex-shrink-0 text-sm font-semibold tabular-nums ${discoveryScoreTextClass(harmonyScore)}`}>
                            {harmonyScore}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div 
                            className={`h-full rounded-full ${discoveryScoreBarClass(harmonyScore)} transition-all duration-500`}
                            style={{ width: `${harmonyScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {contextScore > 0 && (
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Context score"
                              description="Measures how similar your academic context is  -  university, programme, and study year."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-blue-600 transition-colors hover:bg-indigo-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300',
                                )}
                                aria-label="What is the Context score? Opens explanation."
                              >
                                <Users className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">Context</span>
                          </div>
                          <span className={`flex-shrink-0 text-sm font-semibold tabular-nums ${discoveryScoreTextClass(contextScore)}`}>
                            {contextScore}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div 
                            className={`h-full rounded-full ${discoveryScoreBarClass(contextScore)} transition-all duration-500`}
                            style={{ width: `${contextScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {(harmonyScore > 0 || contextScore > 0) && (
                  <p className="mb-3 shrink-0 text-[11px] leading-snug text-slate-500 dark:text-slate-500">
                    Tap the heart or people icons for score details. Tap outside the popup to close it.
                  </p>
                )}

                {/* Dimension Scores  -  scroll inside the card on mobile (parent has bounded height) */}
                <div className="mb-0 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
                  <h4 className="mb-1 flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-300">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Detailed Dimension Scores
                  </h4>
                  <p className="mb-3 shrink-0 text-[11px] leading-snug text-slate-500 dark:text-slate-500">
                    Tap each row&apos;s icon for what that dimension measures. Tap outside the popup to close it.
                  </p>
                  <div className="space-y-2.5 pb-1">
                    {Object.entries(dimensionConfig).map(([dimensionKey, config]) => {
                      const Icon = config.icon
                      const label = config.label
                      const description = config.description
                      
                      // Get score from dimensionScores if available, otherwise 0
                      const dimensionScore = profile.dimensionScores && typeof profile.dimensionScores === 'object' && profile.dimensionScores[dimensionKey]
                        ? (typeof profile.dimensionScores[dimensionKey] === 'number' ? profile.dimensionScores[dimensionKey] : 0)
                        : 0
                      const scorePercent = Math.round(dimensionScore * 100)
                      
                      return (
                        <div 
                          key={dimensionKey} 
                          className="rounded-lg border border-slate-200/90 bg-slate-50/90 p-2.5 dark:border-slate-700 dark:bg-slate-900/30"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-1">
                              <ScoreInfoPopover title={label} description={description}>
                                <button
                                  type="button"
                                  className={cn(
                                    scoreInfoIconTriggerBaseClass,
                                    'text-slate-500 transition-colors hover:bg-slate-200/90 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200',
                                  )}
                                  aria-label={`${label}: open explanation (tap outside popup to close)`}
                                >
                                  <Icon className="h-3.5 w-3.5" aria-hidden />
                                </button>
                              </ScoreInfoPopover>
                              <span className="min-w-0 truncate whitespace-nowrap pl-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                                {label}
                              </span>
                            </div>
                            <span className={`flex-shrink-0 text-sm font-bold ${discoveryScoreTextClass(scorePercent)}`}>
                              {scorePercent}%
                            </span>
                          </div>
                          <div className="relative mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div 
                              className={`h-full rounded-full ${discoveryScoreBarClass(scorePercent)} transition-all duration-500`}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Back to Profile Button */}
                <div className="mt-auto shrink-0 border-t border-slate-200/90 pt-4 dark:border-slate-700/50">
                  <Button
                    onClick={() => setIsFlipped(false)}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 active:scale-95 dark:shadow-violet-900/30 transform hover:scale-[1.02]"
                  >
                    Back to Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}
