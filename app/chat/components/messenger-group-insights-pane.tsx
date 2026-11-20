'use client'

import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Bell,
  BellOff,
  ChevronDown,
  Flag,
  ImageIcon,
  Lock,
  LogOut,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { queryKeys } from '@/app/query-keys'
import {
  fetchGroupPanel,
  updateGroupChatSettings,
  type GroupPanelMember,
  type GroupPanelPayload,
} from '@/lib/chat/fetch-group-panel'
import { VibeAlignmentRing } from './vibe-alignment-ring'
import {
  vibeAlignmentBand,
  vibeAlignmentBarClass,
  vibeAlignmentSubtitle,
  vibeAlignmentTextClass,
} from '@/lib/chat/vibe-alignment'
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { getHousingStatus, type HousingStatusKey } from '@/lib/constants/housing-status'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { GroupFeedbackForm } from './group-feedback-form'
import { ReportUserDialog } from './report-user-dialog'

type PaneMode = 'insights' | 'members' | 'settings'

interface MessengerGroupInsightsPaneProps {
  chatId: string
  isOpen: boolean
  onClose?: () => void
  /** Which section to show first / exclusively when opened from header actions */
  mode?: PaneMode
}

/** Same five modules / labels as 1:1 Match Insights cards */
const GROUP_DIMENSION_ROWS: Array<{
  key: string
  label: string
  legacyKey?: keyof NonNullable<GroupPanelPayload['compatibility']>
}> = [
  { key: 'logistics-context', label: 'Logistics', legacyKey: 'academic_score' },
  { key: 'environment-rhythms', label: 'Environment', legacyKey: 'schedule_score' },
  { key: 'cleanliness-operations', label: 'Cleanliness', legacyKey: 'lifestyle_score' },
  { key: 'communication-resolution', label: 'Communication', legacyKey: 'personality_score' },
  { key: 'social-spaces', label: 'Social Life', legacyKey: 'social_score' },
]

