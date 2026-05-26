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
  updates: ['updates'],
  profile: (userId?: string) => (userId ? ['profile', userId] : ['profile']),
  housingListings: (filters?: Record<string, unknown>) =>
    filters ? ['housing-listings', filters] : ['housing-listings'],
  universities: ['universities'],
  campuses: ['campuses'],
  timezones: ['timezones'],
  compatibility: (userAId?: string, userBId?: string) =>
    userAId && userBId ? ['compatibility', userAId, userBId] : ['compatibility'],
  chatCompatibility: (chatId?: string | null) =>
    chatId ? (['chat', 'compatibility', chatId] as const) : (['chat', 'compatibility'] as const),
  chatPrivacy: (chatId?: string | null, userId?: string | null) =>
    chatId && userId ? (['chat', 'privacy', chatId, userId] as const) : (['chat', 'privacy'] as const),
} as const
