/**
 * Centralized definition of the registration / activation funnel that the
 * Admin > Users > Registration Workflow tab tracks.
 *
 * Stage 0 = Signup form submitted (account row exists).
 * Stage 11 = Settings page filled out (final stage).
 *
 * Adjusting the funnel? Change `REGISTRATION_FUNNEL_STAGES` and update the
 * stage computation in `/api/admin/registration-journey/route.ts`.
 */

export interface FunnelStage {
  id: number
  key: string
  label: string
  shortLabel: string
  description: string
}

export const REGISTRATION_FUNNEL_STAGES: ReadonlyArray<FunnelStage> = [
  {
    id: 0,
    key: 'signup_submitted',
    label: 'Signup form submitted',
    shortLabel: 'Signup',
    description: 'Account row exists in auth/users - registration form completed.',
  },
  {
    id: 1,
    key: 'email_verified',
    label: 'Email verified',
    shortLabel: 'Email ✓',
    description: 'User clicked the confirmation link (auth.users.email_confirmed_at set).',
  },
  {
    id: 2,
    key: 'identity_verified',
    label: 'ID verification (Persona)',
    shortLabel: 'ID ✓',
    description: 'Persona inquiry approved or profile.verification_status = verified.',
  },
  {
    id: 3,
    key: 'academic_info',
    label: 'Academic / work info selected',
    shortLabel: 'Academic',
    description:
      'user_academic row created (institution + degree/program selected, or working info for Young Professionals).',
  },
  {
    id: 4,
    key: 'questionnaire_started',
    label: 'Questionnaire started (1+ answers, <20%)',
    shortLabel: 'Quiz started',
    description: 'At least one response saved but less than 20% of required questions answered.',
  },
  {
    id: 5,
    key: 'questionnaire_halfway',
    label: 'Questionnaire >50% complete',
    shortLabel: 'Quiz 50%',
    description: 'More than half of the required questionnaire keys answered.',
  },
  {
    id: 6,
    key: 'questionnaire_submitted',
    label: 'Questionnaire submitted (100%)',
    shortLabel: 'Quiz done',
    description: 'onboarding_submissions row exists for the user.',
  },
  {
    id: 7,
    key: 'received_matches',
    label: 'Received matches',
    shortLabel: 'Matches',
    description: 'At least one pair/group match_suggestion includes the user.',
  },
  {
    id: 8,
    key: 'accepted_match',
    label: 'Accepted a match',
    shortLabel: 'Accepted',
    description: 'User appears in accepted_by[] on a match_suggestion (or status = confirmed).',
  },
  {
    id: 9,
    key: 'opened_chat',
    label: 'Opened a chat',
    shortLabel: 'Chat',
    description: 'User is a member of at least one chat (chat_members row).',
  },
  {
    id: 10,
    key: 'sent_message',
    label: 'Messaged a user',
    shortLabel: 'Message',
    description: 'User has sent at least one message (messages.user_id = user).',
  },
  {
    id: 11,
    key: 'settings_filled',
    label: 'Settings page filled out',
    shortLabel: 'Settings',
    description:
      'Bio/description and at least one of phone/languages filled in - used as proxy for "settings page completed".',
  },
] as const

export type FunnelStageKey = (typeof REGISTRATION_FUNNEL_STAGES)[number]['key']

/**
 * Apply logical implications so the per-user journey heatmap never shows a later
 * milestone without its prerequisites (e.g. Quiz 50% + Quiz done => Quiz started).
 */
export function normalizeRegistrationStages(
  stages: Record<number, boolean>
): Record<number, boolean> {
  const s = { ...stages }

  // Questionnaire sub-stages (4 = started, 5 = >50%, 6 = submitted)
  if (s[5] || s[6]) s[4] = true
  if (s[6]) s[5] = true

  // Questionnaire completion is required before matching in normal flows
  if (s[6]) s[3] = true

  // Match acceptance implies they received suggestions
  if (s[8]) s[7] = true

  // Sending a message implies membership in at least one chat
  if (s[10]) s[9] = true

  // Early onboarding chain: later steps imply earlier account setup
  if (s[2]) s[1] = true
  if (s[3]) {
    s[1] = true
    s[0] = true
  }

  return s
}

/** Highest stage id that is true after normalization. */
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