function meaningfulText(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value
    .replace(/\u2014/g, '. ') // em dash
    .replace(/\u2013/g, ' to ') // en dash
    .replace(/\s+\.\s+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim()
  if (!trimmed) return null
  if (/^(test|todo|placeholder|n\/a|na)$/i.test(trimmed)) return null
  return trimmed
}

function formatBudget(member: GroupPanelMember): string {
  if (member.budget_unknown) return 'Not sure yet'
  if (member.budget_min != null && member.budget_max != null) {
    return `€${member.budget_min} to €${member.budget_max}/mo`
  }
  if (member.budget_min != null) return `€${member.budget_min}+/mo`
  if (member.budget_max != null) return `Up to €${member.budget_max}/mo`
  return 'Not shared'
}

function pct(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null
  const value = score <= 1 ? score * 100 : score
  return Math.min(100, Math.max(0, Math.round(value)))
}

function syncMutedLocalStorage(chatId: string, muted: boolean) {
  try {
    const mutedChats = JSON.parse(localStorage.getItem('muted_chats') || '[]') as string[]
    const next = muted
      ? mutedChats.includes(chatId)
        ? mutedChats
        : [...mutedChats, chatId]
      : mutedChats.filter((id) => id !== chatId)
    localStorage.setItem('muted_chats', JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('mutedChatsChanged'))
  } catch {
    // ignore storage errors
  }
}

function ScoreBar({ label, percent }: { label: string; percent: number }) {
  return (
    <li className="space-y-1.5 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        <span className={cn('text-sm font-semibold tabular-nums', vibeAlignmentTextClass(percent))}>
          {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn('h-full rounded-full transition-all', vibeAlignmentBarClass(percent))}
          style={{ width: `${percent}%` }}
        />
      </div>
    </li>
  )
}

function MemberCard({
  member,
  index,
  expanded,
  onToggle,
  scoresHidden,
}: {
  member: GroupPanelMember
  index: number
  expanded: boolean
  onToggle: () => void
  scoresHidden?: boolean
}) {
  const pending = member.membership_status === 'invited'
  const isYou = Boolean(member.is_you) || member.display_name === 'You'
  const pairPct = scoresHidden || isYou ? null : pct(member.pairwise_score)
  const canExpand = !isYou && member.identity_revealed && !pending
  const initials = isYou
    ? 'You'
    : member.display_name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || String(index + 1)

  return (
    <li className="border-b border-slate-100 last:border-b-0 dark:border-white/10">
      <button
        type="button"
        onClick={canExpand ? onToggle : undefined}
        disabled={!canExpand}
        className={cn(
          'flex w-full items-center gap-3 px-0 py-3 text-left',
          canExpand && 'touch-manipulation hover:opacity-90',
        )}
      >
        <Avatar className="h-10 w-10 shrink-0">
          {member.avatar_url ? (
            <AvatarImage src={member.avatar_url} alt={member.display_name} />
          ) : null}
          <AvatarFallback
            className={cn(
              'text-xs font-semibold',
              isYou
                ? 'bg-indigo-600 text-white'
                : pending
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200',
            )}
          >
            {pending ? '…' : isYou ? 'Y' : initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
            {member.display_name}
          </p>
          <p className="truncate text-xs text-slate-500">
            {isYou
              ? 'That’s you'
              : pending
                ? 'Invite pending · identity hidden'
                : member.identity_revealed
                  ? [member.program, member.university].filter(Boolean).join(' · ') ||
                    'Tap for study, hobbies & more'
                  : 'Joined · identity hidden until unlock'}
          </p>
        </div>
        {pairPct != null ? (
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {pairPct}%
          </span>
        ) : null}
        {pending ? (
          <Badge
            variant="outline"
            className="shrink-0 border-amber-300 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
          >
            Pending
          </Badge>
        ) : canExpand ? (
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        ) : null}
      </button>

      {expanded && canExpand ? (
        <div className="space-y-3 pb-4 pl-[3.25rem]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">About</p>
            <p className={cn(paneBodyClass, 'mt-1')}>
              {member.bio?.trim() || 'Not shared'}
            </p>
          </div>
          <div className="space-y-3">
            <MessengerPaneFactRow label="Programme">
              {member.program || 'Not shared'}
            </MessengerPaneFactRow>
            <MessengerPaneFactRow label="University">
              {member.university || 'Not shared'}
            </MessengerPaneFactRow>
            <MessengerPaneFactRow label="Degree">
              {[
                member.degree_level
                  ? member.degree_level.charAt(0).toUpperCase() + member.degree_level.slice(1)
                  : null,
                member.study_year != null ? `Started ${member.study_year}` : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Not shared'}
            </MessengerPaneFactRow>
            <MessengerPaneFactRow label="Housing">
              {member.housing_status && member.housing_status.length > 0
                ? member.housing_status
                    .map(
                      (key) =>
                        getHousingStatus(key as HousingStatusKey)?.label ||
                        key.replace(/_/g, ' '),
                    )
                    .join(', ')
                : 'Not shared'}
            </MessengerPaneFactRow>
            <MessengerPaneFactRow label="Budget">{formatBudget(member)}</MessengerPaneFactRow>
            <MessengerPaneFactRow label="Cities">
              {member.preferred_cities.length > 0
                ? member.preferred_cities.join(', ')
                : 'Not shared'}
            </MessengerPaneFactRow>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hobbies</p>
            {member.interests.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {member.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className={cn(paneMutedClass, 'mt-1')}>Not shared</p>
            )}
          </div>
        </div>
      ) : null}
    </li>
  )
}

function SettingsRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-4 last:border-b-0 dark:border-white/10">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  )
}

export function MessengerGroupInsightsPane({
  chatId,
  isOpen,
  onClose,
  mode = 'insights',
}: MessengerGroupInsightsPaneProps) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<PaneMode>(mode === 'settings' ? 'settings' : mode)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [savingMute, setSavingMute] = useState(false)
  const [savingShare, setSavingShare] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<GroupPanelMember | null>(null)

  const { data, isLoading, isFetching, error } = useQuery<GroupPanelPayload | null>({
    queryKey: queryKeys.groupPanel(chatId),
    queryFn: () => fetchGroupPanel(chatId),
    staleTime: 60_000,
    enabled: isOpen && !!chatId,
  })

  useEffect(() => {
    if (!isOpen) return
    setTab(mode)
    setExpandedMember(null)
    setReportTarget(null)
  }, [isOpen, chatId, mode])

  useEffect(() => {
    if (!data?.viewer_settings || !chatId) return
    syncMutedLocalStorage(chatId, data.viewer_settings.muted)
  }, [chatId, data?.viewer_settings?.muted])

  const isLocked = Boolean(data?.chat.is_locked)
  const overallPct = isLocked ? null : pct(data?.compatibility?.overall_score)
  const harmonyPct = isLocked ? null : pct(data?.compatibility?.harmony_score)
  const contextPct = isLocked ? null : pct(data?.compatibility?.context_score)
  const pending = (isLoading || isFetching) && !data
  const muted = Boolean(data?.viewer_settings?.muted)
  const sharePicture = Boolean(data?.viewer_settings?.share_picture)
  const reportableMembers = useMemo(
    () =>
      (data?.members || []).filter(
        (m) =>
          m.membership_status === 'active' &&
          m.user_id &&
          m.identity_revealed &&
          !m.is_you &&
          m.display_name !== 'You',
      ),
    [data?.members],
  )

  const dimensionRows = useMemo(() => {
    const compat = data?.compatibility
    const rows: Array<{ key: string; label: string; percent: number }> = []
    if (!compat) return rows

    for (const { key, label, legacyKey } of GROUP_DIMENSION_ROWS) {
      const fromModules =
        compat.module_scores && typeof compat.module_scores[key] === 'number'
          ? compat.module_scores[key]
          : null
      const fromLegacy =
        legacyKey && typeof compat[legacyKey] === 'number' ? (compat[legacyKey] as number) : null
      const fromContext =
        key === 'logistics-context' && typeof compat.context_score === 'number'
          ? compat.context_score
          : null
      const percent = pct(fromModules ?? fromContext ?? fromLegacy)
      if (percent == null) continue
      rows.push({ key, label, percent })
    }
    return rows
  }, [data?.compatibility])

  const explanation = data?.compatibility?.explanation
  const overviewText = meaningfulText(explanation?.why_works)
  const watchItems = [
    meaningfulText(explanation?.watch_outs),
    meaningfulText(explanation?.why_doesnt_work),
  ].filter((x): x is string => Boolean(x))
  const strengthItems = [meaningfulText(explanation?.top_strength)].filter(
    (x): x is string => Boolean(x),
  )
  const tipText = meaningfulText(explanation?.suggestions)

  const patchSettings = async (patch: { muted?: boolean; share_picture?: boolean }) => {
    const result = await updateGroupChatSettings(chatId, patch)
    if (!result.ok) {
      showErrorToast('Couldn’t update settings', result.error)
      return false
    }
    queryClient.setQueryData<GroupPanelPayload | null>(queryKeys.groupPanel(chatId), (prev) =>
      prev
        ? {
            ...prev,
            viewer_settings: result.viewer_settings,
          }
        : prev,
    )
    if (typeof patch.muted === 'boolean') {
      syncMutedLocalStorage(chatId, patch.muted)
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.groupPanel(chatId) })
    return true
  }

  const handleToggleMute = async (next: boolean) => {
    setSavingMute(true)
    try {
      const ok = await patchSettings({ muted: next })
      if (ok) {
        showSuccessToast(
          next ? 'Chat muted' : 'Chat unmuted',
          next
            ? 'You won’t get notifications from this group.'
            : 'Notifications for this group are on again.',
        )
      }
    } finally {
      setSavingMute(false)
    }
  }

  const handleToggleSharePicture = async (next: boolean) => {
    setSavingShare(true)
    try {
      const ok = await patchSettings({ share_picture: next })
      if (ok) {
        showSuccessToast(
          next ? 'Photo shared in this chat' : 'Photo hidden in this chat',
          next
            ? 'Other members in this group can see your profile photo.'
            : 'Only your profile icon is shown here now.',
        )
      }
    } finally {
      setSavingShare(false)
    }
  }

  const openReportFor = (member: GroupPanelMember) => {
    setReportTarget(member)
    setReportOpen(true)
  }

  if (!isOpen) return null

  const headerTitle =
    tab === 'members' ? 'Group Members' : tab === 'settings' ? 'Group Settings' : 'Group Insights'
  const headerSubtitle =
    tab === 'members'
      ? isLocked
        ? 'Identities stay private until the chat unlocks'
        : 'Study, hobbies, and living details'
      : tab === 'settings'
        ? 'Privacy, notifications, and membership'
        : isLocked
          ? 'Unlocks once everyone has accepted'
          : 'How this group fits together'
  const memberTotal = data?.members.length ?? null

  return (
    <div data-messenger-group-insights-pane className={paneShellClass}>
      <MessengerPaneHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        onClose={onClose}
        closeLabel="Close group insights"
        trailing={
          isLocked && tab === 'insights' ? (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          ) : overallPct != null && tab === 'insights' ? (
            <Badge variant="secondary" className="tabular-nums">
              {overallPct}%
            </Badge>
          ) : null
        }
      />

      <div className="flex shrink-0 gap-1 overflow-x-auto px-5 pb-2">
        {(
          [
            { id: 'insights' as const, label: 'Group fit' },
            {
              id: 'members' as const,
              label: memberTotal != null ? `Members (${memberTotal})` : 'Members (…)',
            },
            { id: 'settings' as const, label: 'Settings' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold touch-manipulation',
              tab === item.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        data-group-pane-scroll
        className={paneScrollClass}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className={paneFlatContentClass}>
          {pending ? (
            <div className="space-y-8 pt-2">
              <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          ) : error || !data ? (
            <p className={`${paneMutedClass} py-12 text-center`}>
              Couldn&apos;t load group details. Try again in a moment.
            </p>
          ) : tab === 'insights' ? (
            isLocked ? (
              <div className="flex flex-col items-center px-2 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                  <Lock className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  Group fit is locked
                </p>
                <p className={cn(paneMutedClass, 'mt-2 max-w-xs')}>
                  Scores, harmony, and dealbreakers stay hidden until everyone has accepted their
                  invite and the chat unlocks.
                </p>
                {data.pending_invite_count > 0 ? (
                  <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                    {data.pending_invite_count} invite
                    {data.pending_invite_count === 1 ? '' : 's'} still pending
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center pt-4 text-center">
                  {overallPct != null ? (
                    <>
                      <VibeAlignmentRing percent={overallPct} />
                      <p
                        className={cn(
                          'mt-4 text-sm font-semibold',
                          vibeAlignmentTextClass(overallPct),
                        )}
                      >
                        {vibeAlignmentBand(overallPct)}
                      </p>
                      <p className="mx-auto mt-1.5 max-w-xs text-sm leading-snug text-slate-500 dark:text-slate-400">
                        {vibeAlignmentSubtitle(overallPct)}
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p className={paneMutedClass}>
                        Group scores appear once enough members have joined.
                      </p>
                    </div>
                  )}
                </div>

                {(harmonyPct != null || contextPct != null) && (
                  <MessengerPaneSection>
                    <MessengerPaneSectionTitle>Group dynamics</MessengerPaneSectionTitle>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-white/5">
                        <p className="text-xs font-medium text-slate-500">Harmony</p>
                        <p
                          className={cn(
                            'mt-1 text-2xl font-semibold tabular-nums',
                            harmonyPct != null
                              ? vibeAlignmentTextClass(harmonyPct)
                              : 'text-slate-400',
                          )}
                        >
                          {harmonyPct != null ? `${harmonyPct}%` : '-'}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">How well the group vibes</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-white/5">
                        <p className="text-xs font-medium text-slate-500">Context</p>
                        <p
                          className={cn(
                            'mt-1 text-2xl font-semibold tabular-nums',
                            contextPct != null
                              ? vibeAlignmentTextClass(contextPct)
                              : 'text-slate-400',
                          )}
                        >
                          {contextPct != null ? `${contextPct}%` : '-'}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">Study & life context</p>
                      </div>
                    </div>
                  </MessengerPaneSection>
                )}

                {data.compatibility?.hard_gate_labels &&
                  data.compatibility.hard_gate_labels.length > 0 && (
                    <MessengerPaneSection>
                      <MessengerPaneSectionTitle>Dealbreaker differences</MessengerPaneSectionTitle>
                      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                        <p className={cn(paneBodyClass, 'text-amber-900 dark:text-amber-100')}>
                          People in this group differ on:{' '}
                          {data.compatibility.hard_gate_labels.join(', ')}.
                        </p>
                      </div>
                    </MessengerPaneSection>
                  )}

                {(overviewText || strengthItems.length > 0 || watchItems.length > 0 || tipText) && (
                  <MessengerPaneSection className="space-y-6">
                    <div className="space-y-2">
                      <MessengerPaneSectionTitle>What to know</MessengerPaneSectionTitle>
                      {overviewText ? (
                        <p className={cn(paneBodyClass, 'text-slate-800 dark:text-slate-100')}>
                          {overviewText}
                        </p>
                      ) : null}
                    </div>
                    {strengthItems.length > 0 ? (
                      <MessengerPaneInsightList
                        title="What works well"
                        items={strengthItems}
                        tone="strength"
                      />
                    ) : null}
                    {watchItems.length > 0 ? (
                      <MessengerPaneInsightList
                        title="What to look out for"
                        items={watchItems}
                        tone="watch"
                      />
                    ) : null}
                    {tipText ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                          Tip
                        </h4>
                        <p className={paneBodyClass}>{tipText}</p>
                      </div>
                    ) : null}
                  </MessengerPaneSection>
                )}

                {dimensionRows.length > 0 && (
                  <MessengerPaneSection>
                    <MessengerPaneSectionTitle>Dimensions</MessengerPaneSectionTitle>
                    <p className={paneMutedClass}>How the group aligns across living habits.</p>
                    <ul>
                      {dimensionRows.map((row) => (
                        <ScoreBar key={row.key} label={row.label} percent={row.percent} />
                      ))}
                    </ul>
                  </MessengerPaneSection>
                )}
              </>
            )
          ) : tab === 'members' ? (
            <MessengerPaneSection>
              <MessengerPaneSectionTitle>
                {data.joined_count} joined
                {data.pending_invite_count > 0
                  ? ` · ${data.pending_invite_count} pending`
                  : ''}
                {` · ${data.members.length} total`}
              </MessengerPaneSectionTitle>
              {data.members.length === 0 ? (
                <p className={paneMutedClass}>No members yet.</p>
              ) : (
                <ul>
                  {data.members.map((member, index) => (
                    <MemberCard
                      key={member.member_key}
                      member={member}
                      index={index}
                      scoresHidden={isLocked}
                      expanded={expandedMember === member.member_key}
                      onToggle={() =>
                        setExpandedMember((current) =>
                          current === member.member_key ? null : member.member_key,
                        )
                      }
                    />
                  ))}
                </ul>
              )}
            </MessengerPaneSection>
          ) : (
            <MessengerPaneSection>
              <MessengerPaneSectionTitle>This chat</MessengerPaneSectionTitle>
              <div>
                <SettingsRow
                  icon={sharePicture ? ImageIcon : ImageIcon}
                  title="Share profile photo"
                  description="Show your uploaded photo to everyone in this group only. Your icon is used until you share."
                >
                  <Switch
                    checked={sharePicture}
                    disabled={savingShare}
                    onCheckedChange={handleToggleSharePicture}
                    aria-label="Share profile photo in this group"
                  />
                </SettingsRow>

                <SettingsRow
                  icon={muted ? BellOff : Bell}
                  title="Mute notifications"
                  description="Stop alerts for new messages in this group. You can still open the chat anytime."
                >
                  <Switch
                    checked={muted}
                    disabled={savingMute}
                    onCheckedChange={handleToggleMute}
                    aria-label="Mute this group chat"
                  />
                </SettingsRow>

                <div className="border-b border-slate-100 py-4 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      <Flag className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Report a member
                      </p>
                      {reportableMembers.length === 0 ? (
                        <p className="mt-0.5 text-xs leading-snug text-slate-500">
                          Reporting is available once member identities are visible.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-1">
                          {reportableMembers.map((member) => (
                            <li key={member.member_key}>
                              <button
                                type="button"
                                onClick={() => openReportFor(member)}
                                className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left text-sm touch-manipulation hover:bg-slate-50 dark:hover:bg-white/5"
                              >
                                <Avatar className="h-7 w-7">
                                  {member.avatar_url ? (
                                    <AvatarImage src={member.avatar_url} alt="" />
                                  ) : null}
                                  <AvatarFallback className="text-[10px]">
                                    {member.display_name.slice(0, 1)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-100">
                                  {member.display_name}
                                </span>
                                <span className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                  Report
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <SettingsRow
                  icon={LogOut}
                  title="Leave group"
                  description="You’ll leave this house-hunt chat and can share optional feedback so we can improve matching."
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    onClick={() => setLeaveOpen(true)}
                  >
                    Leave
                  </Button>
                </SettingsRow>
              </div>
            </MessengerPaneSection>
          )}
        </div>
      </div>

      <GroupFeedbackForm
        chatId={chatId}
        feedbackType="left"
        isOpen={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onSuccess={() => {
          showSuccessToast('Left group', 'You’ve left this group chat.')
          onClose?.()
          window.location.href = '/chat'
        }}
      />

      {reportTarget?.user_id ? (
        <ReportUserDialog
          open={reportOpen}
          onOpenChange={(open) => {
            setReportOpen(open)
            if (!open) setReportTarget(null)
          }}
          chatId={chatId}
          targetUserId={reportTarget.user_id}
          targetDisplayName={reportTarget.display_name}
          variant="user"
        />
      ) : null}
    </div>
  )
}
