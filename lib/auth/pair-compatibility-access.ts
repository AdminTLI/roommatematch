import type { SupabaseClient } from '@supabase/supabase-js'

const SUGGESTION_STATUSES_FOR_COMPAT = new Set(['pending', 'confirmed', 'accepted'])

/**
 * User IDs the viewer is allowed to run pair compatibility against (suggestions,
 * accepted matches, or locked match records). Used to close IDORs on compatibility RPCs.
 */
export async function getViewerCompatibilityPartnerIds(
  admin: SupabaseClient,
  viewerId: string
): Promise<Set<string>> {
  const partners = new Set<string>()

  const { data: acceptedRows } = await admin
    .from('matches')
    .select('a_user, b_user')
    .eq('status', 'accepted')
    .or(`a_user.eq.${viewerId},b_user.eq.${viewerId}`)

  for (const row of acceptedRows || []) {
    if (row.a_user === viewerId && row.b_user) partners.add(row.b_user)
    else if (row.b_user === viewerId && row.a_user) partners.add(row.a_user)
  }

  const { data: suggestionRows, error: suggestionError } = await admin
    .from('match_suggestions')
    .select('member_ids, status, kind')
    .eq('kind', 'pair')
    .contains('member_ids', [viewerId])

  if (!suggestionError && suggestionRows) {
    for (const s of suggestionRows) {
      if (!SUGGESTION_STATUSES_FOR_COMPAT.has(String(s.status))) continue
      const ids = s.member_ids as string[] | null
      if (!Array.isArray(ids) || ids.length !== 2) continue
      for (const id of ids) {
        if (id && id !== viewerId) partners.add(id)
      }
    }
  }

  try {
    const { data: lockedRows, error: lockedErr } = await admin
      .from('match_records')
      .select('user_ids')
      .eq('locked', true)
      .contains('user_ids', [viewerId])

    if (!lockedErr && lockedRows) {
      for (const m of lockedRows) {
        const ids = m.user_ids as string[] | null
        if (!Array.isArray(ids)) continue
        for (const id of ids) {
          if (id && id !== viewerId) partners.add(id)
        }
      }
    }
  } catch {
    /* match_records may be absent in some environments */
  }

  return partners
}

export async function viewerMayComputeCompatibilityWith(
  admin: SupabaseClient,
  viewerId: string,
  targetId: string
): Promise<boolean> {
  if (!viewerId || !targetId || viewerId === targetId) return false
  const partners = await getViewerCompatibilityPartnerIds(admin, viewerId)
  return partners.has(targetId)
}
