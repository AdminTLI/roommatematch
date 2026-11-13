import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/utils/logger', () => ({
  safeLogger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}))

import { purgeExpiredWishBoard } from '@/lib/privacy/wish-board-retention'

describe('purgeExpiredWishBoard', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('deletes lab_wishes older than the wish_board retention policy (365 days)', async () => {
    const lt = vi.fn().mockResolvedValue({ count: 3, error: null })
    const del = vi.fn().mockReturnValue({ lt })
    const supabase = { from: vi.fn().mockReturnValue({ delete: del }) } as never

    const fixedNow = new Date('2026-11-13T12:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)

    const result = await purgeExpiredWishBoard(supabase)

    expect(supabase.from).toHaveBeenCalledWith('lab_wishes')
    expect(del).toHaveBeenCalledWith({ count: 'exact' })
    const expectedCutoff = new Date(fixedNow)
    expectedCutoff.setDate(expectedCutoff.getDate() - 365)
    expect(lt).toHaveBeenCalledWith('created_at', expectedCutoff.toISOString())
    expect(result).toEqual({ deleted: 3, retentionDays: 365 })
  })

  it('rethrows supabase delete errors', async () => {
    const lt = vi.fn().mockResolvedValue({ count: null, error: new Error('boom') })
    const del = vi.fn().mockReturnValue({ lt })
    const supabase = { from: vi.fn().mockReturnValue({ delete: del }) } as never

    await expect(purgeExpiredWishBoard(supabase)).rejects.toThrow('boom')
  })
})
