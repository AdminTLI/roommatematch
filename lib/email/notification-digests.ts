import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { sendEmail } from './workflows'
import type { NotificationType } from '@/lib/notifications/types'

const MATCH_NOTIFICATION_TYPES: NotificationType[] = ['match_created', 'match_accepted', 'match_confirmed']
const MESSAGE_DIGEST_HOURS = 24
const MATCH_DIGEST_HOURS = 72

// Email engagement guidance generally favors weekday mornings; we use a small
// local-time window in Amsterdam (DST-aware via Intl).
const SEND_WINDOW_AMS_START_HOUR = 9
const SEND_WINDOW_AMS_END_HOUR_EXCLUSIVE = 11
const AMSTERDAM_TZ = 'Europe/Amsterdam'

function getHourInTimeZone(date: Date, timeZone: string): number {
  const hourStr = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour: '2-digit',
    hour12: false,
  }).format(date)
  return parseInt(hourStr, 10)
}

function isWithinSendWindowAmsterdam(now: Date) {
  const h = getHourInTimeZone(now, AMSTERDAM_TZ)
  return h >= SEND_WINDOW_AMS_START_HOUR && h < SEND_WINDOW_AMS_END_HOUR_EXCLUSIVE
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function nlToBr(text: string) {
  return escapeHtml(text).replaceAll('\n', '<br/>')
}

function pluralize(count: number, singular: string, plural?: string) {
  if (count === 1) return singular
  return plural ?? `${singular}s`
}

export function buildMatchesDigestEmail(params: {
  toName?: string
  appUrl: string
  count: number
}) {
  const { toName, appUrl, count } = params

  const niceName = toName?.trim() ? toName.trim() : 'there'
  const matchesNoun = pluralize(count, 'match')
  const matchesCountStr = String(count)
  const subject = `Your match radar: ${matchesCountStr} ${pluralize(count, 'new match')}`
  const link = `${appUrl}/matches`

  const html = `
    <div>
      <h2 style="margin:0 0 12px;">Your match radar is buzzing</h2>
      <p style="margin:0 0 12px;">Hey ${escapeHtml(niceName)},</p>
      <p style="margin:0 0 12px;">
        You have <strong>${matchesCountStr} new ${escapeHtml(matchesNoun)}</strong> in the last 72 hours.
        It’s time to say hi and turn “maybe” into “we’ll meet.”
      </p>
      <a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 14px;background:#2563eb;color:white;text-decoration:none;border-radius:10px;">
        Check your matches
      </a>
      <p style="margin:14px 0 0;color:#555;font-size:13px;">
        Tip: first messages that ask about real plans tend to get replies.
      </p>
    </div>
  `

  const text = `Hey ${niceName},\n\nYou have ${matchesCountStr} new ${matchesNoun} in the last 72 hours.\nIt’s time to say hi and turn “maybe” into “we’ll meet.”\n\nCheck your matches: ${link}\n`

  return { subject, html, text }
}

export function buildMessagesDigestEmail(params: {
  toName?: string
  appUrl: string
  count: number
}) {
  const { toName, appUrl, count } = params
  const niceName = toName?.trim() ? toName.trim() : 'there'
  const noun = pluralize(count, 'new message')
  const subject = `Inbox alert: ${count} ${noun}`
  const link = `${appUrl}/chat`

  const html = `
    <div>
      <h2 style="margin:0 0 12px;">You’ve got messages waiting</h2>
      <p style="margin:0 0 12px;">Hey ${escapeHtml(niceName)},</p>
      <p style="margin:0 0 12px;">
        Good timing: you have <strong>${escapeHtml(String(count))} ${escapeHtml(noun)}</strong> in the last 24 hours.
        Don’t let the conversation cool—pop into your inbox and reply when you’re ready.
      </p>
      <a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 14px;background:#7c3aed;color:white;text-decoration:none;border-radius:10px;">
        Open messages
      </a>
      <p style="margin:14px 0 0;color:#555;font-size:13px;">
        Quick replies are the secret to fast connections.
      </p>
    </div>
  `

  const text = `Hey ${niceName},\n\nYou have ${count} ${noun} in the last 24 hours.\nOpen your messages: ${link}\n`

  return { subject, html, text }
}

export function buildPlatformUpdatesDigestEmail(params: {
  toName?: string
  appUrl: string
  announcementTitle: string
  announcementBody: string
  actionUrl?: string | null
}) {
  const { toName, appUrl, announcementTitle, announcementBody, actionUrl } = params

  const niceName = toName?.trim() ? toName.trim() : 'there'
  const subject = `Domu Match update: ${announcementTitle}`
  const link = actionUrl || `${appUrl}/notifications`

  const html = `
    <div>
      <h2 style="margin:0 0 12px;">${escapeHtml(announcementTitle)}</h2>
      <p style="margin:0 0 12px;">Hey ${escapeHtml(niceName)},</p>
      <p style="margin:0 0 12px;">Here’s what’s new on Domu Match:</p>
      <div style="margin:0 0 14px;padding:12px 14px;background:#f5f5ff;border-radius:12px;">
        ${nlToBr(announcementBody)}
      </div>
      <a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 14px;background:#111827;color:white;text-decoration:none;border-radius:10px;">
        See the update
      </a>
      <p style="margin:14px 0 0;color:#555;font-size:13px;">
        Thanks for being part of Domu Match.
      </p>
    </div>
  `

  const text = `Hey ${niceName},\n\nHere’s what’s new on Domu Match: ${announcementTitle}\n\n${announcementBody}\n\nRead the update: ${link}\n`

  return { subject, html, text }
}

async function computeNewMatchCount(opts: {
  supabase: ReturnType<typeof createAdminClient>
  userId: string
  windowHours: number
}): Promise<{ count: number }> {
  const { supabase, userId, windowHours } = opts
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000)

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('metadata')
    .eq('user_id', userId)
    .in('type', MATCH_NOTIFICATION_TYPES)
    .gte('created_at', windowStart.toISOString())

  if (error) {
    safeLogger.error('[EmailDigest] Failed computing match count', { userId, error })
    return { count: 0 }
  }

  const matchIds = new Set<string>()
  for (const n of notifications ?? []) {
    const matchId = (n as any)?.metadata?.match_id
    if (typeof matchId === 'string' && matchId.trim()) {
      matchIds.add(matchId)
    }
  }

  return { count: matchIds.size }
}

