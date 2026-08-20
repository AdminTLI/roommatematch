'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Sparkles,
  GraduationCap,
  BookOpen,
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
import { ProgressiveProfileLockHint } from './progressive-profile-lock-hint'
import { VibeAlignmentRing } from './vibe-alignment-ring'
import {
  V2_CHAT_MODULES,
  isV2DimensionPayload,
  legacyDimensionLabel,
  vibeAlignmentBand,
  vibeAlignmentBarClass,
  vibeAlignmentSubtitle,
  vibeAlignmentTextClass,
} from '@/lib/chat/vibe-alignment'
import { nudgeBioMessage, nudgeHousingMessage, partnerFirstName } from '@/lib/chat/conversation-prompts'

interface UserInfoData {
  first_name: string | null
  last_name: string | null
  progressive_disclosure?: {
    mutual_details: boolean
    mutual_picture: boolean
    messages_exchanged_count: number
    show_reveal_prompt: boolean
  }
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
  onComposeNudge?: (message: string) => void
  /** Chat header / sidebar display name used when profile first_name is hidden */
  partnerDisplayName?: string | null
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

function toUnitInterval(f: number | null | undefined): number | null {
  if (f == null || Number.isNaN(f)) return null
  return f > 1 ? Math.min(1, f / 100) : Math.min(1, Math.max(0, f))
}

function interestEmoji(interest: string): string {
  const t = interest.toLowerCase()
  if (t.includes('coffee')) return '☕'
  if (t.includes('game') || t.includes('gaming')) return '🎮'
  if (t.includes('gym') || t.includes('fit') || t.includes('sport')) return '🏋️'
  if (t.includes('cook') || t.includes('food')) return '🍳'
  if (t.includes('music')) return '🎵'
  if (t.includes('travel')) return '✈️'
  if (t.includes('read') || t.includes('book')) return '📚'
  if (t.includes('movie') || t.includes('film')) return '🎬'
  return '✨'
}

function shortenInsight(md: string): string {
  const plain = md
    .replace(/\*\*/g, '')
    .replace(/^[#*\-\s]+/gm, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
  const sentences = plain.join(' ').split(/(?<=[.!?])\s+/).filter(Boolean)
  return sentences.slice(0, 2).join(' ')
}

/** When AI text is unavailable: similarity-focused coach Markdown. */
function deterministicCompatSummary(compat: ChatCompatibilityPayload): string {
  const raw = compat.dimension_scores_json
  const entries: { key: string; u: number; label: string }[] = []

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    if (isV2DimensionPayload(raw as Record<string, unknown>)) {
      for (const m of V2_CHAT_MODULES) {
        const v = (raw as Record<string, unknown>)[m.key]
        if (typeof v === 'number' && !Number.isNaN(v)) {
          entries.push({ key: m.key, u: toUnitInterval(v) ?? 0, label: m.label })
        }
      }
    } else {
      for (const [key, v] of Object.entries(raw)) {
        if (key === 'gate_conflicts' || key === 'soft_gate_override') continue
        if (typeof v === 'number' && !Number.isNaN(v)) {
          entries.push({ key, u: toUnitInterval(v) ?? 0, label: legacyDimensionLabel(key) })
        }
      }
    }
  }

  const byDesc = [...entries].sort((a, b) => b.u - a.u)
  const byAsc = [...entries].sort((a, b) => a.u - b.u)
  const top = byDesc[0]
  const weak = byAsc[0]

  const b1 = top
    ? `You look closely aligned on ${top.label.toLowerCase()}, which often makes day-to-day living feel easier to navigate together.`
    : 'Your profiles show a mix of overlap and normal differences, which is typical for flat shares.'
  const b2 = byDesc[1]
    ? `You also answer similarly on ${byDesc[1].label.toLowerCase()}, a helpful place to start the roommate chat.`
    : 'A short chat about routines usually helps you both feel clear before move-in.'
  const w1 = weak
    ? `${weak.label} is a normal place for roommates to differ. Comparing expectations early keeps things friendly.`
    : 'Quiet hours and kitchen habits are worth a quick compare so nobody is guessing.'

  return `**🌟 Where you line up:**
* ${b1}
* ${b2}

**🗣️ Worth comparing early:**
* ${w1}

**💬 Suggested Icebreaker:**
* "Hey! Domu Match says we lean similar on ${top ? top.label.toLowerCase() : 'a few living habits'}. Want to compare notes on house rhythms?"`
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
      {children}
    </h3>
  )
}

function ProfileCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:bg-slate-800/90 dark:shadow-none">
      {children}
    </div>
  )
}

