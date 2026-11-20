'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Loader2,
  Search,
  Users,
  UserRound,
  Wallet,
  MapPin,
  GraduationCap,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export type ApplyPerson = {
  user_id: string
  name: string
  program: string | null
  university: string | null
  degree_level: string | null
  budget_min: number | null
  budget_max: number | null
  preferred_cities: string[]
  housing_status: string[] | null
  avatar_url: string
  compatibility_score: number
  has_dm: boolean
  already_applied?: boolean
}

export type ApplyGroupMember = {
  user_id: string
  name: string
  avatar_url: string | null
  program: string | null
}

export type ApplyGroup = {
  chat_id: string
  name: string
  group_intent: string | null
  member_count: number
  cohesion_score: number | null
  members: ApplyGroupMember[]
  fits: boolean
  already_applied?: boolean
}

type CandidatesResponse = {
  seeking_people: number
  allow_groups: boolean
  min_party_size: number
  max_party_size: number
  min_additional: number
  max_additional: number
  people: ApplyPerson[]
  groups: ApplyGroup[]
  error?: string
}

export type GroupApplySelection =
  | { mode: 'people'; memberIds: string[] }
  | { mode: 'group'; chatId: string; memberIds: string[] }

function scorePct(score: number) {
  if (!Number.isFinite(score) || score <= 0) return null
  // Scores may be 0–1 or already 0–100
  const pct = score <= 1 ? Math.round(score * 100) : Math.round(score)
  return Math.min(100, Math.max(0, pct))
}

function formatBudget(min: number | null, max: number | null) {
  if (min == null && max == null) return null
  if (min != null && max != null) return `€${min}–€${max}`
  if (max != null) return `Up to €${max}`
  return `From €${min}`
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
}

