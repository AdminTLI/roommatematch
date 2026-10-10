import { describe, expect, it } from 'vitest'
import { shouldShowVerificationNudge, type VerificationNudgeState } from './nudge'

function row(
  partial: Partial<VerificationNudgeState>
): VerificationNudgeState {
  return {
    user_id: 'u1',
    first_shown_at: null,
    last_shown_at: null,
    last_action: null,
    show_count: 0,
    next_eligible_at: null,
    cadence_stage: 'initial',
    ...partial,
  }
}

describe('shouldShowVerificationNudge', () => {
  it('never shows when verified', () => {
    expect(
      shouldShowVerificationNudge({
        isVerified: true,
        row: null,
      })
    ).toBe(false)
  })

  it('shows on first accept when no row', () => {
    expect(
      shouldShowVerificationNudge({
        isVerified: false,
        row: null,
      })
    ).toBe(true)
  })

  it('hides during cooldown after skip', () => {
    const now = new Date('2026-10-10T12:00:00.000Z')
    expect(
      shouldShowVerificationNudge({
        isVerified: false,
        now,
        row: row({
          first_shown_at: '2026-10-10T10:00:00.000Z',
          last_action: 'skipped',
          next_eligible_at: '2026-10-11T10:00:00.000Z',
          cadence_stage: 'day1',
        }),
      })
    ).toBe(false)
  })

  it('shows again once next_eligible_at has passed', () => {
    const now = new Date('2026-10-11T11:00:00.000Z')
    expect(
      shouldShowVerificationNudge({
        isVerified: false,
        now,
        row: row({
          first_shown_at: '2026-10-10T10:00:00.000Z',
          last_action: 'skipped',
          next_eligible_at: '2026-10-11T10:00:00.000Z',
          cadence_stage: 'day1',
        }),
      })
    ).toBe(true)
  })

  it('stops after verified_uni / verified_persona', () => {
    expect(
      shouldShowVerificationNudge({
        isVerified: false,
        row: row({ last_action: 'verified_uni' }),
      })
    ).toBe(false)
    expect(
      shouldShowVerificationNudge({
        isVerified: false,
        row: row({ last_action: 'verified_persona' }),
      })
    ).toBe(false)
  })
})
