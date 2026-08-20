// Legacy v1 section keys — kept so existing users' onboarding_sections rows are not orphaned
export type LegacySectionKey =
  | 'personality-values'
  | 'sleep-circadian'
  | 'noise-sensory'
  | 'home-operations'
  | 'social-hosting-language'
  | 'communication-conflict'
  | 'privacy-territoriality'
  | 'reliability-logistics'
  | 'professional-context'
  | 'location-commute'

// v2 section keys (5 new modules)
export type V2SectionKey =
  | 'logistics-context'
  | 'environment-rhythms'
  | 'cleanliness-operations'
  | 'communication-resolution'
  | 'social-spaces'

export type SectionKey = LegacySectionKey | V2SectionKey

export const V2_SECTION_KEYS: V2SectionKey[] = [
  'logistics-context',
  'environment-rhythms',
  'cleanliness-operations',
  'communication-resolution',
  'social-spaces',
]

export type LikertScaleKind = 'agreement' | 'frequency' | 'comfort'

export type Item = {
  id: string
  section: SectionKey
  kind: 'likert' | 'bipolar' | 'mcq' | 'toggle' | 'timeRange' | 'number' | 'date'
  label: string
  scale?: LikertScaleKind
  dbEligible?: boolean
  specialCategory?: boolean
  options?: { value: string; label: string }[]
  bipolarLabels?: {
    left: string
    right: string
    /** Option 2 — softer lean toward left; must read grammatically on its own */
    softLeft?: string
    /** Option 4 — softer lean toward right; must read grammatically on its own */
    softRight?: string
  }
  min?: number
  max?: number
  step?: number
  optionsFrom?: 'nl-institutions' | 'nl-campuses'
  /** Inclusive 30-minute bounds for timeRange items. `startTo`/`endTo` may wrap past midnight (e.g. 20:00 → 00:00). */
  timeRangeBounds?: {
    startFrom: string
    startTo: string
    endFrom: string
    endTo: string
    /** Quiet hours that begin at night and end the following morning. */
    overnight?: boolean
  }
  /** v2: weight of this item within its module (0–1, all items in module sum to 1). Hard-gate items use 0. */
  inModuleWeight?: number
  /** v2: platform-level hard gate. Mismatch on this item blocks the match (with soft override if single conflict and score ≥ 0.70). */
  hardGate?: boolean
}


