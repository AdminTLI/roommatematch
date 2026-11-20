'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import {
  formatViewingSlot,
  normalizeProposedSlots,
  toViewingSlotIso,
  viewingApiErrorMessage,
  viewingStatusLabel,
} from '@/lib/housing/viewing-slots'
import { ViewingProposeDialog } from '@/components/housing/ViewingProposeDialog'
import { cn } from '@/lib/utils'

export type ViewingRow = {
  id: string
  status: string
  scheduled_for: string
  proposed_slots?: string[] | null
  proposed_by?: string | null
  tour_type?: string
  anonymous_label?: string | null
  notes?: string | null
  host_notes?: string | null
  housing_listings?: { title?: string; city?: string; address?: string } | null
}

export function ViewingRequestCard({
  viewing,
  role,
  onChanged,
}: {
  viewing: ViewingRow
  role: 'student' | 'host'
  onChanged: () => void | Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [proposeOpen, setProposeOpen] = useState(false)

  const slots = normalizeProposedSlots(
    Array.isArray(viewing.proposed_slots) && viewing.proposed_slots.length
      ? viewing.proposed_slots
      : [viewing.scheduled_for]
  )

  const awaiting = viewing.status === 'scheduled'
  const myTurn = awaiting && viewing.proposed_by !== role
  const theirTurn = awaiting && viewing.proposed_by === role
  const title = viewing.housing_listings?.title || 'Listing'
  const subtitle =
    role === 'host'
      ? viewing.anonymous_label || 'Applicant'
      : viewing.housing_listings?.city || ''

  const patch = async (body: Record<string, unknown>, opts?: { rethrow?: boolean }) => {
    setBusy(true)
    setError(null)
    try {
      const payload = { ...body }
      if (typeof payload.scheduled_for === 'string') {
        payload.scheduled_for = toViewingSlotIso(payload.scheduled_for) || payload.scheduled_for
      }
      if (Array.isArray(payload.proposed_slots)) {
        payload.proposed_slots = normalizeProposedSlots(payload.proposed_slots as unknown[])
      }

      const res = await fetchWithCSRF(`/api/housing/viewings/${viewing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(viewingApiErrorMessage(j, 'Update failed'))
      await onChanged()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Update failed'
      setError(message)
      if (opts?.rethrow) throw e instanceof Error ? e : new Error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/60 bg-white/55 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink-900 dark:text-white">{title}</h2>
          <p className="text-sm text-ink-500">
            {subtitle}
            {subtitle ? ' · ' : ''}
            {viewing.tour_type?.replace('_', ' ') || 'in person'}
          </p>
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              myTurn && 'text-amber-700 dark:text-amber-300',
              theirTurn && 'text-ink-400',
              viewing.status === 'confirmed' && 'text-emerald-700 dark:text-emerald-300'
            )}
          >
            {viewingStatusLabel({
              status: viewing.status,
              proposedBy: viewing.proposed_by,
              role,
            })}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {slots.map((slot) => (
          <li
            key={slot}
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/50"
          >
            <span className="font-medium text-ink-800 dark:text-ink-100">
              {formatViewingSlot(slot)}
            </span>
            {myTurn && (
              <Button
                size="sm"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                disabled={busy}
                onClick={() => patch({ action: 'confirm', scheduled_for: slot })}
              >
                Accept this time
              </Button>
            )}
          </li>
        ))}
      </ul>

      {(viewing.notes || viewing.host_notes) && (
        <p className="mt-3 text-sm text-ink-500">
          Note: {role === 'host' ? viewing.notes || viewing.host_notes : viewing.host_notes || viewing.notes}
        </p>
      )}

      {(awaiting || viewing.status === 'confirmed') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {awaiting && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={busy}
              onClick={() => setProposeOpen(true)}
            >
              Propose other times
            </Button>
          )}
          {viewing.status !== 'cancelled' && viewing.status !== 'completed' && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-rose-600"
              disabled={busy}
              onClick={() => patch({ action: 'cancel' })}
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

      <ViewingProposeDialog
        open={proposeOpen}
        onOpenChange={setProposeOpen}
        title="Propose other times"
        submitLabel="Send counter-proposal"
        onSubmit={async (nextSlots, notes) => {
          await patch({ action: 'propose', proposed_slots: nextSlots, notes }, { rethrow: true })
        }}
      />
    </div>
  )
}