const emptyStateBoxClass =
  'rounded-xl bg-slate-100/90 px-3 py-3 text-xs text-slate-500 dark:bg-slate-900/80 dark:text-slate-400'

export function MessengerProfilePane({
  chatId,
  isOpen,
  onClose,
  onComposeNudge,
  partnerDisplayName,
}: MessengerProfilePaneProps) {
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

  const showSkeleton = userLoading && !userInfo && !error
  const compatPending = (compatLoading || compatFetching) && mainPct === null

  const dimRaw = compat?.dimension_scores_json
  const dimObj =
    dimRaw && typeof dimRaw === 'object' && !Array.isArray(dimRaw)
      ? (dimRaw as Record<string, unknown>)
      : null
  const useV2Modules = isV2DimensionPayload(dimObj)

  const hasDimensionDetails = Boolean(
    dimObj &&
      Object.keys(dimObj).some(
        k => k !== 'gate_conflicts' && k !== 'soft_gate_override' && typeof dimObj[k] === 'number',
      ),
  )

  const detailsLocked = Boolean(userInfo?.progressive_disclosure && !userInfo.progressive_disclosure.mutual_details)
  const partnerFirst = partnerFirstName(userInfo?.first_name, partnerDisplayName)

  const insightSource =
    typeof compat?.personalized_explanation === 'string' && compat.personalized_explanation.trim()
      ? compat.personalized_explanation
      : compat
        ? deterministicCompatSummary(compat)
        : null
  const insightShort = insightSource ? shortenInsight(insightSource) : null

  return (
    <div
      data-messenger-profile-pane
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-[hsl(var(--chat-bg-primary))] text-gray-900 dark:text-slate-100"
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-4">
        <div className="min-w-0 flex-1 pr-3">
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-xl">
            Match Insights
          </h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hidden h-11 w-11 shrink-0 touch-manipulation rounded-full p-0 text-gray-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white lg:inline-flex"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close profile panel</span>
          </Button>
        )}
      </div>

      <div
        data-profile-pane-scroll
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth touch-pan-y [scrollbar-gutter:stable]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-2 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
          {showSkeleton ? (
            <div className="space-y-4">
              <div className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
              <div className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
              <div className="h-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white py-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:bg-slate-800">
              <p className="text-sm text-gray-600 dark:text-slate-400">{error}</p>
            </div>
          ) : (
            <>
              <ProfileCard>
                <div className="flex flex-col items-center text-center">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Compatibility
                  </p>
                  {compatPending ? (
                    <div className="h-28 w-28 animate-pulse rounded-full bg-violet-100 dark:bg-slate-700" />
                  ) : mainPct != null ? (
                    <>
                      <VibeAlignmentRing percent={mainPct} />
                      <p className={cn('mt-3 text-sm font-semibold', vibeAlignmentTextClass(mainPct))}>
                        {vibeAlignmentBand(mainPct)}
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                        {vibeAlignmentSubtitle(mainPct)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Alignment details will appear once both profiles are ready.
                    </p>
                  )}
                </div>

                {insightShort && (
                  <div className="mt-5 rounded-xl bg-[hsl(var(--chat-active-fill))] px-3 py-3 text-left dark:bg-violet-950/40">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                      <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                      Insight
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{insightShort}</p>
                  </div>
                )}

                {hasDimensionDetails && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center gap-2 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/40"
                      onClick={() => setShowDetails(v => !v)}
                    >
                      <Sparkles className="h-4 w-4" />
                      {showDetails ? 'Hide module breakdown' : 'Dimension breakdown'}
                      {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                )}

                {showDetails && hasDimensionDetails && dimObj && (
                  <div className="mt-3 space-y-2.5">
                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-500">
                      How similarly you answered on each questionnaire module.
                    </p>
                    {useV2Modules
                      ? V2_CHAT_MODULES.map(mod => {
                          const score = dimObj[mod.key]
                          if (typeof score !== 'number') return null
                          const dimPct = pctFromFraction(score) ?? 0
                          return (
                            <div
                              key={mod.key}
                              className="rounded-xl bg-slate-100/90 px-3 py-3 dark:bg-slate-900/80"
                            >
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                  {mod.label}
                                </span>
                                <span
                                  className={cn(
                                    'shrink-0 text-xs font-bold tabular-nums',
                                    vibeAlignmentTextClass(dimPct),
                                  )}
                                >
                                  {dimPct}%
                                </span>
                              </div>
                              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-[width] duration-500 ease-out',
                                    vibeAlignmentBarClass(dimPct),
                                  )}
                                  style={{ width: `${dimPct}%` }}
                                />
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{mod.blurb}</p>
                            </div>
                          )
                        })
                      : Object.entries(dimObj).map(([key, score]) => {
                          if (key === 'gate_conflicts' || key === 'soft_gate_override') return null
                          if (typeof score !== 'number') return null
                          const dimPct = pctFromFraction(score) ?? 0
                          return (
                            <div
                              key={key}
                              className="rounded-xl bg-slate-100/90 px-3 py-3 dark:bg-slate-900/80"
                            >
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                  {legacyDimensionLabel(key)}
                                </span>
                                <span
                                  className={cn(
                                    'shrink-0 text-xs font-bold tabular-nums',
                                    vibeAlignmentTextClass(dimPct),
                                  )}
                                >
                                  {dimPct}%
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-[width] duration-500 ease-out',
                                    vibeAlignmentBarClass(dimPct),
                                  )}
                                  style={{ width: `${dimPct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                  </div>
                )}
              </ProfileCard>

              <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Student profile
              </p>

              <ProfileCard>
                <SectionTitle>Bio</SectionTitle>
                {userInfo?.bio && userInfo.bio.trim() ? (
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap dark:text-slate-200">
                    {userInfo.bio}
                  </p>
                ) : detailsLocked ? (
                  <ProgressiveProfileLockHint partnerFirstName={userInfo?.first_name} what="their bio" />
                ) : (
                  <div className={emptyStateBoxClass}>
                    <p className="mb-2">No bio yet. A short intro helps the chat feel less awkward.</p>
                    {onComposeNudge && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300"
                        onClick={() => onComposeNudge(nudgeBioMessage(partnerFirst))}
                      >
                        Prompt {partnerFirst} for a bio
                      </Button>
                    )}
                  </div>
                )}
              </ProfileCard>

              <ProfileCard>
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
                              ? 'border-transparent bg-violet-600 text-white hover:bg-violet-500'
                              : 'border-transparent bg-[hsl(var(--chat-active-fill))] text-violet-900 hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-200',
                          )}
                        >
                          {interestEmoji(interest)} {interest}
                        </Badge>
                      )
                    })}
                  </div>
                ) : detailsLocked ? (
                  <ProgressiveProfileLockHint partnerFirstName={userInfo?.first_name} what="their interests" />
                ) : (
                  <div className={emptyStateBoxClass}>
                    Interests will show as tags once they add some.
                  </div>
                )}
              </ProfileCard>

              <ProfileCard>
                <SectionTitle>Housing</SectionTitle>
                <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300">
                  {detailsLocked ? (
                    <ProgressiveProfileLockHint partnerFirstName={userInfo?.first_name} what="their housing preferences" />
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {userInfo?.housing_status && userInfo.housing_status.length > 0 ? (
                          userInfo.housing_status.map(key => (
                            <StatusBadge
                              key={key}
                              statusKey={key}
                              variant="secondary"
                              className="border-transparent bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                            />
                          ))
                        ) : null}
                        {(userInfo?.budget_min != null || userInfo?.budget_max != null) && (
                          <Badge
                            variant="secondary"
                            className="rounded-full border-transparent bg-amber-50 px-3 py-1.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                          >
                            💰{' '}
                            {userInfo.budget_min != null && userInfo.budget_max != null
                              ? `€${userInfo.budget_min}–€${userInfo.budget_max}`
                              : userInfo.budget_min != null
                                ? `€${userInfo.budget_min}+`
                                : `up to €${userInfo.budget_max}`}
                          </Badge>
                        )}
                        {userInfo?.preferred_cities?.map(city => (
                          <Badge
                            key={city}
                            variant="secondary"
                            className="rounded-full border-transparent bg-sky-50 px-3 py-1.5 text-xs text-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                          >
                            📍 {city}
                          </Badge>
                        ))}
                      </div>
                      {!(userInfo?.housing_status && userInfo.housing_status.length > 0) &&
                        userInfo?.budget_min == null &&
                        userInfo?.budget_max == null &&
                        !(userInfo?.preferred_cities && userInfo.preferred_cities.length > 0) && (
                          <div className={emptyStateBoxClass}>
                            <p className="mb-2">Housing prefs are empty. A gentle nudge helps compare plans.</p>
                            {onComposeNudge && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="rounded-full border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300"
                                onClick={() => onComposeNudge(nudgeHousingMessage(partnerFirst))}
                              >
                                Nudge {partnerFirst} on housing
                              </Button>
                            )}
                          </div>
                        )}
                    </>
                  )}
                </div>
              </ProfileCard>

              {userInfo?.user_type === 'professional' ? (
                <ProfileCard>
                  <SectionTitle>Professional lifestyle</SectionTitle>
                  {detailsLocked ? (
                    <ProgressiveProfileLockHint
                      partnerFirstName={userInfo?.first_name}
                      what="their work and lifestyle details"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Badge className="rounded-full border-transparent bg-zinc-100 px-3 py-1.5 text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                        {formatWfhStatus(userInfo?.wfh_status)}
                      </Badge>
                      {userInfo?.age != null && (
                        <Badge className="rounded-full border-transparent bg-zinc-100 px-3 py-1.5 text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                          {userInfo.age} years old
                        </Badge>
                      )}
                      {userInfo?.work_schedule && (
                        <Badge className="rounded-full border-transparent bg-zinc-100 px-3 py-1.5 text-xs text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100">
                          {userInfo.work_schedule}
                        </Badge>
                      )}
                    </div>
                  )}
                </ProfileCard>
              ) : (
                <ProfileCard>
                  <SectionTitle>University</SectionTitle>
                  {detailsLocked ? (
                    <ProgressiveProfileLockHint partnerFirstName={userInfo?.first_name} what="their university details" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userInfo?.university_name && (
                        <Badge className="rounded-full border-transparent bg-indigo-50 px-3 py-1.5 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                          <GraduationCap className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                          {userInfo.university_name}
                        </Badge>
                      )}
                      {userInfo?.programme_name && (
                        <Badge className="rounded-full border-transparent bg-violet-50 px-3 py-1.5 text-xs text-violet-900 dark:bg-violet-950/40 dark:text-violet-200">
                          <BookOpen className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                          {userInfo.programme_name}
                        </Badge>
                      )}
                      {userInfo?.degree_level && (
                        <Badge className="rounded-full border-transparent bg-fuchsia-50 px-3 py-1.5 text-xs text-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-fuchsia-200">
                          {userInfo.degree_level}
                        </Badge>
                      )}
                      {userInfo?.study_year != null && (
                        <Badge className="rounded-full border-transparent bg-sky-50 px-3 py-1.5 text-xs text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                          Year {userInfo.study_year}
                        </Badge>
                      )}
                      {!userInfo?.university_name &&
                        !userInfo?.programme_name &&
                        userInfo?.study_year == null &&
                        !userInfo?.degree_level && (
                          <div className={emptyStateBoxClass}>
                            University details will appear as verified badges once available.
                          </div>
                        )}
                    </div>
                  )}
                </ProfileCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
