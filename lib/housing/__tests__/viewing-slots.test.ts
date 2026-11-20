import { describe, expect, it } from 'vitest'
import {
  normalizeProposedSlots,
  parseViewingSlot,
  toViewingSlotIso,
  viewingSlotSchema,
} from '@/lib/housing/viewing-slots'

describe('viewing slot parsing', () => {
  it('parses Postgres timestamptz text', () => {
    const d = parseViewingSlot('2026-11-13 15:20:00+00')
    expect(d).not.toBeNull()
    expect(d!.toISOString()).toBe('2026-11-13T15:20:00.000Z')
  })

  it('coerces through zod schema used by APIs', () => {
    const parsed = viewingSlotSchema.safeParse('2026-11-13 15:20:00+00')
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data).toBe('2026-11-13T15:20:00.000Z')
  })

  it('matches accepted slot against stored postgres formats', () => {
    const slots = normalizeProposedSlots(['2026-11-13 15:20:00+00'])
    const chosen = toViewingSlotIso('2026-11-13 15:20:00+00')
    expect(slots).toEqual(['2026-11-13T15:20:00.000Z'])
    expect(slots.includes(chosen!)).toBe(true)
  })
})
