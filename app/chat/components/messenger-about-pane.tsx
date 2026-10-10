'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VerifiedBadge } from '@/components/verification/verified-badge'
import { safeLogger } from '@/lib/utils/logger'
import { getHousingStatus, type HousingStatusKey } from '@/lib/constants/housing-status'
import { createClient } from '@/lib/supabase/client'
import { nudgeBioMessage, nudgeHousingMessage, partnerFirstName } from '@/lib/chat/conversation-prompts'
import { queryKeys } from '@/app/providers'
import type { ChatPrivacySnapshot } from '@/lib/privacy/profile-access-types'
import {
  MessengerPaneFactRow,
  MessengerPaneHeader,
  MessengerPaneSection,
  MessengerPaneSectionTitle,
  paneBodyClass,
  paneFlatContentClass,
  paneMutedClass,
  paneNudgeButtonClass,
  paneScrollClass,
  paneShellClass,
} from './messenger-pane-chrome'

interface UserInfoData {
  first_name: string | null
  last_name: string | null
  bio: string | null
  interests: string[]
  housing_status?: HousingStatusKey[]
  budget_min?: number | null
  budget_max?: number | null
  budget_unknown?: boolean
  preferred_cities?: string[]
  user_type?: 'student' | 'professional' | null
  age?: number | null
  wfh_status?: string | null
  work_schedule?: string | null
  university_name: string | null
  programme_name: string | null
  degree_level: string | null
  study_year: number | null
  is_verified?: boolean
}

