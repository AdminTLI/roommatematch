import { describe, expect, it } from 'vitest'
import { collectVerificationRetentionHolds } from '../verification-retention'

describe('collectVerificationRetentionHolds', () => {
  const now = new Date('2026-09-02T12:00:00.000Z')

  it('blocks users with a future retention_expires_at', () => {
    const holds = collectVerificationRetentionHolds(
      [
        {
          user_id: 'user-1',
          retention_expires_at: '2026-09-20T12:00:00.000Z',
          updated_at: '2026-08-23T12:00:00.000Z',
        },
      ],
      now
    )

    expect(holds).toEqual([
      { userId: 'user-1', retentionUntil: '2026-09-20T12:00:00.000Z' },
    ])
  })

  it('does not block users whose retention window has already elapsed', () => {
    const holds = collectVerificationRetentionHolds(
      [
        {
          user_id: 'user-1',
          retention_expires_at: '2026-08-01T12:00:00.000Z',
          updated_at: '2026-07-04T12:00:00.000Z',
        },
      ],
      now
    )

    expect(holds).toEqual([])
  })

  it('does not block scrubbed verification stubs even if updated_at is recent', () => {
    const holds = collectVerificationRetentionHolds(
      [
        {
          user_id: 'user-1',
          retention_expires_at: null,
          updated_at: '2026-09-01T12:00:00.000Z',
          provider_data: { scrubbed: true, reason: 'retention_policy' },
        },
      ],
      now
    )

    expect(holds).toEqual([])
  })

  it('falls back to updated_at + 28 days when retention_expires_at is missing', () => {
    const holds = collectVerificationRetentionHolds(
      [
        {
          user_id: 'user-1',
          retention_expires_at: null,
          updated_at: '2026-08-20T12:00:00.000Z',
        },
      ],
      now
    )

    expect(holds).toEqual([
      { userId: 'user-1', retentionUntil: '2026-09-17T12:00:00.000Z' },
    ])
  })

  it('keeps the latest expiry when a user has multiple rows', () => {
    const holds = collectVerificationRetentionHolds(
      [
        {
          user_id: 'user-1',
          retention_expires_at: '2026-09-10T12:00:00.000Z',
        },
        {
          user_id: 'user-1',
          retention_expires_at: '2026-09-25T12:00:00.000Z',
        },
      ],
      now
    )

    expect(holds).toEqual([
      { userId: 'user-1', retentionUntil: '2026-09-25T12:00:00.000Z' },
    ])
  })
})
