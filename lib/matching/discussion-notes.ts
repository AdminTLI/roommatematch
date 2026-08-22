const LOW_SCORE_THRESHOLD = 0.55
const MAX_NOTES = 2

const V2_DIMENSION_NOTES: Record<string, string> = {
  environment:
    'Your daily rhythms differ a bit — quiet hours and sleep schedules are worth comparing early.',
  cleanliness:
    'You have different cleanliness habits — agreeing on shared-space standards upfront helps.',
  communication:
    'You handle feedback a little differently — a quick chat about resolving small issues goes a long way.',
  social:
    'Your preferences around guests and socializing at home differ — house rules are worth aligning on.',
  logistics_context:
    'Your move-in timing or stay-length preferences differ — worth confirming expectations early.',
}

const V2_DIMENSION_KEYS = [
  'environment',
  'cleanliness',
  'communication',
  'social',
  'logistics_context',
] as const

export function generateDiscussionNotes(input: {
  dimensionScores?: Record<string, number> | null
  gateConflicts?: string[]
  softGateOverride?: boolean
  contextScore?: number
  otherUserHasIncompleteAcademic?: boolean
}): string[] {
  const notes: string[] = []
  const dims = input.dimensionScores ?? {}

  if (input.softGateOverride && input.gateConflicts?.length) {
    notes.push(
      'One dealbreaker answer differs - worth a quick chat once you are connected.',
    )
  }

  const lowDims = V2_DIMENSION_KEYS.filter(
    (key) => typeof dims[key] === 'number' && dims[key]! < LOW_SCORE_THRESHOLD,
  ).sort((a, b) => (dims[a] ?? 1) - (dims[b] ?? 1))

  for (const key of lowDims) {
    const note = V2_DIMENSION_NOTES[key]
    if (note && !notes.includes(note)) {
      notes.push(note)
    }
    if (notes.length >= MAX_NOTES) {
      return notes.slice(0, MAX_NOTES)
    }
  }

  if (
    notes.length < MAX_NOTES &&
    input.otherUserHasIncompleteAcademic
  ) {
    notes.push(
      'Their university details are still incomplete — context score may shift once their profile is finished.',
    )
  }

  if (
    notes.length < MAX_NOTES &&
    typeof input.contextScore === 'number' &&
    input.contextScore < LOW_SCORE_THRESHOLD &&
    !input.otherUserHasIncompleteAcademic
  ) {
    notes.push(
      'Your academic or logistics context differs — worth comparing study schedules and practical plans early.',
    )
  }

  return notes.slice(0, MAX_NOTES)
}
