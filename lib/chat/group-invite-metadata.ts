export const GROUP_INVITE_MESSAGE_TYPE = 'group_invite' as const

export type GroupInviteMessageStatus = 'pending' | 'accepted' | 'declined'

export type GroupInviteMessageMetadata = {
  type: typeof GROUP_INVITE_MESSAGE_TYPE
  invitation_id: string
  group_chat_id: string
  group_name: string | null
  group_description: string | null
  group_intent: 'housing' | 'study' | 'social' | 'general'
  context_message: string | null
  /** Total people invited (excludes the group creator). */
  member_count: number
  status: GroupInviteMessageStatus
}

export function isGroupInviteMetadata(value: unknown): value is GroupInviteMessageMetadata {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return v.type === GROUP_INVITE_MESSAGE_TYPE && typeof v.group_chat_id === 'string'
}

export function groupInvitePreviewText(meta: Pick<GroupInviteMessageMetadata, 'group_name'>): string {
  const name = meta.group_name?.trim()
  return name ? `Invited you to join “${name}”` : 'Invited you to join a group'
}
