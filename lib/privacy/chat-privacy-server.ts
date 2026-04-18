import type { SupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/service'
import type { ChatPrivacySnapshot, ProfileAccessFlags } from '@/lib/privacy/profile-access-types'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'

const REVEAL_MESSAGE_THRESHOLD = 10

function flagsFromRow(row: { details_revealed_by_requestor?: boolean; picture_revealed_by_requestor?: boolean } | null): ProfileAccessFlags {
  return {
    details_revealed_by_requestor: Boolean(row?.details_revealed_by_requestor),
    picture_revealed_by_requestor: Boolean(row?.picture_revealed_by_requestor),
  }
}

function partnerDisplayName(params: {
  firstName: string | null
  lastName: string | null
  mutualDetails: boolean
}): string {
  const first = params.firstName?.trim() || ''
  const last = params.lastName?.trim() || ''
  if (!params.mutualDetails) {
    return first ? first : 'Your match'
  }
  if (first && last) return `${first} ${last}`
  if (first) return first
  if (last) return last
  return 'Your match'
}

export async function resolvePairMatchId(
  admin: SupabaseClient,
  userA: string,
  userB: string
): Promise<string | null> {
  const { data, error } = await admin
    .from('matches')
    .select('id')
    .or(`and(a_user.eq.${userA},b_user.eq.${userB}),and(a_user.eq.${userB},b_user.eq.${userA})`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data?.id) return null
  return data.id
}

export async function ensureProfileAccessRows(admin: SupabaseClient, chatId: string): Promise<void> {
  const { data: chat, error: chatErr } = await admin.from('chats').select('id, is_group, match_id').eq('id', chatId).maybeSingle()
  if (chatErr || !chat || chat.is_group) return

  const { data: members, error: memErr } = await admin.from('chat_members').select('user_id').eq('chat_id', chatId)
  if (memErr || !members || members.length !== 2) return

  const a = members[0]!.user_id as string
  const b = members[1]!.user_id as string

  let matchId: string | null = chat.match_id ?? null
  if (!matchId) {
    matchId = await resolvePairMatchId(admin, a, b)
    if (matchId) {
      await admin.from('chats').update({ match_id: matchId }).eq('id', chatId)
    }
  }

  const { data: existing } = await admin.from('profile_access_control').select('requesting_user_id').eq('chat_id', chatId)

  if (existing && existing.length >= 2) {
    if (matchId) {
      await admin.from('profile_access_control').update({ match_id: matchId }).eq('chat_id', chatId)
    }
    return
  }

  const base = { chat_id: chatId, match_id: matchId, details_revealed_by_requestor: false, picture_revealed_by_requestor: false }

  for (const row of [
    { ...base, requesting_user_id: a, target_user_id: b },
    { ...base, requesting_user_id: b, target_user_id: a },
  ]) {
    const { error } = await admin.from('profile_access_control').insert(row)
    if (error && error.code !== '23505') {
      // Non-duplicate errors are unexpected; leave for caller logs if needed.
      break
    }
  }
}

async function signedPartnerPhotoUrl(partnerUserId: string): Promise<string | null> {
  const service = createServiceClient()
  const { data: profile } = await service.from('profiles').select('profile_picture_url').eq('user_id', partnerUserId).maybeSingle()
  const path = profile?.profile_picture_url
  if (!path || typeof path !== 'string') return null

  const { data, error } = await service.storage.from('secure_profile_pics').createSignedUrl(path, 60 * 30)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export async function getChatPrivacySnapshot(
  admin: SupabaseClient,
  chatId: string,
  viewerUserId: string
): Promise<ChatPrivacySnapshot | null> {
  const { data: chat, error: chatError } = await admin
    .from('chats')
    .select('id, is_group, messages_exchanged_count, match_id')
    .eq('id', chatId)
    .maybeSingle()

  if (chatError || !chat || chat.is_group) return null

  const { data: members, error: membersError } = await admin.from('chat_members').select('user_id').eq('chat_id', chatId)
  if (membersError || !members || members.length !== 2) return null

  const partnerUserId = members.find((m) => m.user_id !== viewerUserId)?.user_id ?? null
  if (!partnerUserId) return null

  await ensureProfileAccessRows(admin, chatId)

  const { data: rows } = await admin
    .from('profile_access_control')
    .select('requesting_user_id, details_revealed_by_requestor, picture_revealed_by_requestor')
    .eq('chat_id', chatId)
    .in('requesting_user_id', [viewerUserId, partnerUserId])

  const viewerRow = rows?.find((r) => r.requesting_user_id === viewerUserId) ?? null
  const partnerRow = rows?.find((r) => r.requesting_user_id === partnerUserId) ?? null

  const viewer = flagsFromRow(viewerRow)
  const peerRevealFlags = flagsFromRow(partnerRow)

  const mutual_details =
    viewer.details_revealed_by_requestor && peerRevealFlags.details_revealed_by_requestor
  const mutual_picture =
    mutual_details &&
    viewer.picture_revealed_by_requestor &&
    peerRevealFlags.picture_revealed_by_requestor

  const partnerProfileResult = await admin
    .from('profiles')
    .select('first_name, last_name, avatar_id')
    .eq('user_id', partnerUserId)
    .maybeSingle()
  const partnerProfile = partnerProfileResult.data

  const { data: viewerProfile } = await admin.from('profiles').select('avatar_id').eq('user_id', viewerUserId).maybeSingle()
  const viewer_avatar_url = programmaticAvatarUrl(viewerProfile?.avatar_id, viewerUserId)

  let partner_picture_signed_url: string | null = null
  if (mutual_picture) {
    partner_picture_signed_url = await signedPartnerPhotoUrl(partnerUserId)
  }
  const partner_avatar_url =
    partner_picture_signed_url ?? programmaticAvatarUrl(partnerProfile?.avatar_id, partnerUserId)

  const cnt = Number(chat.messages_exchanged_count ?? 0)
  const show_reveal_prompt = cnt >= REVEAL_MESSAGE_THRESHOLD && !mutual_details

  return {
    chat_id: chatId,
    partner_user_id: partnerUserId,
    messages_exchanged_count: cnt,
    show_reveal_prompt,
    viewer,
    partner: peerRevealFlags,
    mutual_details,
    mutual_picture,
    partner_avatar_url,
    partner_picture_signed_url,
    partner_display_name: partnerDisplayName({
      firstName: partnerProfile?.first_name ?? null,
      lastName: partnerProfile?.last_name ?? null,
      mutualDetails: mutual_details,
    }),
    viewer_avatar_url,
  }
}

/**
 * Avatar URL for a chat notification: respects progressive disclosure between recipient and sender.
 */
export async function senderAvatarForChatNotification(
  admin: SupabaseClient,
  recipientUserId: string,
  senderUserId: string,
  chatId: string | null | undefined
): Promise<string> {
  if (!chatId) {
    const { data: p } = await admin.from('profiles').select('avatar_id').eq('user_id', senderUserId).maybeSingle()
    return programmaticAvatarUrl(p?.avatar_id, senderUserId)
  }

  const snap = await getChatPrivacySnapshot(admin, chatId, recipientUserId)
  if (!snap || snap.partner_user_id !== senderUserId) {
    const { data: p } = await admin.from('profiles').select('avatar_id').eq('user_id', senderUserId).maybeSingle()
    return programmaticAvatarUrl(p?.avatar_id, senderUserId)
  }

  return snap.partner_avatar_url ?? programmaticAvatarUrl(undefined, senderUserId)
}
