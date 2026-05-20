/**
 * Performance baseline helpers for Realtime + compatibility hot paths.
 * Used by admin system-health and cron maintenance reporting.
 */

import { channelManager } from '@/lib/realtime/channel-manager'

export type PerformanceBaselineSnapshot = {
  capturedAt: string
  realtime: {
    totalChannels: number
    totalSubscriptions: number
    channels: Array<{
      table: string
      event: string
      filter: string
      subscriptionCount: number
      state: string
    }>
  }
  /** Documented Supabase pg_stat targets for before/after comparison */
  queryTargets: {
    realtimeListChanges: string
    computeCompatibilityScore: string
    suggestionsListApi: string
  }
}

const QUERY_TARGETS = {
  realtimeListChanges: 'realtime.list_changes',
  computeCompatibilityScore: 'compute_compatibility_score',
  suggestionsListApi: '/api/match/suggestions/my',
} as const

export function capturePerformanceBaseline(): PerformanceBaselineSnapshot {
  const stats = channelManager.getStats()
  return {
    capturedAt: new Date().toISOString(),
    realtime: {
      totalChannels: stats.totalChannels,
      totalSubscriptions: stats.totalSubscriptions,
      channels: stats.channels.map((ch) => ({
        table: ch.table,
        event: ch.event,
        filter: ch.filter,
        subscriptionCount: ch.subscriptionCount,
        state: ch.state,
      })),
    },
    queryTargets: { ...QUERY_TARGETS },
  }
}

/** Log baseline in development or when PERF_BASELINE_LOG=1 */
export function logPerformanceBaseline(context: string): PerformanceBaselineSnapshot {
  const snapshot = capturePerformanceBaseline()
  if (
    process.env.PERF_BASELINE_LOG === '1' ||
    process.env.NODE_ENV === 'development'
  ) {
    console.info(`[PerformanceBaseline] ${context}`, JSON.stringify(snapshot))
  }
  return snapshot
}