export function ApplyAsGroupDialog({
  open,
  onOpenChange,
  listingId,
  seekingPeople: seekingPeopleProp,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
  seekingPeople?: number | null
  onSubmit: (selection: GroupApplySelection) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'people' | 'groups'>('people')
  const [selectedPeople, setSelectedPeople] = useState<string[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [data, setData] = useState<CandidatesResponse | null>(null)

  const seeking = data?.seeking_people ?? seekingPeopleProp ?? 2
  const allowGroups = data?.allow_groups ?? seeking >= 3
  const maxAdditional = data?.max_additional ?? Math.max(0, seeking - 1)
  const minAdditional = data?.min_additional ?? Math.min(1, maxAdditional)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setQuery('')
    setSelectedPeople([])
    setSelectedGroupId(null)
    setTab('people')

    fetch(`/api/housing/apply-candidates?listing_id=${encodeURIComponent(listingId)}`)
      .then(async (r) => {
        const j = (await r.json()) as CandidatesResponse
        if (!r.ok) throw new Error(j.error || 'Failed to load candidates')
        if (!cancelled) {
          setData(j)
          setSelectedPeople([])
          setSelectedGroupId(null)
          setTab(j.allow_groups && j.people.length === 0 && j.groups.length > 0 ? 'groups' : 'people')
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, listingId])

  const filteredPeople = useMemo(() => {
    const people = data?.people || []
    const q = query.trim().toLowerCase()
    if (!q) return people
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.program || '').toLowerCase().includes(q) ||
        (p.university || '').toLowerCase().includes(q) ||
        p.preferred_cities.some((c) => c.toLowerCase().includes(q))
    )
  }, [data?.people, query])

  const filteredGroups = useMemo(() => {
    const groups = data?.groups || []
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.members.some((m) => m.name.toLowerCase().includes(q))
    )
  }, [data?.groups, query])

  const selectedGroup = useMemo(
    () => (data?.groups || []).find((g) => g.chat_id === selectedGroupId) || null,
    [data?.groups, selectedGroupId]
  )

  const canSubmit = (() => {
    if (submitting || loading) return false
    if (tab === 'groups') {
      return Boolean(selectedGroupId && selectedGroup && !selectedGroup.already_applied)
    }
    const n = selectedPeople.length
    return n >= minAdditional && n <= maxAdditional
  })()

  const togglePerson = (id: string) => {
    const person = (data?.people || []).find((p) => p.user_id === id)
    if (person?.already_applied) return
    setSelectedGroupId(null)
    setSelectedPeople((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= maxAdditional) return prev
      return [...prev, id]
    })
  }

  const selectGroup = (chatId: string) => {
    const group = (data?.groups || []).find((g) => g.chat_id === chatId)
    if (group?.already_applied) return
    setSelectedPeople([])
    setSelectedGroupId((prev) => (prev === chatId ? null : chatId))
  }

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      if (tab === 'groups' && selectedGroup) {
        await onSubmit({
          mode: 'group',
          chatId: selectedGroup.chat_id,
          memberIds: selectedGroup.members.map((m) => m.user_id),
        })
      } else {
        await onSubmit({ mode: 'people', memberIds: selectedPeople })
      }
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to apply')
    } finally {
      setSubmitting(false)
    }
  }

  const capacityHint =
    seeking <= 2
      ? `This listing is looking for ${seeking} ${seeking === 1 ? 'person' : 'people'}. Pick ${minAdditional} roommate to apply as a pair.`
      : `Looking for up to ${seeking} people. Apply with ${minAdditional}–${maxAdditional} other ${maxAdditional === 1 ? 'person' : 'people'} (party of ${Math.min(2, seeking)}–${seeking} including you)${allowGroups ? ', or choose an existing group that fits.' : '.'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <DialogTitle>Apply as a group</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-ink-500">
            {capacityHint}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <div className="inline-flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => {
                setTab('people')
                setSelectedGroupId(null)
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                tab === 'people'
                  ? 'bg-white text-ink-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
              )}
            >
              <UserRound className="h-3.5 w-3.5" />
              People
            </button>
            {allowGroups && (
              <button
                type="button"
                onClick={() => {
                  setTab('groups')
                  setSelectedPeople([])
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  tab === 'groups'
                    ? 'bg-white text-ink-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                    : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Groups
              </button>
            )}
          </div>
          <p className="text-xs font-medium text-ink-500">
            Party{' '}
            <span className="text-ink-900 dark:text-white">
              {tab === 'groups' && selectedGroup
                ? selectedGroup.member_count
                : 1 + selectedPeople.length}
            </span>
            /{seeking}
          </p>
        </div>

        <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'groups' ? 'Search groups…' : 'Search people…'}
              className="h-10 w-full rounded-full border border-zinc-200 bg-transparent pl-9 pr-4 text-sm outline-none ring-indigo-500/30 focus:ring-2 dark:border-zinc-700"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading people you can apply with…
            </div>
          ) : tab === 'people' ? (
            filteredPeople.length === 0 ? (
              <EmptyState
                title="No people to invite yet"
                body="Match and chat with roommates first, then you can apply together for this place."
              />
            ) : (
              <ul className="space-y-2">
                {filteredPeople.map((person) => {
                  const selected = selectedPeople.includes(person.user_id)
                  const alreadyApplied = Boolean(person.already_applied)
                  const disabled =
                    alreadyApplied || (!selected && selectedPeople.length >= maxAdditional)
                  const pct = scorePct(person.compatibility_score)
                  const budget = formatBudget(person.budget_min, person.budget_max)
                  return (
                    <li key={person.user_id}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => togglePerson(person.user_id)}
                        aria-disabled={disabled}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition',
                          selected
                            ? 'border-indigo-500 bg-indigo-50/80 dark:border-indigo-400 dark:bg-indigo-500/10'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600',
                          alreadyApplied &&
                            'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60 hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-800',
                          !alreadyApplied && disabled && 'opacity-45'
                        )}
                      >
                        <Avatar className="mt-0.5 h-11 w-11 shrink-0">
                          <AvatarImage src={person.avatar_url} alt="" />
                          <AvatarFallback>{initials(person.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink-900 dark:text-white">
                                {person.name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-ink-500">
                                {[person.program, person.university].filter(Boolean).join(' · ') ||
                                  'Student'}
                              </p>
                            </div>
                            {alreadyApplied ? (
                              <span className="mt-0.5 shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500 dark:bg-zinc-800 dark:text-ink-400">
                                Applied
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                  selected
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-zinc-300 dark:border-zinc-600'
                                )}
                              >
                                {selected && <Check className="h-3 w-3" />}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-500">
                            {alreadyApplied ? (
                              <span>Already applied together for this listing</span>
                            ) : (
                              <>
                                {pct != null && (
                                  <span className="font-medium text-indigo-600 dark:text-indigo-300">
                                    {pct}% match
                                  </span>
                                )}
                                {person.degree_level && (
                                  <span className="inline-flex items-center gap-1">
                                    <GraduationCap className="h-3 w-3" />
                                    {person.degree_level}
                                  </span>
                                )}
                                {budget && (
                                  <span className="inline-flex items-center gap-1">
                                    <Wallet className="h-3 w-3" />
                                    {budget}
                                  </span>
                                )}
                                {person.preferred_cities[0] && (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {person.preferred_cities.slice(0, 2).join(', ')}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )
          ) : filteredGroups.length === 0 ? (
            <EmptyState
              title="No fitting groups"
              body={`Only groups of ${Math.min(2, seeking)}–${seeking} people (including you) can apply here. Create a housing group in Chat, or pick people instead.`}
            />
          ) : (
            <ul className="space-y-2">
              {filteredGroups.map((group) => {
                const selected = selectedGroupId === group.chat_id
                const alreadyApplied = Boolean(group.already_applied)
                const cohesion = scorePct(group.cohesion_score ?? 0)
                return (
                  <li key={group.chat_id}>
                    <button
                      type="button"
                      disabled={alreadyApplied}
                      onClick={() => selectGroup(group.chat_id)}
                      className={cn(
                        'w-full rounded-2xl border px-3 py-3 text-left transition',
                        selected
                          ? 'border-indigo-500 bg-indigo-50/80 dark:border-indigo-400 dark:bg-indigo-500/10'
                          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600',
                        alreadyApplied &&
                          'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60 hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-800'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink-900 dark:text-white">
                            {group.name}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-500">
                            {alreadyApplied
                              ? 'Already applied together for this listing'
                              : `${group.member_count} members${group.group_intent ? ` · ${group.group_intent}` : ''}${cohesion != null ? ` · ${cohesion}% cohesion` : ''}`}
                          </p>
                        </div>
                        {alreadyApplied ? (
                          <span className="mt-0.5 shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500 dark:bg-zinc-800 dark:text-ink-400">
                            Applied
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                              selected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-zinc-300 dark:border-zinc-600'
                            )}
                          >
                            {selected && <Check className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex -space-x-2">
                        {group.members.slice(0, 5).map((m) => (
                          <Avatar
                            key={m.user_id}
                            className="h-8 w-8 border-2 border-white dark:border-zinc-900"
                            title={m.name}
                          >
                            {m.avatar_url && <AvatarImage src={m.avatar_url} alt="" />}
                            <AvatarFallback className="text-[10px]">
                              {initials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {group.member_count > 5 && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-[10px] font-semibold dark:border-zinc-900 dark:bg-zinc-800">
                            +{group.member_count - 5}
                          </span>
                        )}
                      </div>
                      <ul className="mt-2 space-y-0.5">
                        {group.members.map((m) => (
                          <li
                            key={m.user_id}
                            className="truncate text-[11px] text-ink-500"
                          >
                            {m.name}
                            {m.program ? ` · ${m.program}` : ''}
                          </li>
                        ))}
                      </ul>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error && (
          <p className="px-5 pb-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <DialogFooter className="gap-2 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full bg-indigo-600 hover:bg-indigo-700"
            disabled={!canSubmit}
            onClick={() => void submit()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying…
              </>
            ) : tab === 'groups' && selectedGroup ? (
              `Apply with ${selectedGroup.name}`
            ) : (
              `Apply as ${1 + selectedPeople.length}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-10 text-center dark:border-zinc-700">
      <Users className="mx-auto h-8 w-8 text-ink-300" />
      <p className="mt-3 text-sm font-semibold text-ink-800 dark:text-ink-100">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">{body}</p>
    </div>
  )
}