interface MessengerAboutPaneProps {
  chatId: string
  isOpen: boolean
  onClose?: () => void
  onComposeNudge?: (message: string) => void
  /** Chat header / sidebar display name used when profile first_name is hidden */
  partnerDisplayName?: string | null
  /**
   * Privacy-gated partner image URL (shared photo when mutual, otherwise programmatic icon).
   * Displayed as a larger non-interactive portrait in this panel.
   */
  partnerAvatar?: string | null
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

function formatDegreeLevel(level: string | null | undefined): string | null {
  if (!level || typeof level !== 'string') return null
  const trimmed = level.trim()
  if (!trimmed) return null
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

export function MessengerAboutPane({
  chatId,
  isOpen,
  onClose,
  onComposeNudge,
  partnerDisplayName,
  partnerAvatar,
}: MessengerAboutPaneProps) {
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
  const [currentUserInterests, setCurrentUserInterests] = useState<string[]>([])
  const [userLoading, setUserLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerUserId, setViewerUserId] = useState<string | null>(null)

  const { data: privacySnap } = useQuery<ChatPrivacySnapshot | null>({
    queryKey: queryKeys.chatPrivacy(chatId, viewerUserId),
    queryFn: async () => {
      const r = await fetch(`/api/chat/privacy-state?chatId=${encodeURIComponent(chatId)}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!r.ok) return null
      return (await r.json()) as ChatPrivacySnapshot
    },
    enabled: Boolean(isOpen && chatId && viewerUserId),
    staleTime: 15_000,
  })

  const fetchUserProfile = useCallback(async () => {
    if (!isOpen) return

    setUserLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setViewerUserId(user.id)
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
        let message = 'Failed to load profile data'
        try {
          const body = await userInfoResponse.json()
          if (typeof body?.error === 'string' && body.error.trim()) message = body.error
        } catch {
          // ignore parse errors
        }
        safeLogger.warn('[MessengerAboutPane] Failed to fetch user info', {
          status: userInfoResponse.status,
          message,
        })
        setError(message)
      }
    } catch (err) {
      safeLogger.error('[MessengerAboutPane] Error fetching profile:', err)
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

  const showSkeleton = userLoading && !userInfo && !error
  const partnerFirst = partnerFirstName(userInfo?.first_name, partnerDisplayName)
  const meetTitle =
    partnerFirst && partnerFirst.toLowerCase() !== 'there' ? `Meet ${partnerFirst}` : 'Meet them'
  const isVerified = Boolean(userInfo?.is_verified)
  const portraitName =
    partnerFirst && partnerFirst.toLowerCase() !== 'there'
      ? partnerFirst
      : partnerDisplayName?.trim() || 'User'
  const portraitInitial = portraitName.charAt(0).toUpperCase() || '?'
  // Prefer privacy snapshot (signed photo when mutual, else programmatic icon) over
  // bubbled layout state, which can race when two conversation instances mount.
  const portraitSrc =
    privacySnap?.partner_picture_signed_url?.trim() ||
    privacySnap?.partner_avatar_url?.trim() ||
    partnerAvatar?.trim() ||
    undefined

  return (
    <div
      data-messenger-profile-pane
      data-messenger-about-pane
      className={paneShellClass}
    >
      <MessengerPaneHeader
        title={meetTitle}
        subtitle="Intro, living plans, studies, and interests"
        trailing={<VerifiedBadge verified={isVerified} size="md" />}
        onClose={onClose}
        closeLabel="Close about panel"
      />

      <div
        data-profile-pane-scroll
        className={paneScrollClass}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className={paneFlatContentClass}>
          {showSkeleton ? (
            <div className="space-y-8 pt-2">
              <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
              </div>
            </div>
          ) : error ? (
            <p className={`${paneMutedClass} py-12 text-center`}>{error}</p>
          ) : (
            <>
              <div className="flex justify-center">
                <Avatar
                  className="pointer-events-none h-28 w-28 select-none ring-4 ring-violet-100 dark:ring-violet-500/25 sm:h-32 sm:w-32"
                  aria-label={`${portraitName}'s profile picture`}
                >
                  <AvatarImage src={portraitSrc} alt="" className="object-cover" />
                  <AvatarFallback className="bg-purple-600 text-3xl font-semibold text-white sm:text-4xl">
                    {portraitInitial}
                  </AvatarFallback>
                </Avatar>
              </div>

              <MessengerPaneSection className="space-y-4">
                <div className="space-y-2">
                  <MessengerPaneSectionTitle>Quick intro</MessengerPaneSectionTitle>
                  {userInfo?.bio && userInfo.bio.trim() ? (
                    <p className={`${paneBodyClass} whitespace-pre-wrap`}>{userInfo.bio}</p>
                  ) : (
                    <div className="space-y-2.5">
                      <p className={paneMutedClass}>
                        No bio yet. A short intro helps the chat feel less awkward.
                      </p>
                      {onComposeNudge && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={paneNudgeButtonClass}
                          onClick={() => onComposeNudge(nudgeBioMessage(partnerFirst))}
                        >
                          Prompt {partnerFirst} for a bio
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </MessengerPaneSection>

              <MessengerPaneSection className="space-y-4">
                <div className="space-y-2">
                  <MessengerPaneSectionTitle>Living plans</MessengerPaneSectionTitle>
                  {(() => {
                    const statuses =
                      userInfo?.housing_status
                        ?.map(key => getHousingStatus(key))
                        .filter((s): s is NonNullable<typeof s> => Boolean(s)) ?? []
                    const hasBudget =
                      Boolean(userInfo?.budget_unknown) ||
                      userInfo?.budget_min != null ||
                      userInfo?.budget_max != null
                    const cities = userInfo?.preferred_cities ?? []
                    const hasAny = statuses.length > 0 || hasBudget || cities.length > 0

                    if (!hasAny) {
                      return (
                        <div className="space-y-2.5">
                          <p className={paneMutedClass}>
                            Housing prefs are empty. A gentle nudge helps compare plans.
                          </p>
                          {onComposeNudge && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className={paneNudgeButtonClass}
                              onClick={() => onComposeNudge(nudgeHousingMessage(partnerFirst))}
                            >
                              Nudge {partnerFirst} on housing
                            </Button>
                          )}
                        </div>
                      )
                    }

                    const budgetLabel = userInfo?.budget_unknown
                      ? 'Not sure yet'
                      : userInfo?.budget_min != null && userInfo?.budget_max != null
                        ? `€${userInfo.budget_min}–€${userInfo.budget_max}/mo`
                        : userInfo?.budget_min != null
                          ? `€${userInfo.budget_min}+/mo`
                          : `Up to €${userInfo?.budget_max}/mo`

                    return (
                      <div className="space-y-3.5">
                        {statuses.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {statuses.map(s => (
                              <span
                                key={s.key}
                                className="rounded-full border border-indigo-200/80 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-200"
                              >
                                {s.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {hasBudget && (
                          <MessengerPaneFactRow label="Budget">{budgetLabel}</MessengerPaneFactRow>
                        )}
                        {cities.length > 0 && (
                          <MessengerPaneFactRow label={cities.length === 1 ? 'City' : 'Cities'}>
                            {cities.join(', ')}
                          </MessengerPaneFactRow>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </MessengerPaneSection>

              {userInfo?.user_type === 'professional' ? (
                <MessengerPaneSection className="space-y-4">
                  <div className="space-y-2">
                    <MessengerPaneSectionTitle>Work setup</MessengerPaneSectionTitle>
                    <div className="space-y-3.5">
                      <MessengerPaneFactRow label="Work style">
                        {formatWfhStatus(userInfo?.wfh_status)}
                      </MessengerPaneFactRow>
                      {userInfo?.age != null && (
                        <MessengerPaneFactRow label="Age">
                          {userInfo.age} years old
                        </MessengerPaneFactRow>
                      )}
                      {userInfo?.work_schedule && (
                        <MessengerPaneFactRow label="Schedule">
                          {userInfo.work_schedule}
                        </MessengerPaneFactRow>
                      )}
                    </div>
                  </div>
                </MessengerPaneSection>
              ) : (
                <MessengerPaneSection className="space-y-4">
                  <div className="space-y-2">
                    <MessengerPaneSectionTitle>Study details</MessengerPaneSectionTitle>
                    {userInfo?.university_name ||
                    userInfo?.programme_name ||
                    userInfo?.study_year != null ||
                    userInfo?.degree_level ? (
                      <div className="space-y-3.5">
                        {userInfo?.university_name && (
                          <MessengerPaneFactRow label="University">
                            {userInfo.university_name}
                          </MessengerPaneFactRow>
                        )}
                        {userInfo?.programme_name && (
                          <MessengerPaneFactRow label="Programme">
                            {userInfo.programme_name}
                          </MessengerPaneFactRow>
                        )}
                        {(userInfo?.degree_level || userInfo?.study_year != null) && (
                          <MessengerPaneFactRow label="Degree & year">
                            {[
                              formatDegreeLevel(userInfo?.degree_level),
                              userInfo?.study_year != null
                                ? `Year ${userInfo.study_year}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </MessengerPaneFactRow>
                        )}
                      </div>
                    ) : (
                      <p className={paneMutedClass}>
                        University details will appear once available.
                      </p>
                    )}
                  </div>
                </MessengerPaneSection>
              )}

              <MessengerPaneSection className="space-y-4">
                <div className="space-y-2">
                  <MessengerPaneSectionTitle>Hobbies & interests</MessengerPaneSectionTitle>
                  {userInfo?.interests && userInfo.interests.length > 0 ? (
                    <ul className="flex flex-wrap gap-2" aria-label="Hobbies and interests">
                      {userInfo.interests.map((interest, index) => {
                        const isShared = currentUserInterests.includes(interest)
                        return (
                          <li key={index}>
                            <span
                              className={
                                isShared
                                  ? 'inline-flex items-center rounded-full border border-teal-200/90 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800 dark:border-teal-500/35 dark:bg-teal-950/45 dark:text-teal-200'
                                  : 'inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-800 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-200'
                              }
                            >
                              {interest}
                              {isShared ? (
                                <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-300">
                                  Shared
                                </span>
                              ) : null}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className={paneMutedClass}>Interests will show here once they add some.</p>
                  )}
                </div>
              </MessengerPaneSection>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
