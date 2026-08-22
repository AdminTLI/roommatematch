import { GATE_LABELS, type HardGateId } from '@/lib/matching/item-weights.v2'

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

const GATE_DISCUSSION_NOTES: Record<HardGateId, string> = {
  M5_Q17: 'You have different preferences on smoking indoors — worth confirming before connecting.',
  M8_Q14: 'Your pet preferences differ — a quick chat helps before moving forward.',
  M8_Q19: 'You answered differently on BRP registration — worth checking expectations early.',
  M8_Q11: 'You have different views on Airbnb guests — house rules are worth aligning on.',
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
    const gateId = input.gateConflicts[0] as HardGateId
    const gateNote =
      GATE_DISCUSSION_NOTES[gateId] ??
      `You answered differently on ${GATE_LABELS[gateId]?.toLowerCase() ?? gateId} — worth a quick conversation before connecting.`
    notes.push(gateNote)
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
