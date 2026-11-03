/**
 * Helpers for categorizing match_suggestions into Suggested / Pending tabs.
 *
 * Important cases for status=`accepted`:
 * - `accepted_by=[]` (legacy algorithm auto-accept): treat as fresh Suggested
 *   for both users — neither has acted yet.
 * - `accepted_by` has the other person only: keep in Suggested so this user
 *   can still respond; without this the card vanishes from both tabs.
 * - I am in `accepted_by`: not Suggested (Pending instead, until mutual).
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

  if (suggestion.status === 'accepted') {
    // Algorithm auto-accept: cron set status='accepted' with no one in
    // accepted_by yet. Both users should see it as a fresh Suggested card.
    if (acceptedBy.length === 0) return true

    // Other person accepted first — keep visible so this user can respond.
    const memberCount = suggestion.memberIds?.length ?? 2
    if (acceptedBy.length < memberCount) return true
  }

  return false
}

/**
 * Discovery / Suggested feed: actionable for me AND not someone I'm already
 * messaging in a 1:1 chat (confirmed or chat-opened early).
 */
export function isDiscoverableSuggestion(
  suggestion: SuggestionTabFields,
  userId: string,
  existingChatPartnerIds: ReadonlySet<string>
): boolean {
  if (!isSuggestedForUser(suggestion, userId)) return false
  const otherId = suggestion.memberIds?.find((id) => id !== userId)
  if (otherId && existingChatPartnerIds.has(otherId)) return false
  return true
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
