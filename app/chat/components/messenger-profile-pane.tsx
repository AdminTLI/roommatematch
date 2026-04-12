'use client'

import { useState, useEffect, useCallback, type ElementType, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  X,
  ChevronDown,
  ChevronUp,
  Droplets,
  Volume2,
  Moon,
  Home,
  Coffee,
  BookOpen,
  Heart,
  Info,
  Users,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { safeLogger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { type HousingStatusKey } from '@/lib/constants/housing-status'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/app/providers'
import { fetchChatCompatibility, type ChatCompatibilityPayload } from '@/lib/chat/fetch-chat-compatibility'
import {
  ScoreInfoPopover,
  scoreInfoIconTriggerBarAlignClass,
  scoreInfoIconTriggerBaseClass,
} from '@/components/compatibility/score-info-popover'
import {
  discoveryMatchTierLabel,
  discoveryScoreBarClass,
  discoveryScoreTextClass,
} from '@/lib/compatibility/discovery-score-visuals'

interface UserInfoData {
  first_name: string | null
  last_name: string | null
  bio: string | null
  interests: string[]
  housing_status?: HousingStatusKey[]
  budget_min?: number | null
  budget_max?: number | null
  preferred_cities?: string[]
  user_type?: 'student' | 'professional' | null
  age?: number | null
  wfh_status?: string | null
  work_schedule?: string | null
  university_name: string | null
  programme_name: string | null
  degree_level: string | null
  study_year: number | null
  location?: string | null
}

interface MessengerProfilePaneProps {
  chatId: string
  isOpen: boolean
  onClose?: () => void
}

function pctFromFraction(f: number | null | undefined): number | null {
  if (f == null || Number.isNaN(f)) return null
  return Math.min(100, Math.max(0, Math.round(f * 100)))
}

const formatWfhStatus = (wfhStatus?: string | null) => {
  switch (wfhStatus) {
    case 'fully_remote':
      return 'Fully Remote'
    case 'hybrid':
      return 'Hybrid (mix of home/office)'
    case 'fully_office':
      return 'Fully in Office'
    default:
      return wfhStatus || 'Not provided'
  }
}

const dimensionConfig: { [key: string]: { label: string; description: string; icon: ElementType<{ className?: string }> } } = {
  cleanliness: {
    label: 'Cleanliness',
    description:
      'Measures how well your cleanliness standards align across shared spaces like kitchen, bathroom, and living areas.',
    icon: Droplets,
  },
  noise: {
    label: 'Noise Tolerance',
    description:
      'Assesses compatibility around noise sensitivity, including preferences for parties, music volume, and quiet hours.',
    icon: Volume2,
  },
  guests: {
    label: 'Guest Frequency',
    description:
      'Evaluates alignment on how often friends, partners, or visitors stay overnight and use shared spaces.',
    icon: Users,
  },
  sleep: {
    label: 'Sleep Schedule',
    description:
      'Compares sleep schedule compatibility, including wake-up times and bedtimes (early bird vs night owl preferences).',
    icon: Moon,
  },
  shared_spaces: {
    label: 'Shared Spaces',
    description:
      'Measures preferences for using common areas versus private spaces and how you like to utilize shared living areas.',
    icon: Home,
  },
  substances: {
    label: 'Substances',
    description:
      'Assesses comfort levels and boundaries around alcohol consumption or other substances within the home environment.',
    icon: Coffee,
  },
  study_social: {
    label: 'Study/Social Balance',
    description:
      'Evaluates the balance between study time and social activities, and how these priorities align in daily life.',
    icon: BookOpen,
  },
  home_vibe: {
    label: 'Home Vibe',
    description:
      'Compares home atmosphere preferences, whether you prefer a quiet retreat for focus or a social hub for interaction.',
    icon: Heart,
  },
}

const DIMENSION_ORDER = [
  'cleanliness',
  'noise',
  'guests',
  'sleep',
  'shared_spaces',
  'substances',
  'study_social',
  'home_vibe',
] as const

/** When AI text is unavailable, still ground copy in every score we have. */
function deterministicCompatSummary(compat: ChatCompatibilityPayload): string {
  const parts: string[] = []
  const overall = pctFromFraction(compat.compatibility_score ?? undefined)
  const harmony = pctFromFraction(compat.harmony_score ?? undefined)
  const context = pctFromFraction(compat.context_score ?? undefined)

  if (overall != null) {
    parts.push(
      overall >= 70
        ? `Your overall match is strong at about ${overall}% — that usually means fewer surprises once you share a place.`
        : overall >= 55
          ? `Your overall match sits around ${overall}% — there is real overlap, but a few habits may need a clear chat.`
          : `Your overall match is lower, around ${overall}% — it does not rule someone out, but it flags areas to discuss early.`,
    )
  }
  if (harmony != null) {
    parts.push(
      harmony >= 70
        ? `Harmony (day-to-day living fit) is about ${harmony}%: routines, noise, guests, and shared spaces likely line up fairly well.`
        : harmony >= 55
          ? `Harmony is about ${harmony}%: you are partly aligned on daily rhythms — worth comparing concrete examples (quiet hours, cleaning, visitors).`
          : `Harmony is about ${harmony}%: day-to-day preferences may diverge — plan house rules together before you commit.`,
    )
  }
  if (context != null) {
    parts.push(
      context >= 70
        ? `Context (background overlap, e.g. study or work chapter) is about ${context}% — similar schedules or life stage can make logistics easier.`
        : context >= 55
          ? `Context is about ${context}%: you are somewhat aligned on background timing, but do not assume identical deadlines or commute patterns.`
          : `Context is about ${context}%: different paths can still work — just budget extra clarity on expectations.`,
    )
  }

  const raw = compat.dimension_scores_json
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const entries: { key: string; p: number }[] = []
    const known = new Set<string>([...DIMENSION_ORDER])
    for (const key of DIMENSION_ORDER) {
      const v = raw[key]
      if (typeof v === 'number') entries.push({ key, p: pctFromFraction(v) ?? 0 })
    }
    for (const key of Object.keys(raw)) {
      if (known.has(key)) continue
      const v = raw[key]
      if (typeof v === 'number') entries.push({ key, p: pctFromFraction(v) ?? 0 })
    }

    if (entries.length > 0) {
      const byDesc = [...entries].sort((a, b) => b.p - a.p)
      const byAsc = [...entries].sort((a, b) => a.p - b.p)
      const label = (k: string) => dimensionConfig[k]?.label || k.replace(/_/g, ' ')
      const top = byDesc.slice(0, 3).map(e => `${label(e.key)} (${e.p}%)`)
      const weakest = byAsc.slice(0, 2).map(e => `${label(e.key)} (${e.p}%)`)
      parts.push(
        `Across the lifestyle dimensions, your strongest alignment shows up in ${top.join(', ')}; the areas to discuss most openly include ${weakest.join(' and ')} — use those as conversation starters, not verdicts.`,
      )
    }
  }

  return parts.join('\n\n')
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">{children}</h3>
  )
}

