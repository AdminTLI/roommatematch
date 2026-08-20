/**
 * Chat-only similarity framing for compatibility scores.
 * Scores measure how closely two people align, never quality or "good answers".
 */

export function vibeAlignmentSubtitle(percent: number | null | undefined): string {
  if (percent == null || Number.isNaN(percent)) {
    return 'Compare how your living preferences line up'
  }
  if (percent >= 75) return 'Closely aligned lifestyles'
  if (percent >= 55) return 'Similar living rhythms'
  if (percent >= 40) return 'Some overlap, worth a friendly chat'
  return 'Different rhythms, good to compare early'
}

/** Similarity band label (never Amazing/Great/Good/Low). */
export function vibeAlignmentBand(percent: number | null | undefined): string {
  if (percent == null || Number.isNaN(percent)) return 'Compatibility'
  if (percent >= 75) return 'Strongly aligned'
  if (percent >= 55) return 'Partly aligned'
  if (percent >= 40) return 'Some overlap'
  return 'Different rhythms'
}

export function vibeAlignmentBarClass(percent: number): string {
  if (percent >= 75) return 'bg-emerald-500'
  if (percent >= 55) return 'bg-violet-500'
  return 'bg-amber-400'
}

export function vibeAlignmentTextClass(percent: number): string {
  if (percent >= 75) return 'text-emerald-600 dark:text-emerald-400'
  if (percent >= 55) return 'text-violet-600 dark:text-violet-400'
  return 'text-amber-600 dark:text-amber-400'
}

export function vibeAlignmentRingColor(percent: number): string {
  if (percent >= 75) return '#10B981'
  if (percent >= 55) return '#7C3AED'
  return '#F59E0B'
}

/** v2 questionnaire modules in display order. */
export const V2_CHAT_MODULES = [
  {
    key: 'logistics_context',
    label: 'Logistics',
    blurb: 'How similarly you answered on budgets, move-in timing, and house logistics.',
  },
  {
    key: 'environment',
    label: 'Environment',
    blurb: 'How similarly you answered on sleep, quiet hours, and shared-space rhythm.',
  },
  {
    key: 'cleanliness',
    label: 'Cleanliness',
    blurb: 'How similarly you answered on chores, kitchen habits, and upkeep.',
  },
  {
    key: 'communication',
    label: 'Communication',
    blurb: 'How similarly you answered on feedback style and resolving friction.',
  },
  {
    key: 'social',
    label: 'Social Life',
    blurb: 'How similarly you answered on guests, gatherings, and shared areas.',
  },
] as const

export type V2ChatModuleKey = (typeof V2_CHAT_MODULES)[number]['key']

const LEGACY_DIMENSION_LABELS: Record<string, string> = {
  cleanliness: 'Cleanliness',
  noise: 'Noise Tolerance',
  guests: 'Guest Frequency',
  sleep: 'Sleep Schedule',
  shared_spaces: 'Shared Spaces',
  substances: 'Substances',
  study_social: 'Study/Social Balance',
  home_vibe: 'Home Vibe',
}

export function isV2DimensionPayload(raw: Record<string, unknown> | null | undefined): boolean {
  if (!raw) return false
  return V2_CHAT_MODULES.some(m => typeof raw[m.key] === 'number')
}

export function legacyDimensionLabel(key: string): string {
  return LEGACY_DIMENSION_LABELS[key] || key.replace(/_/g, ' ')
}
