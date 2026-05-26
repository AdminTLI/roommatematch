import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/**
 * Promote a pending admin_role_assignments row after the auth user exists.
 * Safe to call after inviteUserByEmail; idempotent when already active.
 */
export async function promotePendingRoleAssignment(
  admin: SupabaseClient,
  userId: string,
  email: string
): Promise<void> {
  const { error } = await admin.rpc('apply_pending_role_assignments_for_user_id', {
    p_user_id: userId,
    p_email: email,
  })

  if (error) {
    safeLogger.warn('[Admin] Failed to promote pending role assignment via RPC', {
      error,
      userId,
      email,
    })
  }
}
