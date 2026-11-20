'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { User } from '@supabase/supabase-js'
import {
  Check,
  Home,
  BookOpen,
  Heart,
  Loader2,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'
import { isAnonymizedDeletedProfile } from '@/lib/chat/deleted-profile'
import { cn } from '@/lib/utils'
import { showErrorToast } from '@/lib/toast'

export type CreateConversationMode = 'individual' | 'group'

type SortKey =
  | 'name_asc'
  | 'name_desc'
  | 'compat_high'
  | 'compat_low'
  | 'recent_new'
  | 'recent_old'

interface ConfirmedMatch {
  match_user_id: string
  name: string
  university_name: string
  program_name: string
  compatibility_score: number
  matched_at: number
  /** Shared photo when allowed; otherwise programmatic match icon */
  avatar?: string
}

interface CreateConversationModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  mode: CreateConversationMode
  onCreated: (chatId: string) => void
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'compat_high', label: 'Compatibility: high → low' },
  { value: 'compat_low', label: 'Compatibility: low → high' },
  { value: 'recent_new', label: 'Matched: newest first' },
  { value: 'recent_old', label: 'Matched: oldest first' },
]

function sortMatches(list: ConfirmedMatch[], sort: SortKey): ConfirmedMatch[] {
  const copy = [...list]
  switch (sort) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name))
    case 'compat_high':
      return copy.sort((a, b) => b.compatibility_score - a.compatibility_score)
    case 'compat_low':
      return copy.sort((a, b) => a.compatibility_score - b.compatibility_score)
    case 'recent_new':
      return copy.sort((a, b) => b.matched_at - a.matched_at)
    case 'recent_old':
      return copy.sort((a, b) => a.matched_at - b.matched_at)
    default:
      return copy
  }
}

