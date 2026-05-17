import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logOpsEvent } from '@/lib/monitoring/ops-log'
import { evaluateHealthAlerts } from '@/lib/monitoring/health-alerts'
import { safeLogger } from '@/lib/utils/logger'

export type HealthServiceKey =
  | 'database'
  | 'authentication'
  | 'matching_engine'
  | 'file_storage'

export type HealthStatus = 'online' | 'degraded' | 'offline'

export interface HealthCheckResult {
  status: HealthStatus
  responseTime: number
  statusReason: string
  error?: string
  lastCheck: string
  details?: Record<string, unknown>
  consecutiveSlowCount?: number
  consecutiveHealthyCount?: number
  latencyThresholdMs?: number
}

interface RawProbeResult {
  offline: boolean
  slow: boolean
  responseTime: number
  error?: string
  details?: Record<string, unknown>
  slowReason?: string
}

interface HealthStateRow {
  service: string
  last_status: HealthStatus
  consecutive_slow_count: number
  consecutive_healthy_count: number
  last_response_time_ms: number | null
  last_error: string | null
  status_reason: string | null
  first_non_green_at: string | null
  last_alert_sent_at: string | null
  last_ops_log_at: string | null
}

const SLOW_CHECKS_REQUIRED = 2
const HEALTHY_CHECKS_REQUIRED = 2
const OPS_LOG_INTERVAL_MS = 15 * 60 * 1000

const SERVICE_THRESHOLDS: Record<HealthServiceKey, number> = {
  database: 1500,
  authentication: 800,
  matching_engine: 1000,
  file_storage: 2000,
}

const SERVICE_LABELS: Record<HealthServiceKey, string> = {
  database: 'Database',
  authentication: 'Admin session / Auth API',
  matching_engine: 'Matching engine',
  file_storage: 'File storage',
}