async function computeUnreadMessageCount(opts: {
  supabase: ReturnType<typeof createAdminClient>
  userId: string
  windowHours: number
  maxMessagesToScan?: number
}): Promise<{ count: number }> {
  const { supabase, userId, windowHours, maxMessagesToScan = 500 } = opts
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000)

  // Find chats the user is a participant in
  const { data: chatMemberships, error: chatErr } = await supabase
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', userId)

  if (chatErr) {
    safeLogger.error('[EmailDigest] Failed computing unread message count (chat_members)', { userId, error: chatErr })
    return { count: 0 }
  }

  const chatIds = (chatMemberships ?? []).map((m: any) => m.chat_id).filter((id: any) => typeof id === 'string')
  if (chatIds.length === 0) return { count: 0 }

  // Pull recent messages in those chats
  const { data: messages, error: msgErr } = await supabase
    .from('messages')
    .select('id,user_id,chat_id,created_at')
    .in('chat_id', chatIds)
    .gte('created_at', windowStart.toISOString())
    // Only count messages *received* by the user (exclude their own sent messages)
    .neq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(maxMessagesToScan)

  if (msgErr) {
    safeLogger.error('[EmailDigest] Failed computing unread message count (messages)', { userId, error: msgErr })
    return { count: 0 }
  }

  const messageIds = (messages ?? []).map((m: any) => m.id).filter((id: any) => typeof id === 'string')
  if (messageIds.length === 0) return { count: 0 }

  // Determine which of those messages are marked as read by the user
  const { data: reads, error: readsErr } = await supabase
    .from('message_reads')
    .select('message_id')
    .eq('user_id', userId)
    .in('message_id', messageIds)

  if (readsErr) {
    safeLogger.error('[EmailDigest] Failed computing unread message count (message_reads)', { userId, error: readsErr })
    return { count: 0 }
  }

  const readSet = new Set((reads ?? []).map((r: any) => r.message_id).filter((id: any) => typeof id === 'string'))
  const unreadCount = messageIds.filter((id) => !readSet.has(id)).length

  return { count: unreadCount }
}

async function sendMatchesDigestEmail(params: {
  toEmail: string
  toName?: string
  appUrl: string
  count: number
}) {
  const { toEmail, toName, appUrl, count } = params
  const { subject, html, text } = buildMatchesDigestEmail({ toName, appUrl, count })
  await sendEmail({ to: toEmail, subject, html, text })
}

async function sendMessagesDigestEmail(params: {
  toEmail: string
  toName?: string
  appUrl: string
  count: number
}) {
  const { toEmail, toName, appUrl, count } = params
  const { subject, html, text } = buildMessagesDigestEmail({ toName, appUrl, count })
  await sendEmail({ to: toEmail, subject, html, text })
}

