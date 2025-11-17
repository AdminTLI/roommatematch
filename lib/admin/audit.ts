import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

/**
 * Log an admin action to the audit table
 */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  entityType: string | null,
  entityId: string | null,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const admin = await createAdminClient()
    
    const { error } = await admin
      .from('admin_actions')
      .insert({
        admin_user_id: adminUserId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata
      })

    if (error) {
      safeLogger.error('[Admin Audit] Failed to log action', {
        error,
        adminUserId,
        action,
        entityType,
        entityId
      })
    } else {
      safeLogger.info('[Admin Audit] Action logged', {
        adminUserId,
        action,
        entityType,
        entityId
      })
    }
  } catch (error) {
    safeLogger.error('[Admin Audit] Error logging action', error)
  }
}






