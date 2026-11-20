import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/**
 * Ensure pairwise match rows exist among currently-active group members.
 * Already-confirmed/locked matches get an `accepted` row so progress/unlock
 * logic counts them instead of showing 0/0.
 */
export async function ensurePairwiseAmongActiveMembers(
  admin: SupabaseClient,
  chatId: string,
  activeMemberIds: string[]
): Promise<void> {
  const unique = Array.from(new Set(activeMemberIds.filter(Boolean)))
  if (unique.length < 2) return

  const toInsert: Array<{
    chat_id: string
    user_a_id: string
    user_b_id: string
    status: 'pending' | 'accepted'
  }> = []

  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const userA = unique[i]
      const userB = unique[j]
      const userAId = userA < userB ? userA : userB
      const userBId = userA < userB ? userB : userA

      const { data: existingPair } = await admin
        .from('group_pairwise_matches')
        .select('id')
        .eq('chat_id', chatId)
        .eq('user_a_id', userAId)
        .eq('user_b_id', userBId)
        .maybeSingle()

      if (existingPair) continue

      const { data: existingMatch } = await admin
        .from('match_suggestions')
        .select('id')
        .eq('status', 'confirmed')
        .contains('member_ids', [userAId, userBId])
        .maybeSingle()

      const { data: existingLockedMatch } = await admin
        .from('match_records')
        .select('id')
        .eq('locked', true)
        .contains('user_ids', [userAId, userBId])
        .maybeSingle()

      const alreadyMatched = Boolean(existingMatch || existingLockedMatch)

      toInsert.push({
        chat_id: chatId,
        user_a_id: userAId,
        user_b_id: userBId,
        status: alreadyMatched ? 'accepted' : 'pending',
      })
    }
  }

  if (toInsert.length === 0) return

  const { error } = await admin.from('group_pairwise_matches').insert(toInsert)
  if (error) {
    safeLogger.warn('Failed to ensure progressive pairwise matches', { error, chatId })
  }
}
