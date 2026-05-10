import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Peers for whom the viewer may request compatibility scores via API routes.
 * Keeps questionnaire-derived signals from being probed for arbitrary users.
 */
export async function filterCompatibilityPeerIds(
  admin: SupabaseClient,
  viewerId: string,
  candidates: string[]
): Promise<string[]> {
  const wanted = [...new Set(candidates.filter((id): id is string => typeof id === 'string' && id.length > 0))]
  if (wanted.length === 0) return []

  const allowed = new Set<string>()

  const { data: suggestions } = await admin
    .from('match_suggestions')
    .select('member_ids')
    .eq('kind', 'pair')
    .in('status', ['pending', 'accepted', 'confirmed'])
    .contains('member_ids', [viewerId])

  for (const row of suggestions || []) {
    const ids = row.member_ids as string[] | null
    if (!Array.isArray(ids)) continue
    for (const id of ids) {
      if (id && id !== viewerId) allowed.add(id)
    }
  }

  const { data: matches } = await admin
    .from('matches')
    .select('a_user,b_user')
    .or(`a_user.eq.${viewerId},b_user.eq.${viewerId}`)
    .in('status', ['pending', 'accepted'])

  for (const m of matches || []) {
    const other = m.a_user === viewerId ? m.b_user : m.a_user
    if (other && typeof other === 'string') allowed.add(other)
  }

  const { data: myMemberships } = await admin.from('chat_members').select('chat_id').eq('user_id', viewerId)

  const chatIds = [...new Set((myMemberships || []).map((c) => c.chat_id).filter(Boolean))] as string[]
  if (chatIds.length > 0) {
    const { data: dmChats } = await admin.from('chats').select('id').in('id', chatIds).eq('is_group', false)

    const dmChatIds = new Set((dmChats || []).map((c) => c.id))
    if (dmChatIds.size > 0) {
      const { data: dmMembers } = await admin
        .from('chat_members')
        .select('chat_id,user_id')
        .in('chat_id', [...dmChatIds])

      const byChat = new Map<string, string[]>()
      for (const row of dmMembers || []) {
        const list = byChat.get(row.chat_id) || []
        list.push(row.user_id)
        byChat.set(row.chat_id, list)
      }
      for (const users of byChat.values()) {
        if (users.length === 2 && users.includes(viewerId)) {
          const other = users.find((u) => u !== viewerId)
          if (other) allowed.add(other)
        }
      }
    }
  }

  return wanted.filter((id) => allowed.has(id))
}
