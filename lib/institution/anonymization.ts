import { createHmac } from 'crypto'

const SMALL_COUNT_THRESHOLD = 5

function getPseudoSecret(): string {
  return (
    process.env.INSTITUTION_PSEUDO_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'dev-pseudo-secret'
  )
}

/** Deterministic pseudonymous student id scoped to institution. */
export function studentPseudoId(userId: string, institutionId: string): string {
  const digest = createHmac('sha256', getPseudoSecret())
    .update(`${institutionId}:${userId}`)
    .digest('hex')
  return `STU-${digest.slice(0, 10).toUpperCase()}`
}

/** Suppress small counts for k-anonymity (returns number or "<5"). */
export function suppressSmallCount(count: number): number | string {
  if (count < SMALL_COUNT_THRESHOLD) return '<5'
  return count
}

export function suppressSmallRate(count: number, total: number): number | string {
  if (count < SMALL_COUNT_THRESHOLD || total < SMALL_COUNT_THRESHOLD) return '<5'
  return total > 0 ? Math.round((count / total) * 1000) / 10 : 0
}

export const K_ANONYMITY_THRESHOLD = SMALL_COUNT_THRESHOLD