async function probeDatabase(): Promise<RawProbeResult> {
  const startTime = Date.now()
  try {
    const adminClient = createAdminClient()
    const { error, data } = await adminClient.from('users').select('id').limit(1)
    const responseTime = Date.now() - startTime

    if (error) {
      return {
        offline: true,
        slow: false,
        responseTime,
        error: error.message,
        details: { querySuccessful: false },
      }
    }

    const threshold = SERVICE_THRESHOLDS.database
    const slow = responseTime > threshold
    return {
      offline: false,
      slow,
      responseTime,
      details: { querySuccessful: true, recordCount: data?.length ?? 0 },
      slowReason: slow
        ? `Slow response (${responseTime}ms; threshold ${threshold}ms)`
        : undefined,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database connection failed'
    return {
      offline: true,
      slow: false,
      responseTime: Date.now() - startTime,
      error: message,
    }
  }
}

async function probeAuthentication(): Promise<RawProbeResult> {
  const startTime = Date.now()
  try {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.getUser()
    const responseTime = Date.now() - startTime

    if (error) {
      return {
        offline: true,
        slow: false,
        responseTime,
        error: error.message,
        details: { authServiceAvailable: false },
      }
    }

    const threshold = SERVICE_THRESHOLDS.authentication
    const slow = responseTime > threshold
    return {
      offline: false,
      slow,
      responseTime,
      details: {
        authServiceAvailable: true,
        userAuthenticated: !!data.user,
      },
      slowReason: slow
        ? `Slow response (${responseTime}ms; threshold ${threshold}ms)`
        : undefined,
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Authentication service unavailable'
    return {
      offline: true,
      slow: false,
      responseTime: Date.now() - startTime,
      error: message,
    }
  }
}

async function probeMatchingEngine(): Promise<RawProbeResult> {
  const startTime = Date.now()
  try {
    const adminClient = createAdminClient()
    const { error, data } = await adminClient
      .from('match_suggestions')
      .select('id, status')
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      return {
        offline: true,
        slow: false,
        responseTime,
        error: error.message,
        details: { suggestionsTableAccessible: false },
      }
    }

    const { error: recordsError } = await adminClient
      .from('match_records')
      .select('id')
      .limit(1)

    const threshold = SERVICE_THRESHOLDS.matching_engine
    const slow = responseTime > threshold || !!recordsError
    let slowReason: string | undefined
    if (recordsError) {
      slowReason = `match_records query failed: ${recordsError.message}`
    } else if (responseTime > threshold) {
      slowReason = `Slow response (${responseTime}ms; threshold ${threshold}ms)`
    }

    return {
      offline: false,
      slow,
      responseTime,
      details: {
        suggestionsTableAccessible: true,
        recordsTableAccessible: !recordsError,
        matchCount: data?.length ?? 0,
      },
      slowReason,
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Matching engine unavailable'
    return {
      offline: true,
      slow: false,
      responseTime: Date.now() - startTime,
      error: message,
    }
  }
}

async function probeFileStorage(): Promise<RawProbeResult> {
  const startTime = Date.now()
  try {
    const adminClient = createAdminClient()
    const { data: buckets, error } = await adminClient.storage.listBuckets()
    const responseTime = Date.now() - startTime

    if (error) {
      return {
        offline: true,
        slow: false,
        responseTime,
        error: error.message,
      }
    }

    const verificationBucket = buckets?.find((b) => b.id === 'verification-documents')
    let bucketAccessible = false
    if (verificationBucket) {
      try {
        const { error: listError } = await adminClient.storage
          .from('verification-documents')
          .list('', { limit: 1 })
        bucketAccessible = !listError
      } catch {
        bucketAccessible = false
      }
    }

    const threshold = SERVICE_THRESHOLDS.file_storage
    const slow = responseTime > threshold || (!!verificationBucket && !bucketAccessible)
    let slowReason: string | undefined
    if (!bucketAccessible && verificationBucket) {
      slowReason = 'verification-documents bucket is not accessible'
    } else if (responseTime > threshold) {
      slowReason = `Slow response (${responseTime}ms; threshold ${threshold}ms)`
    }

    return {
      offline: false,
      slow,
      responseTime,
      details: {
        bucketsAvailable: buckets?.length ?? 0,
        verificationBucketExists: !!verificationBucket,
        verificationBucketAccessible: bucketAccessible,
      },
      slowReason,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'File storage unavailable'
    return {
      offline: true,
      slow: false,
      responseTime: Date.now() - startTime,
      error: message,
    }
  }
}

const PROBES: Record<HealthServiceKey, () => Promise<RawProbeResult>> = {
  database: probeDatabase,
  authentication: probeAuthentication,
  matching_engine: probeMatchingEngine,
  file_storage: probeFileStorage,
}

function severityForStatus(status: HealthStatus): 'info' | 'warning' | 'error' {
  if (status === 'offline') return 'error'
  if (status === 'degraded') return 'warning'
  return 'info'
}

async function getHealthState(service: HealthServiceKey): Promise<HealthStateRow | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('system_health_state')
    .select('*')
    .eq('service', service)
    .maybeSingle()

  if (error) {
    safeLogger.error('[SystemHealth] Failed to read state', { service, error })
    return null
  }

  return data as HealthStateRow | null
}

async function applyHysteresis(
  service: HealthServiceKey,
  probe: RawProbeResult
): Promise<HealthCheckResult> {
  const threshold = SERVICE_THRESHOLDS[service]
  const label = SERVICE_LABELS[service]
  const now = new Date().toISOString()
  const prior = await getHealthState(service)

  let consecutiveSlow = prior?.consecutive_slow_count ?? 0
  let consecutiveHealthy = prior?.consecutive_healthy_count ?? 0
  let previousStatus: HealthStatus = prior?.last_status ?? 'online'
  let firstNonGreenAt = prior?.first_non_green_at ?? null
  let lastOpsLogAt = prior?.last_ops_log_at ?? null
  let lastAlertSentAt = prior?.last_alert_sent_at ?? null

  let rawStatus: HealthStatus
  let statusReason: string

  if (probe.offline) {
    rawStatus = 'offline'
    consecutiveSlow = 0
    consecutiveHealthy = 0
    statusReason = probe.error
      ? `${label} unreachable: ${probe.error}`
      : `${label} is offline`
  } else if (probe.slow) {
    consecutiveSlow += 1
    consecutiveHealthy = 0
    if (consecutiveSlow >= SLOW_CHECKS_REQUIRED) {
      rawStatus = 'degraded'
      statusReason =
        probe.slowReason ??
        `Slow response (${probe.responseTime}ms; threshold ${threshold}ms)`
    } else {
      rawStatus = previousStatus === 'offline' ? 'degraded' : 'online'
      statusReason = `${probe.slowReason ?? `Elevated latency (${probe.responseTime}ms)`}; ${consecutiveSlow}/${SLOW_CHECKS_REQUIRED} slow checks before degraded`
    }
  } else {
    consecutiveHealthy += 1
    consecutiveSlow = 0
    if (previousStatus !== 'online' && consecutiveHealthy < HEALTHY_CHECKS_REQUIRED) {
      rawStatus = previousStatus
      statusReason = `Recovering (${consecutiveHealthy}/${HEALTHY_CHECKS_REQUIRED} healthy checks); last: ${probe.responseTime}ms`
    } else {
      rawStatus = 'online'
      statusReason = `Operating normally (${probe.responseTime}ms)`
    }
  }

  const statusChanged = rawStatus !== previousStatus

  if (rawStatus !== 'online') {
    if (!firstNonGreenAt || statusChanged) {
      firstNonGreenAt = now
    }
  } else {
    firstNonGreenAt = null
    lastAlertSentAt = null
  }

  const shouldLogOps =
    statusChanged ||
    (rawStatus !== 'online' &&
      (!lastOpsLogAt ||
        Date.now() - new Date(lastOpsLogAt).getTime() >= OPS_LOG_INTERVAL_MS))

  if (shouldLogOps) {
    const severity = severityForStatus(rawStatus)
    await logOpsEvent({
      source: 'health_check',
      severity,
      service,
      title: `${label} ${statusChanged ? 'status changed' : 'still impaired'}`,
      message: statusChanged
        ? `${label}: ${previousStatus} → ${rawStatus}. ${statusReason}`
        : `${label} remains ${rawStatus}. ${statusReason}`,
      metadata: {
        previousStatus,
        status: rawStatus,
        responseTimeMs: probe.responseTime,
        thresholdMs: threshold,
        consecutiveSlowCount: consecutiveSlow,
        consecutiveHealthyCount: consecutiveHealthy,
        details: probe.details,
        error: probe.error,
      },
    })
    lastOpsLogAt = now
  }

  const admin = createAdminClient()
  const { error: updateError } = await admin
    .from('system_health_state')
    .update({
      last_status: rawStatus,
      consecutive_slow_count: consecutiveSlow,
      consecutive_healthy_count: consecutiveHealthy,
      last_response_time_ms: probe.responseTime,
      last_error: probe.error ?? null,
      status_reason: statusReason,
      first_non_green_at: firstNonGreenAt,
      last_alert_sent_at: lastAlertSentAt,
      last_ops_log_at: lastOpsLogAt,
      updated_at: now,
    })
    .eq('service', service)

  if (updateError) {
    safeLogger.error('[SystemHealth] Failed to update state', { service, updateError })
  }

  await evaluateHealthAlerts({
    service,
    label,
    status: rawStatus,
    statusReason,
    firstNonGreenAt,
    lastAlertSentAt,
  })

  return {
    status: rawStatus,
    responseTime: probe.responseTime,
    statusReason,
    error: probe.error,
    lastCheck: now,
    details: probe.details,
    consecutiveSlowCount: consecutiveSlow,
    consecutiveHealthyCount: consecutiveHealthy,
    latencyThresholdMs: threshold,
  }
}

export async function runHealthCheck(service: HealthServiceKey): Promise<HealthCheckResult> {
  const probe = await PROBES[service]()
  return applyHysteresis(service, probe)
}

export interface SystemHealthReport {
  overall: {
    status: HealthStatus
    lastCheck: string
    summary: {
      online: number
      degraded: number
      offline: number
      total: number
    }
  }
  services: {
    database: HealthCheckResult
    authentication: HealthCheckResult
    matchingEngine: HealthCheckResult
    fileStorage: HealthCheckResult
  }
}

export async function runAllHealthChecks(): Promise<SystemHealthReport> {
  const [database, authentication, matchingEngine, fileStorage] = await Promise.all([
    runHealthCheck('database'),
    runHealthCheck('authentication'),
    runHealthCheck('matching_engine'),
    runHealthCheck('file_storage'),
  ])

  const allChecks = [database, authentication, matchingEngine, fileStorage]
  const onlineCount = allChecks.filter((c) => c.status === 'online').length
  const degradedCount = allChecks.filter((c) => c.status === 'degraded').length
  const offlineCount = allChecks.filter((c) => c.status === 'offline').length

  let overallStatus: HealthStatus = 'online'
  if (offlineCount > 0) {
    overallStatus = 'offline'
  } else if (degradedCount > 0) {
    overallStatus = 'degraded'
  }

  return {
    overall: {
      status: overallStatus,
      lastCheck: new Date().toISOString(),
      summary: {
        online: onlineCount,
        degraded: degradedCount,
        offline: offlineCount,
        total: allChecks.length,
      },
    },
    services: {
      database,
      authentication,
      matchingEngine,
      fileStorage,
    },
  }
}

export { SERVICE_LABELS, SERVICE_THRESHOLDS }
