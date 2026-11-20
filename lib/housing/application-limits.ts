/** Caps for how many times one student can apply to the same listing. */
export const MAX_INDIVIDUAL_APPLICATIONS_PER_LISTING = 1
export const MAX_GROUP_APPLICATIONS_PER_LISTING = 3

/** Statuses that free a slot so the user can try again. */
export const APPLICATION_STATUSES_NOT_COUNTING_TOWARD_CAP = ['withdrawn'] as const

export function sortMemberIds(ids: string[]): string[] {
  return [...new Set(ids)].sort()
}

export function sameParty(a: string[] | null | undefined, b: string[]): boolean {
  const left = sortMemberIds(a || [])
  const right = sortMemberIds(b)
  if (left.length !== right.length) return false
  return left.every((id, i) => id === right[i])
}