async function sendPlatformUpdatesDigestEmail(params: {
  toEmail: string
  toName?: string
  appUrl: string
  announcementTitle: string
  announcementBody: string
  actionUrl?: string | null
}) {
  const { toEmail, toName, appUrl, announcementTitle, announcementBody, actionUrl } = params
  const { subject, html, text } = buildPlatformUpdatesDigestEmail({
    toName,
    appUrl,
    announcementTitle,
    announcementBody,
    actionUrl,
  })
  await sendEmail({ to: toEmail, subject, html, text })
}

export async function sendNotificationDigestEmails() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const now = new Date()

  if (!isWithinSendWindowAmsterdam(now)) {
    safeLogger.info('[EmailDigest] Skipping digest send (outside Amsterdam send window)', {
      amsterdamHour: getHourInTimeZone(now, AMSTERDAM_TZ),
    })
    return { success: true, skipped: 'outside_send_window' as const }
  }

  const supabase = createAdminClient()

  // Compute due times
  const matchesCutoff = new Date(now.getTime() - MATCH_DIGEST_HOURS * 60 * 60 * 1000).toISOString()
  const messagesCutoff = new Date(now.getTime() - MESSAGE_DIGEST_HOURS * 60 * 60 * 1000).toISOString()

  const [dueMatchesNull, dueMatchesOld, dueMessagesNull, dueMessagesOld] = await Promise.all([
    supabase
      .from('notification_email_digest_state')
      .select('user_id,email_matches_last_sent_at')
      .is('email_matches_last_sent_at', null)
      .limit(200),
    supabase
      .from('notification_email_digest_state')
      .select('user_id,email_matches_last_sent_at')
      .lte('email_matches_last_sent_at', matchesCutoff)
      .limit(200),
    supabase
      .from('notification_email_digest_state')
      .select('user_id,email_messages_last_sent_at')
      .is('email_messages_last_sent_at', null)
      .limit(200),
    supabase
      .from('notification_email_digest_state')
      .select('user_id,email_messages_last_sent_at')
      .lte('email_messages_last_sent_at', messagesCutoff)
      .limit(200),
  ])

  const matchesDue = new Set<string>()
  for (const row of dueMatchesNull.data ?? []) matchesDue.add(row.user_id)
  for (const row of dueMatchesOld.data ?? []) matchesDue.add(row.user_id)

  const messagesDue = new Set<string>()
  for (const row of dueMessagesNull.data ?? []) messagesDue.add(row.user_id)
  for (const row of dueMessagesOld.data ?? []) messagesDue.add(row.user_id)

  const dueMatchIds = Array.from(matchesDue)
  const dueMessageIds = Array.from(messagesDue)

  const dueIdsUnion = Array.from(new Set([...dueMatchIds, ...dueMessageIds]))
  if (dueIdsUnion.length === 0) {
    safeLogger.info('[EmailDigest] No users due for email digests')
    return { success: true, sent: 0 }
  }

  // Fetch user emails + names + preferences in bulk
  const [profilesRes, usersRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id,first_name,last_name,notification_preferences')
      .in('user_id', dueIdsUnion),
    supabase
      .from('users')
      .select('id,email')
      .in('id', dueIdsUnion),
  ])

  const profiles = profilesRes.data ?? []
  const users = usersRes.data ?? []

  const profileByUserId = new Map<string, any>(profiles.map((p: any) => [p.user_id, p]))
  const userById = new Map<string, any>(users.map((u: any) => [u.id, u]))

  let sent = 0

  // Send match digests
  for (const userId of dueMatchIds) {
    const profile = profileByUserId.get(userId)
    const user = userById.get(userId)
    if (!profile || !user?.email) continue

    const prefs = profile.notification_preferences || {}
    const emailMatchesEnabled = prefs.emailMatches !== false
    if (!emailMatchesEnabled) continue

    const { count } = await computeNewMatchCount({ supabase, userId, windowHours: MATCH_DIGEST_HOURS })

    // If there are no new matches, we still advance the last-sent timestamp to avoid repeat checks.
    if (count === 0) {
      await supabase
        .from('notification_email_digest_state')
        .update({ email_matches_last_sent_at: now.toISOString() })
        .eq('user_id', userId)
      continue
    }

    const toName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    try {
      await sendMatchesDigestEmail({
        toEmail: user.email,
        toName,
        appUrl,
        count,
      })

      await supabase
        .from('notification_email_digest_state')
        .update({ email_matches_last_sent_at: now.toISOString() })
        .eq('user_id', userId)

      sent++
    } catch (error) {
      safeLogger.error('[EmailDigest] Failed sending match digest', { userId, error })
      // Don't advance last_sent_at so the next run can retry.
    }
  }

  // Send message digests
  for (const userId of dueMessageIds) {
    const profile = profileByUserId.get(userId)
    const user = userById.get(userId)
    if (!profile || !user?.email) continue

    const prefs = profile.notification_preferences || {}
    const emailMessagesEnabled = prefs.emailMessages !== false
    if (!emailMessagesEnabled) continue

    const { count } = await computeUnreadMessageCount({ supabase, userId, windowHours: MESSAGE_DIGEST_HOURS })

    if (count === 0) {
      await supabase
        .from('notification_email_digest_state')
        .update({ email_messages_last_sent_at: now.toISOString() })
        .eq('user_id', userId)
      continue
    }

    const toName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    try {
      await sendMessagesDigestEmail({
        toEmail: user.email,
        toName,
        appUrl,
        count,
      })

      await supabase
        .from('notification_email_digest_state')
        .update({ email_messages_last_sent_at: now.toISOString() })
        .eq('user_id', userId)

      sent++
    } catch (error) {
      safeLogger.error('[EmailDigest] Failed sending message digest', { userId, error })
      // Don't advance last_sent_at so the next run can retry.
    }
  }

  // Platform updates: send active promotion announcements to opted-in users.
  // We record sends in `announcement_email_log` to prevent duplicates.
  try {
    const MAX_PLATFORM_UPDATE_EMAILS_PER_RUN = 200
    const nowISO = now.toISOString()

    const { data: activeAnnouncements, error: annErr } = await supabase
      .from('announcements')
      .select('id,title,body,primary_action_url')
      .eq('is_active', true)
      .eq('type', 'promotion')
      .lte('start_date', nowISO)
      .or(`end_date.is.null,end_date.gte.${nowISO}`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (annErr) {
      safeLogger.warn('[EmailDigest] Platform update query failed; skipping platform emails', { error: annErr })
    } else if ((activeAnnouncements?.length ?? 0) > 0) {
      const { data: updateProfiles, error: profErr } = await supabase
        .from('profiles')
        .select('user_id,first_name,last_name,notification_preferences')
        .contains('notification_preferences', { emailUpdates: true })
        .limit(5000)

      if (profErr) {
        safeLogger.warn('[EmailDigest] Platform update recipients query failed; skipping platform emails', { error: profErr })
      } else {
        const recipientProfiles = updateProfiles ?? []
        const recipientIds = recipientProfiles
          .map((p: any) => p.user_id)
          .filter((id: any) => typeof id === 'string')

        if (recipientIds.length > 0) {
          const { data: updateUsers, error: usersErr } = await supabase
            .from('users')
            .select('id,email')
            .in('id', recipientIds)

          const users = updateUsers ?? []
          const userById = new Map<string, any>(users.map((u: any) => [u.id, u]))

          let sentPlatform = 0

          for (const announcement of activeAnnouncements ?? []) {
            if (sentPlatform >= MAX_PLATFORM_UPDATE_EMAILS_PER_RUN) break

            const announcementId = (announcement as any).id as string

            const { data: alreadySentRows, error: logErr } = await supabase
              .from('announcement_email_log')
              .select('user_id')
              .eq('announcement_id', announcementId)
              .in('user_id', recipientIds)

            if (logErr) {
              safeLogger.warn('[EmailDigest] Platform email log lookup failed; skipping announcement', {
                announcementId,
                error: logErr,
              })
              continue
            }

            const alreadySentSet = new Set(
              (alreadySentRows ?? [])
                .map((r: any) => r.user_id)
                .filter((id: any) => typeof id === 'string')
            )

            const candidates = recipientProfiles.filter((p: any) => !alreadySentSet.has(p.user_id))

            for (const profile of candidates) {
              if (sentPlatform >= MAX_PLATFORM_UPDATE_EMAILS_PER_RUN) break

              const user = userById.get(profile.user_id)
              if (!user?.email) continue

              try {
                await sendPlatformUpdatesDigestEmail({
                  toEmail: user.email,
                  toName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
                  appUrl,
                  announcementTitle: (announcement as any).title,
                  announcementBody: (announcement as any).body,
                  actionUrl: (announcement as any).primary_action_url ?? null,
                })

                await supabase.from('announcement_email_log').insert({
                  announcement_id: announcementId,
                  user_id: profile.user_id,
                })

                sent++
                sentPlatform++
              } catch (error) {
                safeLogger.error('[EmailDigest] Failed sending platform update email', {
                  announcementId,
                  userId: profile.user_id,
                  error,
                })
              }
            }
          }
        }
      }
    }
  } catch (error) {
    safeLogger.warn('[EmailDigest] Platform updates send failed (non-fatal)', { error })
  }

  return { success: true, sent }
}

