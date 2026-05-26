import type { SupabaseClient } from '@supabase/supabase-js'
import { filterCompatibilityPeerIds } from '@/lib/matching/compatibility-peer-access'
import {
  parseLiveCompatibilityRow,
  type LiveCompatibilitySnapshot,
} from '@/lib/matching/live-compatibility'
import type { MatchSuggestion } from '@/lib/matching/types'

export type SuggestionWithLiveCompatibility = MatchSuggestion & {
  liveCompatibility?: LiveCompatibilitySnapshot
}

/**
 * Attach harmony, context, and dimension scores to match suggestions in one batch RPC.
 * Used server-side so clients do not need a separate POST (and CSRF) for scores.
 */
export async function enrichSuggestionsWithLiveCompatibility(
  admin: SupabaseClient,
  viewerId: string,
  suggestions: MatchSuggestion[]
): Promise<SuggestionWithLiveCompatibility[]> {
  if (suggestions.length === 0) return suggestions

  const peerIds = [
    ...new Set(
      suggestions
        .map((s) => s.memberIds?.find((id) => id !== viewerId))
        .filter((id): id is string => Boolean(id))
    ),
  ]

  if (peerIds.length === 0) return suggestions

  const allowedPeers = await filterCompatibilityPeerIds(admin, viewerId, peerIds)
  if (allowedPeers.length === 0) return suggestions

  const { data, error } = await admin.rpc('compute_compatibility_scores_batch', {
    user_a_id: viewerId,
    user_b_ids: allowedPeers,
  })

  if (error) {
    console.error('[enrichSuggestionsWithLiveCompatibility] batch RPC failed:', error.message)
    return suggestions
  }

  const byPeer = new Map<string, LiveCompatibilitySnapshot>()
  for (const row of data || []) {
    const record = row as Record<string, unknown>
    const peerId = record.user_b_id as string | undefined
    const parsed = parseLiveCompatibilityRow(record, peerId)
    if (peerId && parsed) {
      byPeer.set(peerId, parsed)
    }
  }

  return suggestions.map((s) => {
    const otherId = s.memberIds?.find((id) => id !== viewerId)
    const live = otherId ? byPeer.get(otherId) : undefined
    if (!live) return s
    return { ...s, liveCompatibility: live }
  })
}
