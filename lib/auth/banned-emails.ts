/**
 * Email denylist for banned/suspended accounts (ban-evasion prevention).
 * Stores only normalized email — no document numbers or identity hashes.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

export const ACCOUNT_BANNED_CODE = 'ACCOUNT_BANNED' as const

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function isEmailBanned(
  admin: SupabaseClient,
  email: string
): Promise<boolean> {
  const normalized = normalizeEmail(email)
  if (!normalized) return false

  const { data, error } = await admin
    .from('banned_emails')
    .select('id')
    .eq('email_normalized', normalized)
    .maybeSingle()

  if (error) {
    safeLogger.error('[BannedEmails] Lookup failed', error)
    // Fail open on infrastructure errors so signup is not globally blocked;
    // positive denylist hits still reject.
    return false
  }

  return Boolean(data)
}

export async function upsertBannedEmailsForUser(
  admin: SupabaseClient,
  params: {
    userId: string
    emails: Array<string | null | undefined>
    bannedBy?: string | null
    reason?: string | null
  }
): Promise<void> {
  const rows = Array.from(
    new Set(
      params.emails
        .filter((e): e is string => Boolean(e && e.trim()))
        .map((e) => normalizeEmail(e))
    )
  ).map((email_normalized) => ({
    email_normalized,
    source_user_id: params.userId,
    banned_by: params.bannedBy || null,
    reason: params.reason || 'account_banned',
  }))

  if (rows.length === 0) return

  const { error } = await admin.from('banned_emails').upsert(rows, {
    onConflict: 'email_normalized',
  })

  if (error) {
    safeLogger.error('[BannedEmails] Upsert failed', error)
  }
}

export async function clearBannedEmailsForUser(
  admin: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await admin.from('banned_emails').delete().eq('source_user_id', userId)

  if (error) {
    safeLogger.error('[BannedEmails] Clear failed', { userId, error })
  }
}

export async function collectUserEmails(
  admin: SupabaseClient,
  userId: string
): Promise<string[]> {
  const emails: string[] = []

  try {
    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    if (authUser?.user?.email) emails.push(authUser.user.email)
  } catch (error) {
    safeLogger.warn('[BannedEmails] Could not read auth email', { userId, error })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('university_email')
    .eq('user_id', userId)
    .maybeSingle()

  if (profile?.university_email) emails.push(profile.university_email)

  const { data: userRow } = await admin
    .from('users')
    .select('email')
    .eq('id', userId)
    .maybeSingle()

  if (userRow?.email) emails.push(userRow.email)

  return emails
}
