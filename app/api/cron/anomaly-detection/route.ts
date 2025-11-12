import { NextResponse } from 'next/server'
import { detectAllAnomalies } from '@/lib/analytics/anomaly-detection'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/anomaly-detection
 * Cron job to detect anomalies in verification, matching, and job processing
 * Runs hourly to detect anomalies in real-time
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      safeLogger.warn('[Cron] Unauthorized anomaly detection request attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    safeLogger.info('[Cron] Starting anomaly detection')

    // Detect all anomalies (last 24 hours)
    const anomalies = await detectAllAnomalies(24)

    const criticalCount = anomalies.filter(a => a.severity === 'critical').length
    const highCount = anomalies.filter(a => a.severity === 'high').length
    const mediumCount = anomalies.filter(a => a.severity === 'medium').length
    const lowCount = anomalies.filter(a => a.severity === 'low').length

    safeLogger.info('[Cron] Anomaly detection complete', {
      total: anomalies.length,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount
    })

    return NextResponse.json({
      success: true,
      runId: `anomaly_detection_${Date.now()}`,
      results: {
        total: anomalies.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        anomalies: anomalies.map(a => ({
          type: a.anomalyType,
          severity: a.severity,
          description: a.description,
          detectedAt: a.detectedAt
        }))
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Cron] Anomaly detection failed', { error })
    return NextResponse.json(
      { error: 'Anomaly detection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

