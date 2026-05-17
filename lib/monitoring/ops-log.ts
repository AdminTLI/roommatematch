import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export type OpsEventSource =
  | 'health_check'
  | 'maintenance'
  | 'security'
  | 'admin_api'
  | 'cron'

export type OpsEventSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface LogOpsEventInput {
  source: OpsEventSource
  severity: OpsEventSeverity
  title: string
  message: string
  service?: string | null
  metadata?: Record<string, unknown>
}

export async function logOpsEvent(input: LogOpsEventInput): Promise<void> {
  try {
    const admin = await createAdminClient()
    const { error } = await admin.from('system_ops_events').insert({
      source: input.source,
      severity: input.severity,
      service: input.service ?? null,
      title: input.title,
      message: input.message,
      metadata: input.metadata ?? {},
    })

    if (error) {
      safeLogger.error('[OpsLog] Failed to insert event', { error, input })
    }
  } catch (error) {
    safeLogger.error('[OpsLog] Error logging event', { error, input })
  }
}

export async function logAdminApiFailure(
  route: string,
  status: number,
  errorMessage: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const severity: OpsEventSeverity =
    status >= 500 ? 'error' : status >= 400 ? 'warning' : 'info'

  await logOpsEvent({
    source: 'admin_api',
    severity,
    title: `Admin API ${status}`,
    message: `${route}: ${errorMessage}`,
    metadata: { route, status, ...metadata },
  })
}

export async function purgeOldOpsEvents(retentionDays = 90): Promise<number> {
  try {
    const admin = await createAdminClient()
    const { data, error } = await admin.rpc('purge_old_system_ops_events', {
      p_retention_days: retentionDays,
    })

    if (error) {
      safeLogger.error('[OpsLog] Failed to purge old events', { error })
      return 0
    }

    return typeof data === 'number' ? data : 0
  } catch (error) {
    safeLogger.error('[OpsLog] Error purging old events', { error })
    return 0
  }
}
