'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Check,
  X,
  Clock,
  Lock,
  Sparkles,
  MessageCircle,
  UserPlus,
  Handshake,
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { cn } from '@/lib/utils'

interface Member {
  chat_member_id: string
  /** Peer auth user id — used only for pairwise match APIs, never rendered */
  user_id: string
  name: string
  /** True when this row is the signed-in viewer */
  is_you?: boolean
  program: string
  university: string
  membership_status: 'active' | 'invited'
  compatibility?: {
    compatibility_score: number
    personality_score: number
    schedule_score: number
    lifestyle_score: number
    social_score: number
    academic_bonus: number
    top_alignment: string
    watch_out: string
    house_rules_suggestion?: string
  } | null
}

interface LockedGroupChatProps {
  chatId: string
  userId: string
  onUnlock?: () => void
}

export function LockedGroupChat({ chatId, userId, onUnlock }: LockedGroupChatProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState({ total: 0, accepted: 0, pending: 0, rejected: 0 })
  const [lockReason, setLockReason] = useState<string | null>(null)
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [pairwiseMatches, setPairwiseMatches] = useState<any[]>([])
  const [isCreator, setIsCreator] = useState(false)
  const [groupName, setGroupName] = useState('Group chat')
  const [groupIntent, setGroupIntent] = useState<string | null>(null)
  const [groupDescription, setGroupDescription] = useState<string | null>(null)
  const [joinedCount, setJoinedCount] = useState(1)
  const [pendingInviteCount, setPendingInviteCount] = useState(0)

  useEffect(() => {
    void loadLockedGroupData()
  }, [chatId, userId])

  const loadLockedGroupData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/chat/groups?chatId=${encodeURIComponent(chatId)}&action=locked-overview`
      )
      if (!response.ok) {
        throw new Error('Failed to load group overview')
      }
      const data = await response.json()
      const chat = data.chat || {}

      setLockReason(chat.lock_reason || null)
      setLockExpiresAt(chat.lock_expires_at || null)
      setIsCreator(chat.created_by === userId)
      setGroupName(
        typeof chat.name === 'string' && chat.name.trim() ? chat.name.trim() : 'Group chat'
      )
      setGroupIntent(chat.group_intent || null)
      setGroupDescription(
        typeof chat.description === 'string' && chat.description.trim()
          ? chat.description.trim()
          : null
      )
      setJoinedCount(typeof data.joined_count === 'number' ? data.joined_count : 1)
      setMembers(
        (data.members || []).map((m: Member) => ({
          ...m,
          is_you: Boolean(m.is_you) || m.user_id === userId || m.name === 'You',
          membership_status: 'active' as const,
          compatibility: null,
        }))
      )
      setPendingInviteCount(
        typeof data.pending_invite_count === 'number'
          ? data.pending_invite_count
          : Array.isArray(data.pending_invitees)
            ? data.pending_invitees.length
            : 0
      )
      setPairwiseMatches(data.pairwise_matches || [])
      setProgress({
        total: data.progress?.total || 0,
        accepted: data.progress?.accepted || 0,
        pending: data.progress?.pending || 0,
        rejected: data.progress?.rejected || 0,
      })

      if (data.chat && data.chat.is_locked === false && onUnlock) {
        onUnlock()
      }
    } catch (error) {
      console.error('Failed to load locked group data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptReject = async (otherUserId: string, action: 'accept' | 'reject') => {
    setIsProcessing(otherUserId)
    try {
      const response = await fetchWithCSRF('/api/chat/pairwise-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          other_user_id: otherUserId,
          action
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process match')
      }

      const { progress: newProgress, can_unlock } = await response.json()
      
      if (newProgress) {
        setProgress({
          total: newProgress.total_pairs || 0,
          accepted: newProgress.accepted_pairs || 0,
          pending: newProgress.pending_pairs || 0,
          rejected: newProgress.rejected_pairs || 0
        })
      }

      await loadLockedGroupData()

      // If unlocked, notify parent
      if (can_unlock && onUnlock) {
        setTimeout(() => {
          onUnlock()
        }, 1000)
      }
    } catch (error: any) {
      console.error('Failed to process match:', error)
      alert(error.message || 'Failed to process match. Please try again.')
    } finally {
      setIsProcessing(null)
    }
  }

  const getMemberStatus = (
    memberId: string
  ): 'pending' | 'accepted' | 'rejected' | 'already_matched' => {
    // Find pairwise match between current user and this member
    const userAId = userId < memberId ? userId : memberId
    const userBId = userId < memberId ? memberId : userId
    
    const match = pairwiseMatches.find(
      pm => pm.user_a_id === userAId && pm.user_b_id === userBId
    )

    // No pairwise row means they were already matched before the group was created
    if (!match) return 'already_matched'
    if (match.status === 'accepted') return 'accepted'
    if (match.status === 'rejected') return 'rejected'
    return 'pending'
  }

  const getTimeRemaining = () => {
    if (!lockExpiresAt) return null
    const expires = new Date(lockExpiresAt)
    const now = new Date()
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m remaining`
  }

  const handleCancelGroup = async () => {
    if (!confirm('Are you sure you want to cancel this group? All invitations will be cancelled and members will be notified.')) {
      return
    }

    setIsProcessing('cancel')
    try {
      const response = await fetchWithCSRF('/api/chat/groups/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel group')
      }

      alert('Group cancelled successfully')
      if (onUnlock) {
        onUnlock() // This will navigate away
      }
    } catch (error: any) {
      console.error('Failed to cancel group:', error)
      alert(error.message || 'Failed to cancel group. Please try again.')
    } finally {
      setIsProcessing(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 animate-pulse">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-200 dark:bg-white/10" />
          <div className="mx-auto h-5 w-40 rounded-full bg-zinc-200 dark:bg-white/10" />
          <div className="mx-auto h-3 w-56 rounded-full bg-zinc-200 dark:bg-white/10" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-36 rounded-2xl bg-zinc-200 dark:bg-white/10" />
            <div className="h-36 rounded-2xl bg-zinc-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  const intentLabel =
    groupIntent === 'housing'
      ? 'Housing'
      : groupIntent === 'study'
        ? 'Study'
        : groupIntent === 'social'
          ? 'Social'
          : groupIntent
            ? 'General'
            : null
  const joinsDone = pendingInviteCount === 0
  const matchesDone =
    joinsDone &&
    progress.total > 0 &&
    progress.accepted === progress.total &&
    progress.pending === 0
  const currentStep: 1 | 2 | 3 = !joinsDone ? 1 : !matchesDone ? 2 : 3
  const timeLeft = getTimeRemaining()

  // Full roster: You + other joined members + anonymous pending invite slots
  const roster: Member[] = [
    ...members.map((m) => ({ ...m, membership_status: 'active' as const })),
    ...Array.from({ length: pendingInviteCount }, (_, i) => ({
      chat_member_id: `pending-invite-${i}`,
      user_id: '',
      name: `Member ${members.length + i + 1}`,
      is_you: false,
      program: '',
      university: '',
      membership_status: 'invited' as const,
      compatibility: null,
    })),
  ]

  const timelineSteps: Array<{
    id: 1 | 2 | 3
    title: string
    detail: string
    icon: typeof UserPlus
  }> = [
    {
      id: 1,
      title: 'People join',
      detail: joinsDone
        ? 'Everyone invited has joined'
        : `${pendingInviteCount} invite${pendingInviteCount === 1 ? '' : 's'} still pending`,
      icon: UserPlus,
    },
    {
      id: 2,
      title: 'Accept matches',
      detail:
        progress.total > 0
          ? `${progress.accepted} of ${progress.total} matches accepted`
          : joinsDone
            ? 'Review matches with joined members'
            : 'Opens as people join',
      icon: Handshake,
    },
    {
      id: 3,
      title: 'Chat unlocks',
      detail: matchesDone
        ? 'Opening the group chat…'
        : 'Message the whole group once ready',
      icon: MessageCircle,
    },
  ]

  const activeStep = timelineSteps.find((s) => s.id === currentStep) ?? timelineSteps[0]
  const ActiveIcon = activeStep.icon
  const matchProgressPct =
    progress.total > 0 ? Math.round((progress.accepted / progress.total) * 100) : 0
  const stepProgressPct = currentStep === 1 ? 16 : currentStep === 2 ? 50 + matchProgressPct * 0.28 : 100

  const pendingDecisions = roster.filter((m) => {
    if (m.is_you || m.name === 'You') return false
    if (m.membership_status === 'invited' || !m.user_id) return false
    return getMemberStatus(m.user_id) === 'pending'
  }).length

  return (
    <div className="flex w-full flex-col items-center px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Hero header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-5 py-6 text-white shadow-lg shadow-indigo-500/20 sm:px-6 sm:py-7">
          <div
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-fuchsia-400/20 blur-2xl"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                  <Lock className="h-3 w-3" />
                  Locked until everyone is ready
                </span>
                {timeLeft ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-medium tabular-nums">
                    <Clock className="h-3 w-3" />
                    {timeLeft.replace(' remaining', '')}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                    {groupName}
                  </h2>
                  <p className="mt-0.5 text-sm text-white/75">
                    {[intentLabel, `${joinedCount} joined`].filter(Boolean).join(' · ')}
                    {pendingInviteCount > 0 ? ` · ${pendingInviteCount} invited` : ''}
                  </p>
                </div>
              </div>

              {groupDescription ? (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/80">
                  {groupDescription}
                </p>
              ) : null}
            </div>
          </div>

          {/* Compact progress track — solid circle pads mask the line so it never shows through */}
          <div className="relative mt-6 isolate">
            <div
              className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-[14px] z-0 h-1 overflow-hidden rounded-full bg-white/20"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${stepProgressPct}%` }}
              />
            </div>
            <ol className="relative z-10 grid grid-cols-3" aria-label="Group setup timeline">
              {timelineSteps.map((step) => {
                const isDone = step.id < currentStep || (step.id === 3 && matchesDone)
                const isCurrent = step.id === currentStep
                return (
                  <li key={step.id} className="flex flex-col items-center text-center">
                    <span
                      className={cn(
                        // Solid fill + opaque ring pads the track so the line never shows through
                        'relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300',
                        'ring-[6px] ring-indigo-600',
                        isDone && 'bg-emerald-400 text-emerald-950 shadow-sm shadow-emerald-400/40',
                        isCurrent && 'bg-white text-indigo-600 shadow-md shadow-black/10',
                        !isDone && !isCurrent && 'bg-indigo-700 text-white/80'
                      )}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step.id}
                    </span>
                    <span
                      className={cn(
                        'mt-2 text-[11px] font-medium sm:text-xs',
                        isCurrent ? 'text-white' : 'text-white/65'
                      )}
                    >
                      {step.title}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        {/* Focused current-step callout */}
        <section
          className={cn(
            'mt-4 rounded-2xl border px-4 py-3.5 sm:px-5',
            'border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-400/20 dark:bg-indigo-500/10'
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <ActiveIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-50">
                  {activeStep.title}
                </p>
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Now
                </span>
              </div>
              <p className="mt-0.5 text-sm text-indigo-800/80 dark:text-indigo-100/75">
                {activeStep.detail}
                {currentStep === 2 && pendingDecisions > 0
                  ? ` · ${pendingDecisions} left for you`
                  : ''}
              </p>
              {currentStep === 2 && progress.total > 0 ? (
                <div className="mt-2.5 flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-indigo-200/70 dark:bg-indigo-400/20">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-700 ease-out dark:bg-indigo-400"
                      style={{ width: `${matchProgressPct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-indigo-700 dark:text-indigo-200">
                    {progress.accepted}/{progress.total}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          {lockReason ? (
            <p className="mt-2.5 text-xs text-amber-700 dark:text-amber-300">{lockReason}</p>
          ) : null}
        </section>

        {/* Members */}
        <section className="mt-4">
          <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Members
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {joinedCount} joined
                {pendingInviteCount > 0 ? ` · ${pendingInviteCount} pending` : ''}
                {` · ${roster.length} total`}
                {' · '}identities stay private until unlock
              </p>
            </div>
            {isCreator ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-zinc-500 hover:text-red-600"
                disabled={isProcessing === 'cancel'}
                onClick={() => void handleCancelGroup()}
              >
                Cancel
              </Button>
            ) : null}
          </div>

          {roster.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center dark:border-white/10">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
              <p className="text-sm text-zinc-500">No members yet.</p>
            </div>
          ) : (
            <ul
              className={cn(
                'grid gap-3',
                roster.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
              )}
            >
              {roster.map((member, index) => {
                const isYou = Boolean(member.is_you) || member.name === 'You'
                const isInvitePending = member.membership_status === 'invited'
                const isProcessingMember =
                  !isYou && Boolean(member.user_id) && isProcessing === member.user_id
                const memberStatus =
                  isYou || isInvitePending ? null : getMemberStatus(member.user_id)
                const needsAction = !isYou && !isInvitePending && memberStatus === 'pending'
                const displayName = isYou
                  ? 'You'
                  : member.name?.trim() || `Member ${index + 1}`

                return (
                  <li
                    key={member.chat_member_id}
                    className={cn(
                      'group relative flex flex-col rounded-2xl border p-4 transition-all duration-200',
                      isYou
                        ? 'border-indigo-200/80 bg-indigo-50/60 dark:border-indigo-400/25 dark:bg-indigo-500/10'
                        : needsAction
                          ? 'border-indigo-300/70 bg-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/15 dark:border-indigo-400/30 dark:bg-zinc-900/80 dark:shadow-indigo-500/5'
                          : 'border-zinc-200/80 bg-white/80 dark:border-white/10 dark:bg-zinc-900/50',
                      !isYou &&
                        (memberStatus === 'accepted' || memberStatus === 'already_matched')
                        ? 'opacity-90'
                        : null
                    )}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold',
                            isYou
                              ? 'bg-indigo-600 text-white'
                              : isInvitePending
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'
                                : needsAction
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'
                                  : 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
                          )}
                        >
                          {isInvitePending ? (
                            <Clock className="h-4 w-4" />
                          ) : isYou ? (
                            'Y'
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {displayName}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            {isYou
                              ? 'That’s you · already in the group'
                              : isInvitePending
                                ? 'Invite pending'
                                : memberStatus === 'accepted' ||
                                    memberStatus === 'already_matched'
                                  ? 'Ready to chat'
                                  : memberStatus === 'rejected'
                                    ? 'Declined'
                                    : 'Waiting on you'}
                          </p>
                        </div>
                      </div>

                      {isYou ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-indigo-300/80 bg-white/80 px-2 py-0.5 text-[10px] text-indigo-700 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-200"
                        >
                          You
                        </Badge>
                      ) : null}
                      {isInvitePending ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
                        >
                          Pending
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {isYou && (
                        <div className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-100/80 text-sm font-medium text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                          In the group
                        </div>
                      )}

                      {!isYou &&
                        !isInvitePending &&
                        (memberStatus === 'accepted' ||
                          memberStatus === 'already_matched') && (
                          <div className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                            {memberStatus === 'already_matched' ? 'Matched' : 'Accepted'}
                          </div>
                        )}

                      {!isYou && !isInvitePending && memberStatus === 'rejected' && (
                        <>
                          <div className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-red-50 text-sm font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300">
                            Declined
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-xs"
                            disabled={isProcessingMember}
                            onClick={() => handleAcceptReject(member.user_id, 'accept')}
                          >
                            Undo
                          </Button>
                        </>
                      )}

                      {!isYou && !isInvitePending && memberStatus === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 shrink-0 rounded-xl p-0"
                            disabled={isProcessingMember}
                            onClick={() => handleAcceptReject(member.user_id, 'reject')}
                            aria-label={`Decline ${displayName}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-9 flex-1 rounded-xl bg-indigo-600 text-sm font-semibold hover:bg-indigo-500"
                            disabled={isProcessingMember}
                            onClick={() => handleAcceptReject(member.user_id, 'accept')}
                          >
                            {isProcessingMember ? '…' : 'Accept'}
                          </Button>
                        </>
                      )}

                      {isInvitePending && (
                        <div className="inline-flex h-9 flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-200 text-xs text-zinc-500 dark:border-white/15 dark:text-zinc-400">
                          Waiting for them to join
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
