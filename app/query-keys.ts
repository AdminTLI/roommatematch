import { chatHousingContextKey } from '@/lib/chat/fetch-chat-housing-context'

function chatCompatibilityKey(chatId?: string | null) {
  return chatId
    ? (['chat', 'compatibility', chatId] as const)
    : (['chat', 'compatibility'] as const)
}

function groupPanelKey(chatId?: string | null) {
  return chatId ? (['chat', 'group-panel', chatId] as const) : (['chat', 'group-panel'] as const)
}

function chatPrivacyKey(chatId?: string | null, userId?: string | null) {
  return chatId && userId
    ? (['chat', 'privacy', chatId, userId] as const)
    : (['chat', 'privacy'] as const)
}

export const queryKeys = {
  chats: (userId?: string) => (userId ? ['chats', userId] : ['chats']),
  notifications: (userId?: string) => (userId ? ['notifications', userId] : ['notifications']),
  matches: {
    top: (userId?: string) => (userId ? ['matches', 'top', userId] : ['matches', 'top']),
    count: (userId?: string) => (userId ? ['matches', 'count', userId] : ['matches', 'count']),
    compatibility: (userId?: string) =>
      userId ? ['matches', 'compatibility', userId] : ['matches', 'compatibility'],
    all: (userId?: string) => (userId ? ['matches', userId] : ['matches']),
  },
  activity: (userId?: string) => (userId ? ['activity', userId] : ['activity']),
  updates: ['updates'] as const,
  profile: (userId?: string) => (userId ? ['profile', userId] : ['profile']),
  housingListings: (filters?: Record<string, unknown>) =>
    filters ? ['housing-listings', filters] : ['housing-listings'],
  universities: ['universities'] as const,
  campuses: ['campuses'] as const,
  timezones: ['timezones'] as const,
  compatibility: (userAId?: string, userBId?: string) =>
    userAId && userBId ? ['compatibility', userAId, userBId] : ['compatibility'],
  chatCompatibility: chatCompatibilityKey,
  chatHousingContext: chatHousingContextKey,
  groupPanel: groupPanelKey,
  chatPrivacy: chatPrivacyKey,
}

/** @deprecated Prefer importing from `@/lib/chat/fetch-chat-housing-context`. */
export { chatHousingContextKey }
