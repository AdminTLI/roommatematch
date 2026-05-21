import type { SupabaseClient } from '@supabase/supabase-js'
import { createNotificationsForUsers } from '@/lib/notifications/create'
import { sendEmail } from '@/lib/email/workflows'
import { safeLogger } from '@/lib/utils/logger'
import { getRetentionPolicy } from '@/lib/privacy/retention-policies'
import { deleteVerificationStorageForUsers } from '@/lib/privacy/verification-retention'

const INACTIVE_DAYS = getRetentionPolicy('inactive_accounts')?.retentionDays ?? 365
const WARNING_30_DAYS = 30
const WARNING_7_DAYS = 7

export interface InactivityCronResult {
  warnings30d: number
  warnings7d: number
  processed: number
  errors: string[]
}

type InactivityUserRow = {
  id: string
  email: string
  inactivity_status: string
  last_activity_at: string | null
  updated_at: string
}

function daysSince(iso: string | null): number {
  if (!iso) return INACTIVE_DAYS + 1
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

async function isPrivilegedAccount(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()
  const role = roleRow?.role as string | undefined
  if (role === 'admin' || role === 'super_admin') return true

  const { data: adminRow } = await supabase.from('admins').select('id').eq('user_id', userId).maybeSingle()
  return !!adminRow
}

async function hasPendingDeletion(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('dsar_requests')
    .select('id')
    .eq('user_id', userId)
    .eq('request_type', 'deletion')
    .is('deletion_completed_at', null)
    .not('deletion_scheduled_at', 'is', null)
    .limit(1)
  return (data?.length ?? 0) > 0
}

async function sendInactivityWarningEmail(
  email: string,
  daysRemaining: number
): Promise<void> {
  const subject =
    daysRemaining <= 7
      ? 'Your Domu Match account will be anonymized in 7 days'
      : 'Your Domu Match account will be anonymized in 30 days'
  const html = `
    <p>We have not seen activity on your Domu Match account for a long time.</p>
    <p>Per our <a href="https://domumatch.com/privacy">Privacy Policy</a>, accounts inactive for one year are anonymized.</p>
    <p><strong>Log in within ${daysRemaining} days</strong> to keep your account and data.</p>
    <p>If you no longer need the service, you can also delete your account from Settings.</p>
  `
  const text = `Log in within ${daysRemaining} days to keep your Domu Match account. After one year of inactivity we anonymize accounts per our privacy policy.`
  await sendEmail({ to: email, subject, html, text })
}

async function notifyInactivityWarning(
  supabase: SupabaseClient,
  userId: string,
  daysRemaining: number
): Promise<void> {
  await createNotificationsForUsers(
    [userId],
    'system_announcement',
    daysRemaining <= 7 ? 'Account inactive soon' : 'Account inactivity notice',
    daysRemaining <= 7
      ? 'Your account will be anonymized in 7 days unless you log in. See Settings or our Privacy Policy.'
      : 'Your account will be anonymized in 30 days unless you log in. See Settings or our Privacy Policy.',
    { kind: 'inactivity_warning', days_remaining: daysRemaining }
  )
}

/**
 * Send 30-day and 7-day warnings before the 1-year inactivity threshold.
 */
export async function runInactivityWarnings(
  supabase: SupabaseClient
): Promise<{ warnings30d: number; warnings7d: number; errors: string[] }> {
  const errors: string[] = []
  let warnings30d = 0
  let warnings7d = 0

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, inactivity_status, last_activity_at, updated_at')
    .eq('is_active', true)
    .is('inactivity_processed_at', null)
    .limit(500)

  if (error) {
    throw new Error(`Failed to list users for inactivity warnings: ${error.message}`)
  }

  for (const row of (users || []) as InactivityUserRow[]) {
    if (await hasPendingDeletion(supabase, row.id)) continue
    if (await isPrivilegedAccount(supabase, row.id)) continue

    const lastActivity = row.last_activity_at || row.updated_at
    const inactiveDays = daysSince(lastActivity)
    const daysUntilProcess = INACTIVE_DAYS - inactiveDays

    try {
      if (
        daysUntilProcess <= WARNING_30_DAYS &&
        daysUntilProcess > WARNING_7_DAYS &&
        row.inactivity_status === 'active'
      ) {
        await supabase
          .from('users')
          .update({
            inactivity_status: 'warning_30d',
            inactivity_warning_30d_at: new Date().toISOString(),
          })
          .eq('id', row.id)

        await notifyInactivityWarning(supabase, row.id, daysUntilProcess)
        try {
          await sendInactivityWarningEmail(row.email, daysUntilProcess)
        } catch (emailErr) {
          safeLogger.warn('[Inactivity] 30d warning email failed', { userId: row.id, emailErr })
        }
        warnings30d++
      } else if (
        daysUntilProcess <= WARNING_7_DAYS &&
        daysUntilProcess > 0 &&
        (row.inactivity_status === 'active' || row.inactivity_status === 'warning_30d')
      ) {
        await supabase
          .from('users')
          .update({
            inactivity_status: 'warning_7d',
            inactivity_warning_7d_at: new Date().toISOString(),
          })
          .eq('id', row.id)

        await notifyInactivityWarning(supabase, row.id, daysUntilProcess)
        try {
          await sendInactivityWarningEmail(row.email, daysUntilProcess)
        } catch (emailErr) {
          safeLogger.warn('[Inactivity] 7d warning email failed', { userId: row.id, emailErr })
        }
        warnings7d++
      }
    } catch (e) {
      errors.push(`${row.id}: ${e instanceof Error ? e.message : 'warning failed'}`)
    }
  }

  return { warnings30d, warnings7d, errors }
}

/**
 * Anonymize and deactivate accounts inactive for 1+ year (privacy policy).
 */
export async function processInactiveAccounts(
  supabase: SupabaseClient
): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = []
  let processed = 0

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, inactivity_status, last_activity_at, updated_at')
    .eq('is_active', true)
    .is('inactivity_processed_at', null)
    .limit(500)

  if (error) {
    throw new Error(`Failed to list inactive users: ${error.message}`)
  }

  for (const row of (users || []) as InactivityUserRow[]) {
    const lastActivity = row.last_activity_at || row.updated_at
    if (daysSince(lastActivity) < INACTIVE_DAYS) continue
    if (await hasPendingDeletion(supabase, row.id)) continue
    if (await isPrivilegedAccount(supabase, row.id)) continue

    try {
      const userId = row.id
      const placeholderEmail = `inactive+${userId.replace(/-/g, '')}@inactive.domumatch.internal`

      await deleteVerificationStorageForUsers(supabase, [userId])
      await supabase.from('verifications').delete().eq('user_id', userId)

      await supabase.from('responses').update({ user_id: null }).eq('user_id', userId)

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('user_id', userId)
        .maybeSingle()

      if (profile?.profile_picture_url) {
        try {
          await supabase.storage.from('secure_profile_pics').remove([profile.profile_picture_url])
        } catch {
          // non-fatal
        }
      }

      await supabase
        .from('profiles')
        .update({
          first_name: 'Deleted',
          last_name: 'User',
          phone: null,
          bio: null,
          is_visible: false,
          profile_picture_url: null,
          avatar_id: null,
        })
        .eq('user_id', userId)

      await supabase
        .from('users')
        .update({
          email: placeholderEmail,
          is_active: false,
          inactivity_status: 'processed',
          inactivity_processed_at: new Date().toISOString(),
        })
        .eq('id', userId)

      processed++
      safeLogger.info('[Inactivity] Account anonymized for inactivity', { userId })
    } catch (e) {
      errors.push(`${row.id}: ${e instanceof Error ? e.message : 'process failed'}`)
      safeLogger.error('[Inactivity] Failed to process inactive account', { userId: row.id, e })
    }
  }

  return { processed, errors }
}

export async function runInactivityLifecycle(
  supabase: SupabaseClient
): Promise<InactivityCronResult> {
  const warnings = await runInactivityWarnings(supabase)
  const processing = await processInactiveAccounts(supabase)
  return {
    warnings30d: warnings.warnings30d,
    warnings7d: warnings.warnings7d,
    processed: processing.processed,
    errors: [...warnings.errors, ...processing.errors],
  }
}

/**
 * Record user activity and reset inactivity warnings when they return.
 */
export async function touchUserActivity(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const now = new Date().toISOString()
  await supabase
    .from('profiles')
    .update({ last_seen_at: now })
    .eq('user_id', userId)

  await supabase
    .from('users')
    .update({
      last_activity_at: now,
      inactivity_status: 'active',
      inactivity_warning_30d_at: null,
      inactivity_warning_7d_at: null,
    })
    .eq('id', userId)
    .is('inactivity_processed_at', null)
}
