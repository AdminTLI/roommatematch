import { z } from 'zod'

/**
 * Parse viewing slot strings from the browser, API, or Postgres timestamptz
 * (e.g. "2026-11-13 15:20:00+00") into a Date.
 */
export function parseViewingSlot(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value !== 'string' || !value.trim()) return null

  const trimmed = value.trim()
  const candidates = [
    trimmed,
    // Postgres often returns "YYYY-MM-DD HH:MM:SS+00" — make it ISO-like
    trimmed.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00'),
    trimmed.replace(' ', 'T'),
  ]

  for (const candidate of candidates) {
    const d = new Date(candidate)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

/** Coerce any accepted slot input to a canonical ISO string. */
export function toViewingSlotIso(value: unknown): string | null {
  const d = parseViewingSlot(value)
  return d ? d.toISOString() : null
}

/** Zod schema that accepts ISO or Postgres-ish datetimes and outputs ISO. */
export const viewingSlotSchema = z.string().transform((val, ctx) => {
  const iso = toViewingSlotIso(val)
  if (!iso) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid datetime' })
    return z.NEVER
  }
  return iso
})

/** Normalize and validate proposed viewing datetimes. */
export function normalizeProposedSlots(raw: unknown[]): string[] {
  const unique = new Map<number, string>()
  for (const value of raw) {
    const iso = toViewingSlotIso(value)
    if (!iso) continue
    unique.set(new Date(iso).getTime(), iso)
  }
  return [...unique.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, iso]) => iso)
}

/** Shape tour_bookings rows so clients always get ISO slot strings. */
export function serializeViewingRow<T extends Record<string, unknown>>(row: T): T {
  const scheduled = toViewingSlotIso(row.scheduled_for) || row.scheduled_for
  const rawSlots = Array.isArray(row.proposed_slots) ? row.proposed_slots : []
  const proposed_slots = normalizeProposedSlots(
    rawSlots.length ? rawSlots : scheduled ? [scheduled] : []
  )
  return {
    ...row,
    scheduled_for: scheduled,
    proposed_slots,
  }
}

export function formatViewingSlot(iso: string): string {
  const d = parseViewingSlot(iso) || new Date(iso)
  return d.toLocaleString('en-GB', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function viewingStatusLabel(opts: {
  status: string
  proposedBy?: string | null
  role: 'student' | 'host'
}): string {
  if (opts.status === 'confirmed') return 'Confirmed'
  if (opts.status === 'cancelled') return 'Cancelled'
  if (opts.status === 'completed') return 'Completed'
  if (opts.status === 'no_show') return 'No-show'
  if (opts.status !== 'scheduled') return opts.status

  const byHost = opts.proposedBy === 'host'
  if (opts.role === 'host') {
    return byHost ? 'Awaiting applicant reply' : 'Needs your response'
  }
  return byHost ? 'Host proposed new times' : 'Awaiting host reply'
}

/** Prefer a readable API error string over Zod flatten objects. */
export function viewingApiErrorMessage(payload: unknown, fallback = 'Update failed'): string {
  if (!payload || typeof payload !== 'object') return fallback
  const err = (payload as { error?: unknown; message?: unknown }).error
  if (typeof err === 'string' && err.trim()) return err
  if (typeof (payload as { message?: unknown }).message === 'string') {
    const msg = (payload as { message: string }).message.trim()
    if (msg) return msg
  }
  if (err && typeof err === 'object') {
    const formErrors = (err as { formErrors?: unknown }).formErrors
    if (Array.isArray(formErrors) && typeof formErrors[0] === 'string') return formErrors[0]
    const fieldErrors = (err as { fieldErrors?: Record<string, string[] | undefined> }).fieldErrors
    if (fieldErrors) {
      for (const messages of Object.values(fieldErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') return messages[0]
      }
    }
  }
  return fallback
}
