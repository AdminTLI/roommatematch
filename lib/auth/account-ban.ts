/**
 * Hard ban / unban helpers: deactivate, Auth ban, session revoke, email denylist, Persona tag.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import {
  clearBannedEmailsForUser,
  collectUserEmails,
  upsertBannedEmailsForUser,
} from '@/lib/auth/banned-emails'
import {
  tagPersonaAccountBanned,
  untagPersonaAccountBanned,
} from '@/lib/verification/persona-client'

/** ~100 years — treated as permanent ban in Supabase Auth */
const PERMANENT_BAN_DURATION = '876000h'

export async function hardBanUser(
  admin: SupabaseClient,
  params: {
    userId: string
    bannedBy?: string | null
    reason?: string | null
  }
): Promise<{ ok: boolean; error?: string }> {
  const { userId, bannedBy, reason } = params

  const { error: deactivateError } = await admin
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (deactivateError) {
    safeLogger.error('[AccountBan] Failed to deactivate user', deactivateError)
    return { ok: false, error: deactivateError.message }
  }

  try {
    await admin.auth.admin.updateUserById(userId, {
      ban_duration: PERMANENT_BAN_DURATION,
    })
  } catch (error) {
    safeLogger.error('[AccountBan] Failed to set Auth ban', { userId, error })
  }

  try {
    await admin.auth.admin.signOut(userId, 'global')
  } catch (error) {
    safeLogger.warn('[AccountBan] Failed to revoke sessions', { userId, error })
  }

  const emails = await collectUserEmails(admin, userId)
  await upsertBannedEmailsForUser(admin, {
    userId,
    emails,
    bannedBy,
    reason: reason || 'account_banned',
  })

  // Best-effort Persona tag
  void tagPersonaAccountBanned(userId)

  return { ok: true }
}

export async function hardUnbanUser(
  admin: SupabaseClient,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error: activateError } = await admin
    .from('users')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (activateError) {
    safeLogger.error('[AccountBan] Failed to activate user', activateError)
    return { ok: false, error: activateError.message }
  }

  try {
    await admin.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
    })
  } catch (error) {
    safeLogger.error('[AccountBan] Failed to clear Auth ban', { userId, error })
  }

  await clearBannedEmailsForUser(admin, userId)
  void untagPersonaAccountBanned(userId)

  return { ok: true }
}
