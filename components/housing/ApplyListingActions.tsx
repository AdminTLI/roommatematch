'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ShieldAlert, User, Users } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ViewingProposeDialog } from '@/components/housing/ViewingProposeDialog'
import {
  ApplyAsGroupDialog,
  type GroupApplySelection,
} from '@/components/housing/ApplyAsGroupDialog'

export function ApplyListingActions({
  listingId,
  actionsEnabled = true,
  seekingPeople = null,
}: {
  listingId: string
  actionsEnabled?: boolean
  seekingPeople?: number | null
}) {
  const [message, setMessage] = useState<string | null>(null)
  const [messageHref, setMessageHref] = useState('/housing/applications')
  const [loading, setLoading] = useState(false)
  const [viewingOpen, setViewingOpen] = useState(false)
  const [groupOpen, setGroupOpen] = useState(false)

  const blocked = !actionsEnabled
  const canApplyAsGroup = (seekingPeople ?? 1) >= 2

  const applyIndividual = async () => {
    if (blocked) {
      setMessage("Host hasn't verified yet. You can browse but can't apply.")
      return
    }
    setLoading(true)
    setMessage(null)
    setMessageHref('/housing/applications')
    try {
      const res = await fetchWithCSRF('/api/housing/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          application_type: 'individual',
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || j.message || 'Failed to apply')
      setMessage(
        'Application sent. The host sees compatibility only until they make an offer.'
      )
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const applyAsGroup = async (selection: GroupApplySelection) => {
    if (blocked) {
      throw new Error("Host hasn't verified yet. You can browse but can't apply.")
    }
    setLoading(true)
    setMessage(null)
    setMessageHref('/housing/applications')
    try {
      if (selection.mode === 'group') {
        await fetchWithCSRF(`/api/chat/groups/${selection.chatId}/pins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: listingId }),
        })

        // Cast the viewer's approve vote so solo-approved groups can proceed when unanimous
        await fetchWithCSRF(`/api/chat/groups/${selection.chatId}/votes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: listingId, vote: 'approve' }),
        })

        const res = await fetchWithCSRF('/api/housing/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            application_type: 'group',
            chat_id: selection.chatId,
            group_members: selection.memberIds,
          }),
        })
        const j = await res.json()
        if (!res.ok) {
          if (
            typeof j.error === 'string' &&
            j.error.toLowerCase().includes('unanimously')
          ) {
            setMessage(
              'Listing pinned for your group. Everyone must approve in chat before the application is sent.'
            )
            return
          }
          throw new Error(j.error || j.message || 'Failed to apply as group')
        }
        setMessage(
          'Group application sent. The host sees compatibility only until they make an offer.'
        )
        return
      }

      const res = await fetchWithCSRF('/api/housing/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          application_type: 'group',
          group_members: selection.memberIds,
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || j.message || 'Failed to apply as group')
      setMessage(
        `Application sent for your party of ${1 + selection.memberIds.length}. Co-applicants are notified.`
      )
    } finally {
      setLoading(false)
    }
  }

  const submitViewing = async (slots: string[], notes?: string) => {
    if (blocked) {
      throw new Error("Host hasn't verified yet. You can't book a viewing yet.")
    }
    setLoading(true)
    setMessage(null)
    setMessageHref('/housing/viewings')
    try {
      const res = await fetchWithCSRF('/api/housing/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          proposed_slots: slots,
          scheduled_for: slots[0],
          tour_type: 'in_person',
          proposed_by: 'student',
          notes,
        }),
      })
      const j = await res.json()
      if (!res.ok) {
        throw new Error(
          typeof j.error === 'string'
            ? j.error
            : j.message || 'Failed to request viewing'
        )
      }
      setMessage(
        'Viewing times sent. You’ll be notified when the host accepts or proposes alternatives.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {blocked && (
        <div className="flex items-start gap-2 text-sm text-rose-700 dark:text-rose-300">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Host hasn&apos;t verified yet. Browse only for now.</span>
        </div>
      )}

      <TooltipProvider>
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={loading || blocked}
                      className={cn(
                        'inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50'
                      )}
                    >
                      Apply
                      <ChevronDown className="h-4 w-4 opacity-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[12rem]">
                    <DropdownMenuItem
                      disabled={loading || blocked}
                      onSelect={() => void applyIndividual()}
                      className="cursor-pointer gap-2"
                    >
                      <User className="h-4 w-4" />
                      Apply individually
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={loading || blocked || !canApplyAsGroup}
                      onSelect={() => {
                        if (!canApplyAsGroup) return
                        setGroupOpen(true)
                      }}
                      className="cursor-pointer gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Apply as a group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </TooltipTrigger>
            {blocked && (
              <TooltipContent>
                Host hasn&apos;t verified yet. You can&apos;t apply yet.
              </TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block">
                <button
                  type="button"
                  disabled={loading || blocked}
                  onClick={() => setViewingOpen(true)}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 text-sm font-medium text-ink-800 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-ink-200 dark:hover:bg-zinc-800"
                >
                  Request a viewing
                </button>
              </span>
            </TooltipTrigger>
            {blocked && (
              <TooltipContent>
                Host hasn&apos;t verified yet. You can&apos;t book a viewing yet.
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </TooltipProvider>

      {message && (
        <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          {message}{' '}
          <Link href={messageHref} className="font-medium text-indigo-600 hover:underline">
            {messageHref.includes('viewings') ? 'View your viewings' : 'View applications'}
          </Link>
        </p>
      )}

      <ViewingProposeDialog
        open={viewingOpen}
        onOpenChange={setViewingOpen}
        title="Propose viewing times"
        submitLabel="Send request"
        onSubmit={submitViewing}
      />

      <ApplyAsGroupDialog
        open={groupOpen}
        onOpenChange={setGroupOpen}
        listingId={listingId}
        seekingPeople={seekingPeople}
        onSubmit={applyAsGroup}
      />
    </div>
  )
}
