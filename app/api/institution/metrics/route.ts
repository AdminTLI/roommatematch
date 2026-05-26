import { NextRequest, NextResponse } from 'next/server'
import { requireInstitutionAdmin } from '@/lib/auth/institution'
import { computeInstitutionMetrics } from '@/lib/institution/metrics'

/**
 * GET /api/institution/metrics
 * Anonymized institution-scoped metrics + pseudonymous student journey rows.
 *
 * Query: period (all|7|30|90), limit, offset
 */
export async function GET(request: NextRequest) {
  const auth = await requireInstitutionAdmin(request)
  if (!auth.ok || !auth.institutionId) {
    return NextResponse.json(
      { error: auth.error || 'Institution admin access required' },
      { status: auth.status }
    )
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'all'
  const limit = parseInt(searchParams.get('limit') || '500', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  try {
    const metrics = await computeInstitutionMetrics(
      auth.institutionId,
      auth.institutionName ?? null,
      { period, limit, offset }
    )
    return NextResponse.json(metrics)
  } catch (err) {
    console.error('[Institution Metrics] Error', err)
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 })
  }
}
