'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, UserPlus, Zap, Heart, Users, MessageCircle, LucideIcon, Droplets, Volume2, Moon, Coffee, BookOpen, Home, Sparkles, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScoreInfoPopover, scoreInfoIconTriggerBaseClass } from '@/components/compatibility/score-info-popover'
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

// Four distinct colors: Amazing=emerald, Great=indigo, Good=violet, Low=amber
function getScoreColor(score: number): string {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-indigo-400'
    if (score >= 55) return 'text-violet-400'
    return 'text-amber-400'
}

function getScoreBarColor(score: number): string {
    if (score >= 85) return 'bg-emerald-500'
    if (score >= 70) return 'bg-indigo-500'
    if (score >= 55) return 'bg-violet-500'
    return 'bg-amber-500'
}

function getScoreLabel(score: number): string {
    if (score >= 85) return 'Amazing'
    if (score >= 70) return 'Great'
    if (score >= 55) return 'Good'
    return 'Low'
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
            Never put overflow:hidden between perspective and preserve-3d — WebKit then
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
              <div className="group relative flex h-full min-h-[28rem] max-md:min-h-0 flex-col overflow-y-auto overscroll-y-contain rounded-2xl border border-slate-700 bg-slate-800 shadow-xl md:overflow-hidden sm:min-h-[30rem]">
            {/* Hero Match Score Section */}
            <div className="relative shrink-0 p-6 pb-4 text-center bg-gradient-to-b from-violet-600/20 to-transparent">
                <div className="inline-flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-violet-400" />
                    <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Match Score</span>
                </div>

                {/* Large Match Percentage */}
                <div className="relative">
                    <span className={`text-6xl font-black tracking-tight ${getScoreColor(matchScore)}`}>
                        {matchScore}%
                    </span>
                    <div className="mt-2">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-slate-700/50 ${getScoreColor(matchScore)}`}>
                            {getScoreLabel(matchScore)} Match
                        </span>
                    </div>
                </div>
            </div>

            {/* Score Breakdown Section */}
            <div className="shrink-0 px-6 py-4 space-y-4 border-t border-slate-700/50">
                {/* Harmony Score */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Harmony score"
                              description="Measures how well your day-to-day living preferences align — cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-pink-400 transition-colors hover:bg-slate-700/50 hover:text-pink-300',
                                )}
                                aria-label="What is the Harmony score? Opens explanation."
                              >
                                <Heart className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-300">Harmony</span>
                        </div>
                        <span className={`flex-shrink-0 text-sm font-bold tabular-nums ${getScoreColor(harmonyScore)}`}>
                            {harmonyScore}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${harmonyScore}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${getScoreBarColor(harmonyScore)}`}
                        />
                    </div>
                </div>

                {/* Context Score */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Context score"
                              description="Measures how similar your academic context is — university, programme, and study year."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-blue-400 transition-colors hover:bg-slate-700/50 hover:text-blue-300',
                                )}
                                aria-label="What is the Context score? Opens explanation."
                              >
                                <Users className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-300">Context</span>
                        </div>
                        <span className={`flex-shrink-0 text-sm font-bold tabular-nums ${getScoreColor(contextScore)}`}>
                            {contextScore}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${contextScore}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                            className={`h-full rounded-full ${getScoreBarColor(contextScore)}`}
                        />
                    </div>
                </div>
                <p className="text-[11px] leading-snug text-slate-500">
                  Tap the heart or people icons for an explanation of each score. Tap outside the popup to close it.
                </p>
            </div>

            {/* View Details Button */}
            <div className="shrink-0 px-6 pb-4">
              <Button
                onClick={() => setIsFlipped(true)}
                className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                View Details
              </Button>
            </div>

            {/* Highlights: desktop scrolls here; mobile scrolls the whole card surface above */}
            <div className="border-t border-slate-700/50 px-6 py-4 max-md:flex-none md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-y-contain">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Why you match
                </h4>
                <ul className="space-y-2">
                    {highlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span className="text-sm text-slate-300 leading-tight">{highlight}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions - only show if at least one action handler is provided */}
            {(onSkip || onConnect) && (
                <div className="shrink-0 p-4 flex items-center gap-3 border-t border-slate-700">
                    {onSkip && (
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="flex-1 h-11 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-semibold transition-all"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Skip
                        </Button>
                    )}
                    {onConnect && (
                        <Button
                            onClick={handleConnect}
                            className={`${onSkip ? 'flex-1' : 'w-full'} h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95`}
                        >
                            <ConnectIcon className="w-4 h-4 mr-2" />
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
              <div className="flex h-full w-full min-h-[28rem] max-md:min-h-0 flex-col overflow-y-auto overscroll-y-contain rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-xl md:overflow-hidden sm:min-h-[30rem] sm:p-6">
                {/* User Details Heading */}
                <div className="mb-4 shrink-0">
                  <h3 className="text-xl font-semibold text-slate-100 mb-1">User Details</h3>
                  {profile.name && (
                    <p className="text-sm text-slate-400">{profile.name}</p>
                  )}
                </div>

                {/* Incomplete Academic Info Notice - explains lower context score */}
                {profile.otherUserHasIncompleteAcademic && (
                  <div className="mb-5 shrink-0 pb-5 border-b border-slate-700/50">
                    <div className="flex gap-3 p-3 rounded-lg bg-amber-950/30 border border-amber-800/50">
                      <GraduationCap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-amber-200 mb-1">
                          Context score may be lower
                        </p>
                        <p className="text-xs text-amber-300/90 leading-relaxed">
                          This score may be lower because they haven&apos;t completed key university details yet.
                          It can improve once they finish their profile.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Harmony & Context Scores - Horizontal Layout */}
                {(harmonyScore > 0 || contextScore > 0) && (
                  <div className="grid shrink-0 grid-cols-2 gap-4 mb-3 pb-5 border-b border-slate-700/50">
                    {harmonyScore > 0 && (
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Harmony score"
                              description="Measures how well your day-to-day living preferences align — cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-pink-400 transition-colors hover:bg-slate-700/50 hover:text-pink-300',
                                )}
                                aria-label="What is the Harmony score? Opens explanation."
                              >
                                <Heart className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-300">Harmony</span>
                          </div>
                          <span className={`flex-shrink-0 text-sm font-semibold tabular-nums ${getScoreColor(harmonyScore)}`}>
                            {harmonyScore}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getScoreBarColor(harmonyScore)} transition-all duration-500`}
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
                              description="Measures how similar your academic context is — university, programme, and study year."
                            >
                              <button
                                type="button"
                                className={cn(
                                  scoreInfoIconTriggerBaseClass,
                                  'text-blue-400 transition-colors hover:bg-slate-700/50 hover:text-blue-300',
                                )}
                                aria-label="What is the Context score? Opens explanation."
                              >
                                <Users className="h-3.5 w-3.5" aria-hidden />
                              </button>
                            </ScoreInfoPopover>
                            <span className="min-w-0 truncate pl-0.5 text-sm font-medium text-slate-300">Context</span>
                          </div>
                          <span className={`flex-shrink-0 text-sm font-semibold tabular-nums ${getScoreColor(contextScore)}`}>
                            {contextScore}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getScoreBarColor(contextScore)} transition-all duration-500`}
                            style={{ width: `${contextScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {(harmonyScore > 0 || contextScore > 0) && (
                  <p className="mb-3 shrink-0 text-[11px] leading-snug text-slate-500">
                    Tap the heart or people icons for score details. Tap outside the popup to close it.
                  </p>
                )}

                {/* Dimension Scores — scroll inside the card on mobile (parent has bounded height) */}
                <div className="mb-0 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
                  <h4 className="text-sm font-semibold text-slate-300 mb-1 flex shrink-0 items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Detailed Dimension Scores
                  </h4>
                  <p className="mb-3 shrink-0 text-[11px] leading-snug text-slate-500">
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
                          className="p-2.5 rounded-lg border border-slate-700 bg-slate-900/30"
                        >
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-1">
                              <ScoreInfoPopover title={label} description={description}>
                                <button
                                  type="button"
                                  className={cn(
                                    scoreInfoIconTriggerBaseClass,
                                    'text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-slate-200',
                                  )}
                                  aria-label={`${label}: open explanation (tap outside popup to close)`}
                                >
                                  <Icon className="h-3.5 w-3.5" aria-hidden />
                                </button>
                              </ScoreInfoPopover>
                              <span className="min-w-0 truncate whitespace-nowrap pl-0.5 text-sm font-medium text-slate-100">
                                {label}
                              </span>
                            </div>
                            <span className={`text-sm font-bold flex-shrink-0 ${getScoreColor(scorePercent)}`}>
                              {scorePercent}%
                            </span>
                          </div>
                          <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-700 mt-1.5">
                            <div 
                              className={`h-full rounded-full ${getScoreBarColor(scorePercent)} transition-all duration-500`}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Back to Profile Button */}
                <div className="mt-auto shrink-0 border-t border-slate-700/50 pt-4">
                  <Button
                    onClick={() => setIsFlipped(false)}
                    className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95"
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
