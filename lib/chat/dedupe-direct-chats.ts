type DirectChatLike = {
  type: 'individual' | 'group'
  isRecentlyMatched: boolean
  mostRecentMessageTime?: number
  participants: Array<{ id: string }>
}

function preferDirectChat<T extends DirectChatLike>(a: T, b: T): T {
  if (a.isRecentlyMatched !== b.isRecentlyMatched) {
    return a.isRecentlyMatched ? b : a
  }
  return (a.mostRecentMessageTime || 0) >= (b.mostRecentMessageTime || 0) ? a : b
}

/** Keep one 1:1 room per partner so duplicate chats cannot appear twice in the list. */
export function dedupeDirectChatsByPartner<T extends DirectChatLike>(
  chats: T[],
  currentUserId: string
): T[] {
  const byPartner = new Map<string, T>()
  const rest: T[] = []

  for (const chat of chats) {
    if (chat.type !== 'individual') {
      rest.push(chat)
      continue
    }

    const partnerId = chat.participants.find((p) => p.id !== currentUserId)?.id
    if (!partnerId) {
      rest.push(chat)
      continue
    }

    const existing = byPartner.get(partnerId)
    byPartner.set(partnerId, existing ? preferDirectChat(existing, chat) : chat)
  }

  return [...byPartner.values(), ...rest]
}
