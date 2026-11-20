'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { queryClient, queryKeys } from '@/app/providers'

type PendingInvitation = {
  id: string
  chat_id: string
  context_message?: string | null
  invited_at: string
  chats?: {
    id: string
    name?: string | null
    description?: string | null
    group_intent?: string | null
  } | null
  inviter?: {
    first_name?: string | null
    last_name?: string | null
  } | null
}

const INTENT_LABELS: Record<string, string> = {
  housing: 'Housing',
  study: 'Study',
  social: 'Social',
  general: 'General',
}

function inviterDisplayName(invite: PendingInvitation) {
  return [invite.inviter?.first_name, invite.inviter?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Someone'
}

function groupDisplayName(invite: PendingInvitation) {
  return invite.chats?.name?.trim() || 'Untitled group'
}

function intentLabel(invite: PendingInvitation) {
  const intent = invite.chats?.group_intent || 'general'
  return INTENT_LABELS[intent] || 'General'
}

function usePendingGroupInvites() {
  const [invites, setInvites] = useState<PendingInvitation[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/invitations')
      if (!response.ok) return
      const data = await response.json()
      setInvites(data.invitations || [])
    } catch (err) {
      console.error('Failed to load group invites', err)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const refresh = () => void load()
    window.addEventListener('focus', refresh)
    window.addEventListener('group-invites-changed', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('group-invites-changed', refresh)
    }
  }, [load])

  return { invites, setInvites, loaded, reload: load }
}

async function respondToInvite(
  invite: PendingInvitation,
  action: 'accept' | 'reject',
  userId: string,
  onOpenGroup: (chatId: string) => void,
  removeLocal: (id: string) => void
) {
  const response = await fetchWithCSRF('/api/chat/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: invite.chat_id, action }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to respond')
  }
  removeLocal(invite.id)
  queryClient.invalidateQueries({ queryKey: queryKeys.chats(userId) })
  window.dispatchEvent(new Event('group-invites-changed'))
  if (action === 'accept') {
    showSuccessToast('Joined group', 'Opening the group chat…')
    onOpenGroup(invite.chat_id)
  } else {
    showSuccessToast('Invite declined', 'This group invite was declined.')
  }
}

/** Compact row in the main sidebar — opens the dedicated invites panel. */
export function GroupInvitesEntry({
  onOpen,
  className,
}: {
  onOpen: () => void
  className?: string
}) {
  const { invites, loaded } = usePendingGroupInvites()

  if (!loaded || invites.length === 0) return null

  return (
    <div className={cn('px-2 pt-2', className)}>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Group invites
            </span>
            <Badge className="h-5 rounded-full bg-zinc-900 px-2 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {invites.length}
            </Badge>
          </div>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {invites.length === 1
              ? '1 pending invite'
              : `${invites.length} pending invites`}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
      </button>
    </div>
  )
}

/** Full scrollable invites list that replaces the main chat list. */
export function GroupInvitesPanel({
  userId,
  onOpenGroup,
  className,
}: {
  userId: string
  onOpenGroup: (chatId: string) => void
  className?: string
}) {
  const { invites, setInvites, loaded } = usePendingGroupInvites()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const selected = invites.find((i) => i.id === selectedId) || null

  useEffect(() => {
    if (selectedId && !invites.some((i) => i.id === selectedId)) {
      setSelectedId(null)
    }
  }, [invites, selectedId])

  const respond = async (invite: PendingInvitation, action: 'accept' | 'reject') => {
    setProcessingId(invite.id)
    try {
      await respondToInvite(
        invite,
        action,
        userId,
        onOpenGroup,
        (id) => setInvites((prev) => prev.filter((i) => i.id !== id))
      )
      setSelectedId(null)
    } catch (e: any) {
      showErrorToast('Could not update invite', e.message || 'Try again')
    } finally {
      setProcessingId(null)
    }
  }

  if (!loaded) {
    return (
      <div className={cn('flex items-center justify-center px-4 py-12', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (invites.length === 0) {
    return (
      <div className={cn('px-4 py-10 text-center', className)}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No pending group invites
        </p>
      </div>
    )
  }

  if (selected) {
    const busy = processingId === selected.id
    const description = selected.chats?.description?.trim()

    return (
      <div className={cn('flex h-full min-h-0 flex-col px-3 pb-4 pt-1', className)}>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="mb-4 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          All invites
        </button>

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-8 px-1">
          <div className="flex flex-1 flex-col justify-evenly gap-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {groupDisplayName(selected)}
              </h3>
              <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                From {inviterDisplayName(selected)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Purpose
              </p>
              <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
                {intentLabel(selected)}
              </p>
            </div>

            {description ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Description
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {description}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-2 pb-1">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void respond(selected, 'reject')}
              className="h-10 flex-1 rounded-xl border-zinc-200 text-sm dark:border-white/15"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Decline'}
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void respond(selected, 'accept')}
              className="h-10 flex-1 rounded-xl bg-zinc-900 text-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2 px-2 pb-4 pt-1', className)}>
      {invites.map((invite) => (
        <button
          key={invite.id}
          type="button"
          onClick={() => setSelectedId(invite.id)}
          className="flex w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-4 text-left transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-zinc-800/50"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {groupDisplayName(invite)}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
              From {inviterDisplayName(invite)} · {intentLabel(invite)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
        </button>
      ))}
    </div>
  )
}
