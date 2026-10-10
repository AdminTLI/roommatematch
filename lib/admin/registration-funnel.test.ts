import { describe, expect, it } from 'vitest'
import {
  REGISTRATION_FUNNEL_STAGES,
  REGISTRATION_FUNNEL_SIDE_METRICS,
  getRequiredFunnelDropOffPairs,
  normalizeRegistrationStages,
  furthestRegistrationStage,
  REGISTRATION_FUNNEL_FINAL_REQUIRED_STAGE_ID,
} from './registration-funnel'

describe('registration funnel (10-step path + settings side metric)', () => {
  it('lists numbered steps 1–10 in the requested chronological order', () => {
    expect(REGISTRATION_FUNNEL_STAGES.map((s) => s.step)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
    expect(REGISTRATION_FUNNEL_STAGES.map((s) => s.key)).toEqual([
      'signup_submitted',
      'email_verified',
      'academic_filled',
      'context_logistics',
      'using_platform',
      'received_matches',
      'harmony_complete',
      'verification_decision',
      'accepted_match',
      'chatted',
    ])
  })

  it('keeps settings as a side metric only', () => {
    expect(REGISTRATION_FUNNEL_SIDE_METRICS.map((m) => m.key)).toEqual(['settings_filled'])
    expect(REGISTRATION_FUNNEL_STAGES.some((s) => s.key === 'settings_filled')).toBe(false)
  })

  it('uses consecutive drop-offs across all numbered steps', () => {
    const pairs = getRequiredFunnelDropOffPairs()
    expect(pairs).toHaveLength(9)
    expect(pairs[0]).toEqual({ from: 0, to: 1 })
    expect(pairs[pairs.length - 1]).toEqual({ from: 8, to: 9 })
  })

  it('implies earlier steps from later milestones without inventing verification', () => {
    const stages = normalizeRegistrationStages({
      0: true,
      1: true,
      2: false,
      3: false,
      4: true,
      5: true,
      6: true,
      7: false,
      8: true,
      9: false,
    })
    expect(stages[2]).toBe(true)
    expect(stages[3]).toBe(true)
    expect(stages[5]).toBe(true)
    expect(stages[7]).toBe(false)
    expect(furthestRegistrationStage(stages)).toBe(8)
  })

  it('marks journey complete at chatted (step 10)', () => {
    expect(REGISTRATION_FUNNEL_FINAL_REQUIRED_STAGE_ID).toBe(9)
  })
})
