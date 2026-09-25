/**
 * Helpers for categorizing match_suggestions into Suggested / Pending tabs.
 *
 * Important: when the *other* user accepts first, status becomes `accepted`
 * with only them in `accepted_by`. That suggestion must still appear in
 * Suggested for the remaining user — otherwise it disappears from both tabs.
 */

export type SuggestionTabFields = {
  status: string
  acceptedBy?: string[] | null
  memberIds?: string[] | null
}

/** Still actionable in Suggested: I have not accepted yet. */
export function isSuggestedForUser(
  suggestion: SuggestionTabFields,
  userId: string
): boolean {
  const acceptedBy = suggestion.acceptedBy || []
  if (acceptedBy.includes(userId)) return false

  if (suggestion.status === 'pending') return true

  // Other person accepted first — keep visible so this user can respond
  const memberCount = suggestion.memberIds?.length ?? 2
  if (
    suggestion.status === 'accepted' &&
    acceptedBy.length > 0 &&
    acceptedBy.length < memberCount
  ) {
    return true
  }

  return false
}

/** I accepted; waiting on the other person. */
export function isPendingForUser(
  suggestion: SuggestionTabFields,
  userId: string
): boolean {
  const acceptedBy = suggestion.acceptedBy || []
  const memberCount = suggestion.memberIds?.length ?? 2
  return (
    suggestion.status === 'accepted' &&
    acceptedBy.includes(userId) &&
    acceptedBy.length < memberCount
  )
}
