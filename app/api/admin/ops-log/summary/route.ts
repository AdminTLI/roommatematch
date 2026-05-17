import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import type { HealthStatus } from '@/lib/monitoring/system-health'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)

    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const admin = createAdminClient()

    const { data: events, error } = await admin
      .from('system_ops_events')
      .select('severity')
      .gte('created_at', since)

    if (error) {
      safeLogger.error('[Admin] Ops log summary error', error)
      return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
    }

    const counts = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    }

    for (const row of events ?? []) {
      const sev = row.severity as keyof typeof counts
      if (sev in counts) counts[sev] += 1
    }

    const { data: healthStates } = await admin.from('system_health_state').select('last_status')

    let overallHealth: HealthStatus = 'online'
    const statuses = (healthStates ?? []).map((r) => r.last_status as HealthStatus)
    if (statuses.includes('offline')) {
      overallHealth = 'offline'
    } else if (statuses.includes('degraded')) {
      overallHealth = 'degraded'
    }

    return NextResponse.json({
      last24h: counts,
      totalLast24h: events?.length ?? 0,
      overallHealth,
      externalLinks: {
        vercel: buildVercelLogsUrl(),
        sentry: buildSentryIssuesUrl(),
      },
    })
  } catch (error) {
    safeLogger.error('[Admin] Ops log summary error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildVercelLogsUrl(): string | null {
  const team = process.env.VERCEL_TEAM_SLUG
  const project = process.env.VERCEL_PROJECT_NAME ?? process.env.VERCEL_PROJECT_ID
  if (!team || !project) return null
  return `https://vercel.com/${team}/${project}/logs`
}

function buildSentryIssuesUrl(): string | null {
  const org = process.env.SENTRY_ORG_SLUG
  const project = process.env.SENTRY_PROJECT_SLUG
  if (!org || !project) return null
  return `https://${org}.sentry.io/issues/?project=${project}`
}