export function MessengerProfilePane({ chatId, isOpen, onClose }: MessengerProfilePaneProps) {
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
  const [currentUserInterests, setCurrentUserInterests] = useState<string[]>([])
  const [userLoading, setUserLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const { data: compat, isLoading: compatLoading, isFetching: compatFetching } = useQuery<
    ChatCompatibilityPayload | null
  >({
    queryKey: queryKeys.chatCompatibility(chatId),
    queryFn: () => fetchChatCompatibility(chatId),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen && !!chatId,
  })

  const fetchUserProfile = useCallback(async () => {
    if (!isOpen) return

    setUserLoading(true)
    setError(null)
    setUserInfo(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('interests').eq('user_id', user.id).maybeSingle()

        if (profile?.interests && Array.isArray(profile.interests)) {
          setCurrentUserInterests(profile.interests)
        } else {
          setCurrentUserInterests([])
        }
      }

      const userInfoResponse = await fetch(`/api/chat/user-info?chatId=${chatId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        credentials: 'include',
      })

      if (userInfoResponse.ok) {
        const userInfoData = await userInfoResponse.json()
        setUserInfo(userInfoData)
      } else {
        safeLogger.warn('[MessengerProfilePane] Failed to fetch user info', {
          status: userInfoResponse.status,
          body: await userInfoResponse.text(),
        })
      }
    } catch (err) {
      safeLogger.error('[MessengerProfilePane] Error fetching profile:', err)
      setError('Failed to load profile data')
    } finally {
      setUserLoading(false)
    }
  }, [chatId, isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile()
    }
  }, [isOpen, fetchUserProfile])

  if (!isOpen) return null

  const mainPct =
    compat?.compatibility_score != null && !Number.isNaN(compat.compatibility_score)
      ? pctFromFraction(compat.compatibility_score)
      : null

  const harmonyPct = pctFromFraction(compat?.harmony_score ?? undefined)
  const contextPct = pctFromFraction(compat?.context_score ?? undefined)

  const showSkeleton = userLoading && !userInfo && !error
  const compatPending = (compatLoading || compatFetching) && mainPct === null

  const hasDimensionDetails =
    compat?.dimension_scores_json &&
    typeof compat.dimension_scores_json === 'object' &&
    Object.keys(compat.dimension_scores_json).length > 0

  return (
    <div
      data-messenger-profile-pane
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-100 text-gray-900 dark:bg-zinc-900 dark:text-slate-100"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="min-w-0 flex-1 pr-3">
          <h2 className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-2xl font-black uppercase leading-none tracking-wide text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-sky-400 sm:text-3xl">
            Match Insights
          </h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hidden h-11 w-11 shrink-0 touch-manipulation rounded-full p-0 text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white lg:inline-flex"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close profile panel</span>
          </Button>
        )}
      </div>

      {/* Fills remaining sheet height; single scroll surface */}
      <div
        data-profile-pane-scroll
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-zinc-100 scroll-smooth touch-pan-y [scrollbar-gutter:stable] dark:bg-zinc-900"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="mx-auto w-full max-w-lg space-y-5 px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
          {showSkeleton ? (
            <div className="space-y-4">
              <div className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
              <div className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
              <div className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-gray-600 dark:text-slate-400">{error}</p>
            </div>
          ) : (
            <>
              {/* Discovery-style score block (aligned with dashboard /matches DiscoveryCard) */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-xl">
                <div className="relative shrink-0 bg-gradient-to-b from-violet-100/95 via-indigo-50/80 to-white px-6 pb-7 pt-8 text-center dark:from-violet-600/25 dark:via-transparent dark:to-transparent">
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden />
                    <span className="text-sm font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">Match score</span>
                  </div>

                  {compatPending ? (
                    <div className="mx-auto flex max-w-[200px] flex-col items-center gap-3">
                      <div className="h-16 w-24 animate-pulse rounded-lg bg-violet-100/90 dark:bg-slate-700/80" />
                      <div className="h-8 w-32 animate-pulse rounded-full bg-violet-100/80 dark:bg-slate-700/80" />
                    </div>
                  ) : mainPct != null && compat?.compatibility_score != null ? (
                    <>
                      <span
                        className={cn(
                          'block text-6xl font-black tracking-tight tabular-nums',
                          discoveryScoreTextClass(mainPct),
                        )}
                      >
                        {mainPct}%
                      </span>
                      <div className="mt-2">
                        <span
                          className={cn(
                            'inline-block rounded-full bg-violet-100/90 px-3 py-1 text-sm font-semibold dark:bg-slate-700/50',
                            discoveryScoreTextClass(mainPct),
                          )}
                        >
                          {discoveryMatchTierLabel(mainPct)} match
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No compatibility score available for this chat.</p>
                  )}
                </div>

                {/* Harmony & context — same structure as DiscoveryCard */}
                {!compatPending && compat && (harmonyPct != null || contextPct != null) && (
                  <div className="space-y-5 border-t border-slate-200/90 px-6 py-5 dark:border-slate-700/50">
                    {harmonyPct != null && compat.harmony_score != null && (
                      <div className="space-y-2">
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Harmony score"
                              description="Measures how well your day-to-day living preferences align — cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe."
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
                          <span
                            className={cn('shrink-0 text-sm font-bold tabular-nums', discoveryScoreTextClass(harmonyPct))}
                          >
                            {harmonyPct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className={cn('h-full rounded-full transition-[width] duration-500 ease-out', discoveryScoreBarClass(harmonyPct))}
                            style={{ width: `${harmonyPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {contextPct != null && compat.context_score != null && (
                      <div className="space-y-2">
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-center gap-1">
                            <ScoreInfoPopover
                              title="Context score"
                              description="Measures how similar your academic context is — university, programme, and study year."
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
                          <span
                            className={cn('shrink-0 text-sm font-bold tabular-nums', discoveryScoreTextClass(contextPct))}
                          >
                            {contextPct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className={cn('h-full rounded-full transition-[width] duration-500 ease-out', discoveryScoreBarClass(contextPct))}
                            style={{ width: `${contextPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 px-3 py-3 text-left dark:border-slate-700/60 dark:bg-slate-900/40">
                      <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-600 dark:text-slate-400">
                        {compatFetching && !compat.personalized_explanation?.trim() ? (
                          <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-500">
                            <span
                              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent dark:border-violet-500"
                              aria-hidden
                            />
                            Updating match insight…
                          </span>
                        ) : compat.personalized_explanation?.trim() ? (
                          compat.personalized_explanation.trim()
                        ) : (
                          deterministicCompatSummary(compat)
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {hasDimensionDetails && (
                  <div className="border-t border-slate-200/90 px-6 pb-5 pt-3 dark:border-slate-700/50">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDetails(!showDetails)}
                      className="h-10 min-h-[44px] w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] dark:shadow-violet-900/25"
                    >
                      <span className="flex w-full items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {showDetails ? 'Hide dimensions' : 'Dimension breakdown'}
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </Button>
                  </div>
                )}

                {showDetails && hasDimensionDetails && compat?.dimension_scores_json && (
                  <div className="border-t border-slate-200/90 px-4 pb-5 pt-3 dark:border-slate-700/50">
                    <p className="mb-3 text-[11px] leading-snug text-slate-500 dark:text-slate-500">
                      Each bar reflects alignment on that lifestyle dimension (tap the icon for details).
                    </p>
                    <div className="grid grid-cols-1 gap-2.5">
                      {Object.entries(compat.dimension_scores_json).map(([key, score]) => {
                        const dimensionKey = key as string
                        const dimensionScore = typeof score === 'number' ? score : 0
                        const dimPct = pctFromFraction(dimensionScore) ?? 0
                        const config = dimensionConfig[dimensionKey]
                        const Icon = config?.icon || Info
                        const label = config?.label || dimensionKey
                        const description = config?.description || ''

                        return (
                          <div
                            key={dimensionKey}
                            className="rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 py-3 transition-colors hover:border-violet-200/80 dark:border-slate-700/80 dark:bg-slate-900/50 dark:hover:border-slate-600"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                {description ? (
                                  <ScoreInfoPopover title={label} description={description}>
                                    <button
                                      type="button"
                                      className={cn(
                                        scoreInfoIconTriggerBarAlignClass,
                                        'text-slate-500 transition-colors hover:bg-slate-200/90 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                                      )}
                                      aria-label={`${label}: open explanation`}
                                    >
                                      <Icon className="h-3.5 w-3.5" aria-hidden />
                                    </button>
                                  </ScoreInfoPopover>
                                ) : (
                                  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-500" aria-hidden />
                                )}
                                <span className="min-w-0 truncate text-xs font-medium text-slate-800 dark:text-slate-200">{label}</span>
                              </div>
                              <span
                                className={cn('shrink-0 text-xs font-bold tabular-nums', discoveryScoreTextClass(dimPct))}
                              >
                                {dimPct}%
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-[width] duration-500 ease-out',
                                  discoveryScoreBarClass(dimPct),
                                )}
                                style={{ width: `${dimPct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile body — light cards (previous pane feel) */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 dark:shadow-none">
                <SectionTitle>Bio</SectionTitle>
                {userInfo?.bio && userInfo.bio.trim() ? (
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-slate-200">{userInfo.bio}</p>
                ) : (
                  <p className="text-xs italic text-gray-500 dark:text-slate-500">No bio yet</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 dark:shadow-none">
                <SectionTitle>Interests</SectionTitle>
                {userInfo?.interests && userInfo.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userInfo.interests.map((interest, index) => {
                      const isShared = currentUserInterests.includes(interest)
                      return (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={cn(
                            'rounded-full px-3 py-1.5 text-xs',
                            isShared
                              ? 'border-violet-500 bg-violet-600 text-white hover:bg-violet-500'
                              : 'border-gray-200 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
                          )}
                        >
                          {interest}
                        </Badge>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic text-gray-500 dark:text-slate-500">No interests listed</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 dark:shadow-none">
                <SectionTitle>Housing</SectionTitle>
                <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
                  {userInfo?.housing_status && userInfo.housing_status.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userInfo.housing_status.map(key => (
                        <StatusBadge
                          key={key}
                          statusKey={key}
                          variant="secondary"
                          className="border-gray-200 bg-gray-100 text-gray-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500 dark:text-slate-500">No housing status selected</p>
                  )}
                  {(userInfo?.budget_min != null || userInfo?.budget_max != null) && (
                    <div>
                      <span className="font-medium text-gray-500 dark:text-slate-400">Budget (rent/month): </span>
                      <span className="text-gray-900 dark:text-slate-200">
                        {userInfo.budget_min != null && userInfo.budget_max != null
                          ? `€${userInfo.budget_min} – €${userInfo.budget_max}`
                          : userInfo.budget_min != null
                            ? `€${userInfo.budget_min}+`
                            : userInfo.budget_max != null
                              ? `up to €${userInfo.budget_max}`
                              : ''}
                      </span>
                    </div>
                  )}
                  {userInfo?.preferred_cities && userInfo.preferred_cities.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-500 dark:text-slate-400">Preferred city: </span>
                      <span className="text-gray-900 dark:text-slate-200">{userInfo.preferred_cities.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {userInfo?.user_type === 'professional' ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 dark:shadow-none">
                  <SectionTitle>Professional lifestyle</SectionTitle>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                    <div>
                      <span className="font-medium text-gray-500 dark:text-slate-400">WFH: </span>
                      {formatWfhStatus(userInfo?.wfh_status)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-slate-400">Age: </span>
                      {userInfo?.age != null ? `${userInfo.age} years old` : 'Not provided'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-slate-400">Schedule: </span>
                      {userInfo?.work_schedule || 'Not provided'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90 dark:shadow-none">
                  <SectionTitle>University</SectionTitle>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                    {userInfo?.programme_name && (
                      <div>
                        <span className="font-medium text-gray-500 dark:text-slate-400">Programme: </span>
                        {userInfo.programme_name}
                      </div>
                    )}
                    {userInfo?.study_year !== null && userInfo?.study_year !== undefined && (
                      <div>
                        <span className="font-medium text-gray-500 dark:text-slate-400">Year: </span>
                        {userInfo.study_year}
                      </div>
                    )}
                    {!userInfo?.programme_name && userInfo?.study_year == null && (
                      <p className="text-xs italic text-gray-500 dark:text-slate-500">No university information available</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