export function CreateConversationModal({
  isOpen,
  onClose,
  user,
  mode,
  onCreated,
}: CreateConversationModalProps) {
  const supabase = createClient()
  const isGroup = mode === 'group'

  const [matches, setMatches] = useState<ConfirmedMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('compat_high')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [step, setStep] = useState<'pick' | 'confirm'>('pick')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [groupIntent, setGroupIntent] = useState<'housing' | 'study' | 'social' | 'general'>(
    'general'
  )
  const [contextMessage, setContextMessage] = useState('')

  const reset = useCallback(() => {
    setMatches([])
    setSearchQuery('')
    setSort('compat_high')
    setSelectedIds([])
    setStep('pick')
    setIsSubmitting(false)
    setGroupName('')
    setGroupDescription('')
    setGroupIntent('general')
    setContextMessage('')
  }, [])

  useEffect(() => {
    if (!isOpen) {
      reset()
      return
    }
    reset()
  }, [isOpen, mode, reset])

  const loadConfirmedMatches = useCallback(async () => {
    setIsLoading(true)
    try {
      // Same pool for New chat & New group: any non-declined pair match + existing DMs
      // (pending matches like Vitor still appear if you already chat / have a suggestion)
      const { data: suggestions, error } = await supabase
        .from('match_suggestions')
        .select('member_ids, fit_score, created_at, status, accepted_by')
        .eq('kind', 'pair')
        .contains('member_ids', [user.id])

      if (error) {
        console.error('Failed to load matches', error)
        setMatches([])
        return
      }

      const scoreByUser = new Map<string, number>()
      const matchedAtByUser = new Map<string, number>()
      const matchedUserIds = new Set<string>()

      for (const row of suggestions || []) {
        if (row.status === 'declined') continue

        const memberIds = row.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) continue
        const otherId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
        if (!otherId || otherId === user.id) continue
        matchedUserIds.add(otherId)
        const score = typeof row.fit_score === 'number' ? row.fit_score : Number(row.fit_score) || 0
        const prev = scoreByUser.get(otherId)
        if (prev === undefined || score > prev) scoreByUser.set(otherId, score)
        const ts = row.created_at ? new Date(row.created_at).getTime() : 0
        const prevTs = matchedAtByUser.get(otherId) || 0
        if (ts >= prevTs) matchedAtByUser.set(otherId, ts)
      }

      // Locked match records count for both modes
      try {
        const { data: lockedMatches } = await supabase
          .from('match_records')
          .select('user_ids, created_at')
          .eq('locked', true)
          .contains('user_ids', [user.id])

        lockedMatches?.forEach((m: { user_ids?: string[]; created_at?: string }) => {
          const userIds = m.user_ids
          if (!userIds) return
          userIds.forEach((uid) => {
            if (uid !== user.id) {
              matchedUserIds.add(uid)
              const ts = m.created_at ? new Date(m.created_at).getTime() : 0
              const prevTs = matchedAtByUser.get(uid) || 0
              if (ts >= prevTs) matchedAtByUser.set(uid, ts)
              if (!scoreByUser.has(uid)) scoreByUser.set(uid, 0)
            }
          })
        })
      } catch {
        // table may be unavailable
      }

      // Track DM chat per partner so we can resolve shared photos (same as /chat)
      const dmChatIdByPartner = new Map<string, string>()

      try {
        const { data: myMemberships } = await supabase
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', user.id)
          .eq('status', 'active')

        const chatIds = (myMemberships || []).map((m) => m.chat_id).filter(Boolean)
        if (chatIds.length > 0) {
          const { data: dmChats } = await supabase
            .from('chats')
            .select('id, created_at')
            .in('id', chatIds)
            .eq('is_group', false)
            .is('housing_application_id', null)

          const dmIds = (dmChats || []).map((c) => c.id)
          const createdAtByChat = new Map(
            (dmChats || []).map((c) => [c.id, c.created_at ? new Date(c.created_at).getTime() : 0])
          )

          if (dmIds.length > 0) {
            const { data: peers } = await supabase
              .from('chat_members')
              .select('chat_id, user_id')
              .in('chat_id', dmIds)
              .neq('user_id', user.id)

            peers?.forEach((p) => {
              if (!p.user_id || p.user_id === user.id) return
              dmChatIdByPartner.set(p.user_id, p.chat_id)
              // Include existing DM partners in both New chat and New group pickers
              matchedUserIds.add(p.user_id)
              const ts = createdAtByChat.get(p.chat_id) || 0
              const prevTs = matchedAtByUser.get(p.user_id) || 0
              if (ts >= prevTs) matchedAtByUser.set(p.user_id, ts)
              if (!scoreByUser.has(p.user_id)) scoreByUser.set(p.user_id, 0)
            })
          }
        }
      } catch (err) {
        console.warn('Failed to resolve existing DM partners for match picker', err)
      }

      if (matchedUserIds.size === 0) {
        setMatches([])
        return
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(
          `
          user_id,
          first_name,
          last_name,
          program,
          avatar_id,
          is_visible,
          universities(name)
        `
        )
        .in('user_id', Array.from(matchedUserIds))

      if (profilesError || !profiles) {
        setMatches([])
        return
      }

      const isAnonymizedOrHidden = (p: {
        first_name?: string | null
        last_name?: string | null
        is_visible?: boolean | null
        program?: string | null
        is_deleted?: boolean | null
      }) => {
        if (p.is_visible === false) return true
        if (isAnonymizedDeletedProfile(p)) return true
        // Anonymized accounts often store a UUID in program
        if (typeof p.program === 'string' && /^[0-9a-f-]{36}$/i.test(p.program.trim())) {
          return true
        }
        return false
      }

      // Prefer shared photos when mutual picture sharing is on (same privacy path as /chat)
      const sharedAvatarByUser = new Map<string, string>()
      const privacyChatIds = Array.from(new Set(dmChatIdByPartner.values()))
      if (privacyChatIds.length > 0) {
        try {
          const pr = await fetchWithCSRF('/api/chat/privacy-state/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_ids: privacyChatIds }),
          })
          if (pr.ok) {
            const body = (await pr.json()) as {
              by_chat_id?: Record<
                string,
                { partner_user_id: string | null; partner_avatar_url: string | null }
              >
            }
            Object.values(body.by_chat_id || {}).forEach((snap) => {
              if (snap.partner_user_id && snap.partner_avatar_url) {
                sharedAvatarByUser.set(snap.partner_user_id, snap.partner_avatar_url)
              }
            })
          }
        } catch (err) {
          console.warn('Failed to resolve shared avatars for match picker', err)
        }
      }

      const formatted: ConfirmedMatch[] = profiles
        .filter((p: any) => !isAnonymizedOrHidden(p))
        .map((p: any) => {
          const university = Array.isArray(p.universities) ? p.universities[0] : p.universities
          const name =
            [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'User'
          const iconAvatar = programmaticAvatarUrl(p.avatar_id, p.user_id)
          return {
            match_user_id: p.user_id as string,
            name,
            university_name: university?.name || 'University',
            program_name: p.program || 'Program',
            compatibility_score: scoreByUser.get(p.user_id) || 0,
            matched_at: matchedAtByUser.get(p.user_id) || 0,
            avatar: sharedAvatarByUser.get(p.user_id) || iconAvatar,
          }
        })

      setMatches(formatted)
    } finally {
      setIsLoading(false)
    }
  }, [isGroup, supabase, user.id])

  useEffect(() => {
    if (isOpen) {
      void loadConfirmedMatches()
    }
  }, [isOpen, loadConfirmedMatches])

  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const filtered = q
      ? matches.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.university_name.toLowerCase().includes(q) ||
            m.program_name.toLowerCase().includes(q)
        )
      : matches
    return sortMatches(filtered, sort)
  }, [matches, searchQuery, sort])

  const selectedMatches = useMemo(
    () => matches.filter((m) => selectedIds.includes(m.match_user_id)),
    [matches, selectedIds]
  )

  const maxOtherMembers = 5
  const canContinue = isGroup
    ? selectedIds.length >= 2 && selectedIds.length <= maxOtherMembers
    : selectedIds.length === 1

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (!isGroup) {
        return prev.includes(id) ? [] : [id]
      }
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= maxOtherMembers) {
        showErrorToast('Group limit', `You can invite up to ${maxOtherMembers} people.`)
        return prev
      }
      return [...prev, id]
    })
  }

  const handleConfirm = async () => {
    if (!canContinue) return
    setIsSubmitting(true)
    try {
      if (isGroup) {
        const response = await fetchWithCSRF('/api/chat/create-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member_ids: selectedIds,
            name: groupName.trim() || undefined,
            description: groupDescription.trim() || undefined,
            group_intent: groupIntent,
            context_message: contextMessage.trim() || undefined,
          }),
        })
        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to create group')
        }
        const { chat_id } = await response.json()
        onCreated(chat_id)
        onClose()
      } else {
        const otherUserId = selectedIds[0]
        const response = await fetchWithCSRF('/api/chat/get-or-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ other_user_id: otherUserId }),
        })
        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to start chat')
        }
        const { chat_id } = await response.json()
        onCreated(chat_id)
        onClose()
      }
    } catch (e: any) {
      showErrorToast(isGroup ? 'Could not create group' : 'Could not start chat', e.message || 'Try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(92vh,820px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-zinc-100 px-6 py-5 dark:border-white/10">
          <DialogTitle className="text-xl">
            {step === 'confirm'
              ? isGroup
                ? 'Confirm group'
                : 'Confirm chat'
              : isGroup
                ? 'New group'
                : 'New chat'}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">
            {step === 'confirm'
              ? isGroup
                ? 'Review details before inviting people.'
                : 'Start a conversation with this match?'
              : isGroup
                ? 'Select at least 2 matches (or people you already chat with).'
                : 'Pick a match or someone you already chat with.'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {step === 'pick' && (
            <div className="space-y-4">
              <div className="flex items-stretch gap-3">
                <div className="relative min-h-11 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search matches…"
                    className="h-11 rounded-xl border border-zinc-200 bg-white py-0 pl-10 shadow-none [box-shadow:none] backdrop-blur-none dark:border-white/15 dark:bg-zinc-900"
                  />
                </div>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger className="h-11 w-[10.5rem] shrink-0 rounded-xl border border-zinc-200 bg-white py-0 text-xs shadow-none [box-shadow:none] backdrop-blur-none sm:w-56 dark:border-white/15 dark:bg-zinc-900">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isGroup && selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedMatches.map((m) => (
                    <Badge
                      key={m.match_user_id}
                      variant="secondary"
                      className="cursor-pointer gap-1 rounded-full pr-1.5"
                      onClick={() => toggleSelect(m.match_user_id)}
                    >
                      {m.name}
                      <span className="text-zinc-400">×</span>
                    </Badge>
                  ))}
                  <span className="self-center text-xs text-zinc-500">
                    {selectedIds.length}/{maxOtherMembers}
                  </span>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-zinc-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading matches…
                </div>
              ) : filteredSorted.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-14 text-center text-sm text-zinc-500 dark:border-white/10">
                  No matches or chats found yet.
                </div>
              ) : (
                <ul
                  className={cn(
                    'space-y-2.5 overflow-x-hidden overscroll-contain',
                    // ~4 rows (avatar + padding) + 3 gaps; scroll when more
                    filteredSorted.length > 4 &&
                      'max-h-[calc(4*4.75rem+3*0.625rem)] overflow-y-auto pr-1'
                  )}
                >
                  {filteredSorted.map((m) => {
                    const selected = selectedIds.includes(m.match_user_id)
                    const scorePct = Math.round(m.compatibility_score * 100)
                    return (
                      <li key={m.match_user_id}>
                        <button
                          type="button"
                          onClick={() => toggleSelect(m.match_user_id)}
                          className={cn(
                            'flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all',
                            selected
                              ? 'border-indigo-300 bg-indigo-50/90 ring-1 ring-indigo-200 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:ring-indigo-500/30'
                              : 'border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:bg-white/[0.04]'
                          )}
                        >
                          <Avatar className="h-12 w-12 shrink-0">
                            {m.avatar ? <AvatarImage src={m.avatar} alt="" /> : null}
                            <AvatarFallback className="bg-indigo-100 text-base font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                              {m.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                              {m.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {m.program_name} · {m.university_name}
                            </p>
                            {scorePct > 0 && (
                              <span className="mt-1.5 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-indigo-700 sm:hidden dark:bg-indigo-500/15 dark:text-indigo-300">
                                {scorePct}% match
                              </span>
                            )}
                          </div>
                          {scorePct > 0 ? (
                            <span className="hidden shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-indigo-700 sm:inline-flex dark:bg-indigo-500/15 dark:text-indigo-300">
                              {scorePct}% match
                            </span>
                          ) : (
                            <span className="hidden shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 sm:inline-flex dark:bg-white/10 dark:text-zinc-400">
                              Chat
                            </span>
                          )}
                          <span
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                              selected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-transparent'
                            )}
                            aria-hidden
                          >
                            {selected && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-5">
              {isGroup ? (
                <>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Invites go to {selectedIds.length} people. The chat stays locked until everyone
                    joins and accepts any needed matches. People who join early can start matching
                    right away. You can mute the group later from the chat menu.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        Group name
                      </label>
                      <Input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value.slice(0, 50))}
                        placeholder="e.g. Tilburg house hunt"
                        className="h-11 rounded-xl border border-zinc-200 bg-white py-0 shadow-none [box-shadow:none] backdrop-blur-none dark:border-white/15 dark:bg-zinc-900"
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        Description <span className="font-normal text-zinc-400">(bio)</span>
                      </label>
                      <Textarea
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value.slice(0, 500))}
                        placeholder="What is this group for?"
                        className="min-h-[88px] rounded-xl border border-zinc-200 bg-white shadow-none [box-shadow:none] dark:border-white/15 dark:bg-zinc-900"
                        maxLength={500}
                      />
                      <p className="mt-1.5 text-right text-[11px] tabular-nums text-zinc-400">
                        {groupDescription.length}/500
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        Group purpose
                      </label>
                      <Select
                        value={groupIntent}
                        onValueChange={(v: 'housing' | 'study' | 'social' | 'general') =>
                          setGroupIntent(v)
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl border border-zinc-200 bg-white py-0 shadow-none [box-shadow:none] backdrop-blur-none dark:border-white/15 dark:bg-zinc-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="housing">
                            <span className="flex items-center gap-2">
                              <Home className="h-4 w-4" /> Housing / roommates
                            </span>
                          </SelectItem>
                          <SelectItem value="study">
                            <span className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" /> Study
                            </span>
                          </SelectItem>
                          <SelectItem value="social">
                            <span className="flex items-center gap-2">
                              <Heart className="h-4 w-4" /> Social
                            </span>
                          </SelectItem>
                          <SelectItem value="general">
                            <span className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" /> General
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        Invitation message{' '}
                        <span className="font-normal text-zinc-400">(optional)</span>
                      </label>
                      <Textarea
                        value={contextMessage}
                        onChange={(e) => setContextMessage(e.target.value.slice(0, 300))}
                        placeholder="Add a short note for invitees…"
                        className="min-h-[72px] rounded-xl border border-zinc-200 bg-white shadow-none [box-shadow:none] dark:border-white/15 dark:bg-zinc-900"
                        maxLength={300}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      Members · {selectedMatches.length + 1}
                    </p>
                    <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200/80 dark:divide-white/5 dark:border-white/10">
                      {selectedMatches.map((m) => (
                        <li
                          key={m.match_user_id}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm"
                        >
                          <Avatar className="h-9 w-9">
                            {m.avatar ? <AvatarImage src={m.avatar} alt="" /> : null}
                            <AvatarFallback className="text-xs">
                              {m.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-100">
                            {m.name}
                          </span>
                          {m.compatibility_score > 0 && (
                            <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                              {Math.round(m.compatibility_score * 100)}%
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {selectedMatches[0] && (
                    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 px-4 py-4 dark:border-white/10">
                      <Avatar className="h-14 w-14">
                        {selectedMatches[0].avatar ? (
                          <AvatarImage src={selectedMatches[0].avatar} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-indigo-100 text-lg text-indigo-700">
                          {selectedMatches[0].name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          {selectedMatches[0].name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {selectedMatches[0].program_name} · {selectedMatches[0].university_name}
                        </p>
                        {selectedMatches[0].compatibility_score > 0 && (
                          <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                            {Math.round(selectedMatches[0].compatibility_score * 100)}% match
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Opens a private chat. You can mute or leave anytime from the conversation menu.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-zinc-100 px-6 py-4 dark:border-white/10 sm:justify-between">
          {step === 'pick' ? (
            <>
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep('confirm')}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                {isGroup ? (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Continue
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('pick')}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || !canContinue}
                onClick={() => void handleConfirm()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isGroup ? 'Creating…' : 'Opening…'}
                  </>
                ) : isGroup ? (
                  'Create group'
                ) : (
                  'Start chat'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
