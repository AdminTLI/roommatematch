/**
 * Admin > Users > Registration Workflow funnel.
 *
 * Numbered product path (display 1–10):
 *   1 Signup → 2 Email confirm → 3 Academic → 4 Context (logistics module 1)
 *   → 5 Using platform → 6 Received matches → 7 Full questionnaire
 *   → 8 Verification (uni / Persona / skip) → 9 Accepted match → 10 Chatted
 *
 * Settings is a side metric (can happen anytime) — not part of the numbered path.
 *
 * Persistence (write-time first-reach):
 *   - tables: registration_funnel_milestones, registration_funnel_progress
 *   - helper: lib/admin/registration-funnel-track.ts
 *   - rpc: record_registration_funnel_milestone
 *
 * Adjusting? Update this file plus:
 *   - `/api/admin/registration-journey/route.ts`
 *   - `lib/institution/metrics.ts`
 *   - `lib/admin/registration-funnel-track.ts`
 *   - `registration-workflow-panel.tsx`
 *   - migration CHECK constraints on stage_key
 */

export interface FunnelStage {
  id: number
  /** 1-based number shown in the admin UI */
  step: number
  key: string
  label: string
  shortLabel: string
  description: string
}

export interface FunnelSideMetric {
  key: string
  label: string
  shortLabel: string
  description: string
}

/** Numbered journey steps (internal ids 0–9 ↔ display steps 1–10). */
export const REGISTRATION_FUNNEL_STAGES: ReadonlyArray<FunnelStage> = [
  {
    id: 0,
    step: 1,
    key: 'signup_submitted',
    label: 'Signup form submitted',
    shortLabel: 'Signup',
    description: 'Account created — registration form completed.',
  },
  {
    id: 1,
    step: 2,
    key: 'email_verified',
    label: 'Confirmation email verified',
    shortLabel: 'Email ✓',
    description: 'Login email confirmed via OTP (auth.users.email_confirmed_at).',
  },
  {
    id: 2,
    step: 3,
    key: 'academic_filled',
    label: 'Academic info filled in',
    shortLabel: 'Academic',
    description:
      'Intro/academic questionnaire saved (user_academic row or onboarding intro section).',
  },
  {
    id: 3,
    step: 4,
    key: 'context_logistics',
    label: 'Context questionnaire (logistics)',
    shortLabel: 'Context',
    description:
      'Logistics / module 1 context answers saved (onboarding_sections.logistics-context) — feeds context score.',
  },
  {
    id: 4,
    step: 5,
    key: 'using_platform',
    label: 'Using the platform',
    shortLabel: 'Active',
    description:
      'Context onboarding submitted — dashboard unlocked and the user can use the product.',
  },
  {
    id: 5,
    step: 6,
    key: 'received_matches',
    label: 'Received matches',
    shortLabel: 'Matches',
    description: 'At least one match_suggestion includes the user.',
  },
  {
    id: 6,
    step: 7,
    key: 'harmony_complete',
    label: 'Full questionnaire complete',
    shortLabel: 'Harmony',
    description:
      'Full living-style questionnaire submitted (completion_stage = full, or legacy submission).',
  },
  {
    id: 7,
    step: 8,
    key: 'verification_decision',
    label: 'Verification decision',
    shortLabel: 'Verify',
    description:
      'Chose university email, Persona ID, or skip (verified flags or verification_nudge_state).',
  },
  {
    id: 8,
    step: 9,
    key: 'accepted_match',
    label: 'Accepted a match',
    shortLabel: 'Accepted',
    description: 'User accepted at least one match (accepted_by[] or confirmed suggestion).',
  },
  {
    id: 9,
    step: 10,
    key: 'chatted',
    label: 'Chatted with another user',
    shortLabel: 'Chat',
    description: 'User sent at least one chat message.',
  },
] as const

/**
 * Side metrics shown in the same heatmap table but outside the numbered path.
 * Settings can be filled at any time.
 */
export const REGISTRATION_FUNNEL_SIDE_METRICS: ReadonlyArray<FunnelSideMetric> = [
  {
    key: 'settings_filled',
    label: 'Settings filled',
    shortLabel: 'Settings',
    description:
      'Side metric (anytime). Bio plus phone and/or languages filled in settings.',
  },
] as const

export type FunnelStageKey = (typeof REGISTRATION_FUNNEL_STAGES)[number]['key']
export type FunnelSideMetricKey = (typeof REGISTRATION_FUNNEL_SIDE_METRICS)[number]['key']

/** Final numbered step (chatted) — “completed journey” for funnel stats. */
export const REGISTRATION_FUNNEL_FINAL_REQUIRED_STAGE_ID = 9

export function getRequiredFunnelDropOffPairs(): Array<{ from: number; to: number }> {
  const pairs: Array<{ from: number; to: number }> = []
  for (let i = 0; i < REGISTRATION_FUNNEL_STAGES.length - 1; i++) {
    pairs.push({
      from: REGISTRATION_FUNNEL_STAGES[i].id,
      to: REGISTRATION_FUNNEL_STAGES[i + 1].id,
    })
  }
  return pairs
}

/**
 * Apply logical implications so later milestones imply earlier numbered steps.
 * Settings is never implied here (side metric only).
 */
export function normalizeRegistrationStages(
  stages: Record<number, boolean>
): Record<number, boolean> {
  const s = { ...stages }

  // Chat → accepted often, but not always; only imply earlier product use
  if (s[9]) {
    s[4] = true // using platform
    s[1] = true
    s[0] = true
  }

  // Accepted → received matches + using platform
  if (s[8]) {
    s[5] = true
    s[4] = true
  }

  // Verification decision implies they reached the product
  if (s[7]) {
    s[4] = true
    s[1] = true
    s[0] = true
  }

  // Full questionnaire implies context + academic + email
  if (s[6]) {
    s[3] = true
    s[2] = true
    s[4] = true
    s[1] = true
    s[0] = true
  }

  // Received matches implies using platform
  if (s[5]) s[4] = true

  // Using platform implies context logistics + academic + email
  if (s[4]) {
    s[3] = true
    s[2] = true
    s[1] = true
    s[0] = true
  }

  // Context logistics implies academic + email
  if (s[3]) {
    s[2] = true
    s[1] = true
    s[0] = true
  }

  // Academic implies email + signup
  if (s[2]) {
    s[1] = true
    s[0] = true
  }

  if (s[1]) s[0] = true

  return s
}

/** Highest numbered stage id that is true after normalization. */
export function furthestRegistrationStage(stages: Record<number, boolean>): number {
  let furthest = 0
  for (let i = REGISTRATION_FUNNEL_STAGES.length - 1; i >= 0; i--) {
    const stage = REGISTRATION_FUNNEL_STAGES[i]
    if (stages[stage.id]) {
      furthest = stage.id
      break
    }
  }
  return furthest
}
