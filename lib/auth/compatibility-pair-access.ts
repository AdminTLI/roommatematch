/**
 * Gates server-side compatibility RPCs so callers cannot harvest scores for arbitrary users.
 * Requires same cohort (student vs professional) plus an explicit relationship:
 * active match suggestion, active legacy match row, or a shared non-group chat.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { canViewCohortProfile } from '@/lib/auth/cohort-visibility'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuidString(value: string): boolean {
  return UUID_RE.test(value.trim())
}

const ACTIVE_SUGGESTION_STATUSES = ['pending', 'accepted', 'confirmed'] as const
const ACTIVE_MATCH_STATUSES = ['pending', 'accepted'] as const

export async function viewerMayRequestCompatibilityScore(
  admin: SupabaseClient,
  viewerId: string,
  targetUserId: string
): Promise<boolean> {
  if (viewerId === targetUserId) return false
  if (!isUuidString(targetUserId)) return false
  if (!(await canViewCohortProfile(viewerId, targetUserId))) return false

  const { data: suggestions, error: suggestionError } = await admin
    .from('match_suggestions')
    .select('member_ids, status')
    .contains('member_ids', [viewerId])
    .in('status', [...ACTIVE_SUGGESTION_STATUSES])

  if (!suggestionError) {
    const hit = suggestions?.find((s: { member_ids?: unknown }) => {
      const ids = s.member_ids as string[] | null
      return Array.isArray(ids) && ids.includes(viewerId) && ids.includes(targetUserId)
    })
    if (hit) return true
  }

  const { data: matchRow } = await admin
    .from('matches')
    .select('id')
    .or(
      `and(a_user.eq.${viewerId},b_user.eq.${targetUserId}),and(a_user.eq.${targetUserId},b_user.eq.${viewerId})`
    )
    .in('status', [...ACTIVE_MATCH_STATUSES])
    .maybeSingle()

  if (matchRow) return true

  const { data: myChats } = await admin.from('chat_members').select('chat_id').eq('user_id', viewerId)
  const myChatIds = [...new Set((myChats || []).map((r) => r.chat_id).filter(Boolean))]
  if (myChatIds.length === 0) return false

  const { data: theirOverlap } = await admin
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', targetUserId)
    .in('chat_id', myChatIds)

  const sharedIds = [...new Set((theirOverlap || []).map((r) => r.chat_id).filter(Boolean))]
  if (sharedIds.length === 0) return false

  const { data: dms } = await admin.from('chats').select('id').in('id', sharedIds).eq('is_group', false).limit(1)

  return Boolean(dms && dms.length > 0)
}
