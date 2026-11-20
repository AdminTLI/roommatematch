'use client'

import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

const MAX_SLOTS = 3

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function defaultSlot(offsetDays: number, hour = 15): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, 0, 0, 0)
  return toLocalInputValue(d)
}

export function ViewingProposeDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Send times',
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  submitLabel?: string
  onSubmit: (slotsIso: string[], notes?: string) => Promise<void>
}) {
  const minLocal = useMemo(() => toLocalInputValue(new Date(Date.now() + 30 * 60 * 1000)), [open])
  const [slots, setSlots] = useState<string[]>([defaultSlot(3)])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setSlots([defaultSlot(3)])
    setNotes('')
    setError(null)
    setLoading(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    else {
      setSlots([defaultSlot(3)])
      setNotes('')
      setError(null)
    }
    onOpenChange(next)
  }

  const submit = async () => {
    setError(null)
    const iso = slots
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => new Date(s))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => d.toISOString())

    if (!iso.length) {
      setError('Add at least one day and time.')
      return
    }
    if (iso.some((s) => new Date(s).getTime() < Date.now() + 25 * 60 * 1000)) {
      setError('Each time must be at least about 30 minutes from now.')
      return
    }

    setLoading(true)
    try {
      await onSubmit(iso, notes.trim() || undefined)
      handleOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send times')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description ||
              'Suggest up to 3 times that work. The other party picks one or proposes alternatives — both must agree on the same slot.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {slots.map((value, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`viewing-slot-${index}`}>Option {index + 1}</Label>
                <input
                  id={`viewing-slot-${index}`}
                  type="datetime-local"
                  min={minLocal}
                  value={value}
                  onChange={(e) => {
                    const next = [...slots]
                    next[index] = e.target.value
                    setSlots(next)
                  }}
                  className="h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-700"
                />
              </div>
              {slots.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="mb-0.5 h-10 w-10 shrink-0 px-0"
                  onClick={() => setSlots(slots.filter((_, i) => i !== index))}
                  aria-label="Remove time"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {slots.length < MAX_SLOTS && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setSlots([...slots, defaultSlot(3 + slots.length, 11 + slots.length)])}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add another time
            </Button>
          )}

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="viewing-notes">Note (optional)</Label>
            <Textarea
              id="viewing-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the other party should know"
              className="min-h-[72px] rounded-xl"
              maxLength={2000}
            />
          </div>

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
            disabled={loading}
            onClick={submit}
          >
            {loading ? 'Sending…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
