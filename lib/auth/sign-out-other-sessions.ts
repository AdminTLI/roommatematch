import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/** Revokes refresh tokens for all sessions except the current one (one-seat / anti–account-sharing). */
export async function signOutOtherSessions(
  client: Pick<SupabaseClient, 'auth'>
): Promise<void> {
  const { error } = await client.auth.signOut({ scope: 'others' })
  if (error) {
    safeLogger.warn('[auth] signOut(scope: others) failed', { message: error.message })
  }
}
