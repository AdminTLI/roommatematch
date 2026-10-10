import { describe, expect, it } from 'vitest'
import {
  REGISTRATION_FUNNEL_SIDE_METRICS,
  REGISTRATION_FUNNEL_STAGES,
} from './registration-funnel'

describe('registration funnel tracking keys', () => {
  it('exposes stable stage keys for DB CHECK + RPC', () => {
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

  it('exposes settings as the only side metric key', () => {
    expect(REGISTRATION_FUNNEL_SIDE_METRICS.map((m) => m.key)).toEqual([
      'settings_filled',
    ])
  })

  it('keeps display steps 1–10 aligned with stage ids 0–9', () => {
    for (const stage of REGISTRATION_FUNNEL_STAGES) {
      expect(stage.step).toBe(stage.id + 1)
    }
  })
})
