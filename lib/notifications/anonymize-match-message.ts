/**
 * Match suggestion / one-sided-accept copy never includes peer names.
 * Applied on read so historical rows stay private without DB round-trips.
 */
export function anonymizeMatchNotificationMessage(
  type: string,
  message: string | null | undefined
): string {
  if (type === 'match_created') {
    return 'We found a potential roommate for you. Check your matches to see who.'
  }
  if (type === 'match_accepted') {
    return 'Someone wants to match with you. Check your matches to respond.'
  }
  return message ?? ''
}
