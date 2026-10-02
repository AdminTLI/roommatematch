import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Returns user IDs with whom the viewer already shares a 1:1 (non-group) chat.
 * Used to keep discovery / Suggested feeds from resurfacing people you're already talking to.
 */
export async function getDirectChatPartnerIds(
  admin: SupabaseClient,
  viewerId: string
): Promise<string[]> {
  const { data: myMemberships, error: membershipError } = await admin
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', viewerId)

  if (membershipError || !myMemberships?.length) {
    return []
  }

  const chatIds = [
    ...new Set(myMemberships.map((row) => row.chat_id).filter(Boolean)),
  ] as string[]

  if (chatIds.length === 0) return []

  const { data: dmChats, error: chatsError } = await admin
    .from('chats')
    .select('id')
    .in('id', chatIds)
    .eq('is_group', false)

  if (chatsError || !dmChats?.length) {
    return []
  }

  const dmChatIds = dmChats.map((chat) => chat.id)
  const { data: dmMembers, error: membersError } = await admin
    .from('chat_members')
    .select('chat_id, user_id')
    .in('chat_id', dmChatIds)

  if (membersError || !dmMembers?.length) {
    return []
  }

  const byChat = new Map<string, string[]>()
  for (const row of dmMembers) {
    const list = byChat.get(row.chat_id) || []
    list.push(row.user_id)
    byChat.set(row.chat_id, list)
  }

  const partners = new Set<string>()
  for (const users of byChat.values()) {
    if (users.length === 2 && users.includes(viewerId)) {
      const other = users.find((id) => id !== viewerId)
      if (other) partners.add(other)
    }
  }

  return [...partners]
}
