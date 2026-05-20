/**
 * Controls whether hot paths read stored match_suggestions scores
 * vs recomputing via compute_compatibility_score on every request.
 *
 * Set MATCH_SCORES_LIVE_SYNC=1 to restore per-request live sync (legacy).
 */
export function useStoredMatchScores(): boolean {
  return process.env.MATCH_SCORES_LIVE_SYNC !== '1'
}

export function shouldRefreshScoresOnSuggestionsList(
  searchParams: URLSearchParams
): boolean {
  return searchParams.get('refreshScores') === 'true'
}
