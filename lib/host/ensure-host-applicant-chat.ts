import type { SupabaseClient } from '@supabase/supabase-js'
import { ensureProfileAccessRows } from '@/lib/privacy/profile-access-server'
import { safeLogger } from '@/lib/utils/logger'

/**
 * Create (or reuse) a dedicated host↔applicant housing chat.
 * Never reuses roommate pair_key DMs — student and host inboxes stay separate
 * even when both roles share the same auth user / email.
 */
export async function ensureHostApplicantChat(
  admin: SupabaseClient,
  opts: {
    hostUserId: string
    applicantUserId: string
    applicationId: string
    listingTitle: string
  }
): Promise<{ chatId: string; created: boolean }> {
  if (!opts.hostUserId || !opts.applicantUserId || opts.hostUserId === opts.applicantUserId) {
    throw new Error('ensureHostApplicantChat requires distinct host and applicant users')
  }

  const { data: existingApp, error: appErr } = await admin
    .from('housing_applications')
    .select('host_chat_id')
    .eq('id', opts.applicationId)
    .maybeSingle()

  if (appErr) throw appErr

  if (existingApp?.host_chat_id) {
    const { data: linked } = await admin
      .from('chats')
      .select('id, housing_application_id, pair_key')
      .eq('id', existingApp.host_chat_id)
      .maybeSingle()

    // Dedicated housing room (no roommate pair_key)
    if (
      linked &&
      linked.housing_application_id === opts.applicationId &&
      linked.pair_key == null
    ) {
      return { chatId: linked.id, created: false }
    }
  }

  const { data: byApplication } = await admin
    .from('chats')
    .select('id, pair_key')
    .eq('housing_application_id', opts.applicationId)
    .is('pair_key', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (byApplication?.id) {
    await admin
      .from('housing_applications')
      .update({
        host_chat_id: byApplication.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', opts.applicationId)

    return { chatId: byApplication.id, created: false }
  }

  const { data: chat, error: chatErr } = await admin
    .from('chats')
    .insert({
      is_group: false,
      created_by: opts.hostUserId,
      match_id: null,
      pair_key: null,
      housing_application_id: opts.applicationId,
    })
    .select('id')
    .single()

  if (chatErr || !chat?.id) {
    safeLogger.error('[ensureHostApplicantChat] chat insert failed', { chatErr })
    throw chatErr || new Error('Failed to create host applicant chat')
  }

  const { error: membersErr } = await admin.from('chat_members').insert([
    { chat_id: chat.id, user_id: opts.hostUserId },
    { chat_id: chat.id, user_id: opts.applicantUserId },
  ])

  if (membersErr) {
    safeLogger.error('[ensureHostApplicantChat] members insert failed', { membersErr })
    // Roll back empty housing room so Accept can retry cleanly
    await admin.from('chats').delete().eq('id', chat.id)
    throw membersErr
  }

  await admin
    .from('housing_applications')
    .update({
      host_chat_id: chat.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', opts.applicationId)

  try {
    await ensureProfileAccessRows(admin, chat.id)
  } catch (e) {
    safeLogger.warn('[ensureHostApplicantChat] profile access ensure failed', { e })
  }

  try {
    await admin.from('messages').insert({
      chat_id: chat.id,
      user_id: opts.hostUserId,
      content: `You're connected about ${opts.listingTitle}. Discuss details here.`,
    })
  } catch (e) {
    safeLogger.warn('[ensureHostApplicantChat] welcome insert failed', { e })
  }

  return { chatId: chat.id, created: true }
}
