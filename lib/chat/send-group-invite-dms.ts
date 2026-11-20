import type { SupabaseClient } from '@supabase/supabase-js'
import { ensureDirectChat } from '@/lib/chat/ensure-direct-chat'
import {
  groupInvitePreviewText,
  type GroupInviteMessageMetadata,
} from '@/lib/chat/group-invite-metadata'
import { safeLogger } from '@/lib/utils/logger'

type InviteRow = {
  id: string
  invitee_id: string
}

type GroupInviteDmPayload = {
  groupChatId: string
  groupName: string | null
  groupDescription: string | null
  groupIntent: 'housing' | 'study' | 'social' | 'general'
  contextMessage: string | null
  memberCount: number
  invitations: InviteRow[]
}

/**
 * After group invitations are created, post an interactive invite card
 * into each invitee's existing (or newly ensured) 1:1 chat with the creator.
 */
export async function sendGroupInviteDirectMessages(
  admin: SupabaseClient,
  creatorId: string,
  payload: GroupInviteDmPayload
): Promise<void> {
  for (const invitation of payload.invitations) {
    try {
      const { chatId: dmChatId } = await ensureDirectChat(admin, creatorId, invitation.invitee_id, {
        createdBy: creatorId,
        welcome: true,
      })

      const metadata: GroupInviteMessageMetadata = {
        type: 'group_invite',
        invitation_id: invitation.id,
        group_chat_id: payload.groupChatId,
        group_name: payload.groupName,
        group_description: payload.groupDescription,
        group_intent: payload.groupIntent,
        context_message: payload.contextMessage,
        member_count: payload.memberCount,
        status: 'pending',
      }

      const { error } = await admin.from('messages').insert({
        chat_id: dmChatId,
        user_id: creatorId,
        content: groupInvitePreviewText(metadata),
        metadata,
      })

      if (error) {
        safeLogger.warn('Failed to insert group invite DM', {
          error,
          dmChatId,
          inviteeId: invitation.invitee_id,
        })
      }
    } catch (err) {
      safeLogger.warn('Failed to send group invite DM', {
        error: err,
        inviteeId: invitation.invitee_id,
        groupChatId: payload.groupChatId,
      })
    }
  }
}

/** Mark matching pending invite cards as accepted/declined after invitation response. */
export async function markGroupInviteMessagesResolved(
  admin: SupabaseClient,
  opts: {
    groupChatId: string
    inviteeId: string
    status: 'accepted' | 'declined'
  }
): Promise<void> {
  const { data: memberships } = await admin
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', opts.inviteeId)

  const chatIds = (memberships || []).map((m) => m.chat_id)
  if (chatIds.length === 0) return

  const { data: rows, error } = await admin
    .from('messages')
    .select('id, metadata')
    .in('chat_id', chatIds)
    .contains('metadata', {
      type: 'group_invite',
      group_chat_id: opts.groupChatId,
      status: 'pending',
    })

  if (error) {
    safeLogger.warn('Failed to load group invite messages for resolve', { error })
    return
  }

  for (const row of rows || []) {
    const meta = row.metadata as GroupInviteMessageMetadata | null
    if (!meta || meta.type !== 'group_invite') continue

    const { error: updateError } = await admin
      .from('messages')
      .update({
        metadata: { ...meta, status: opts.status },
      })
      .eq('id', row.id)

    if (updateError) {
      safeLogger.warn('Failed to update group invite message status', {
        error: updateError,
        messageId: row.id,
      })
    }
  }
}
