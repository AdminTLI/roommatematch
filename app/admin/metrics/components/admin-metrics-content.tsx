'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, Lock } from 'lucide-react'
import { showErrorToast } from '@/lib/toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { ADMIN_HELPER_TEXT, ADMIN_PAGE_STACK } from '@/lib/admin/ui'
import {
  buildAdminAnalyticsQuery,
  type AdminAnalyticsFilters,
} from '@/lib/admin/analytics-query'
import {
  parseMetricsTab,
  getAnalyticsEndpointsForTab,
  tabIsQuestionnaire,
  tabNeedsBaseMetrics,
} from '@/lib/admin/metrics-tabs'
import { AnswerDistributionClient } from '@/app/admin/analytics/AnswerDistributionClient'
import { MetricsToolbar } from './metrics-toolbar'
import { MetricsOverviewPanel } from './metrics-overview-panel'
import { MetricsExecutivePanel } from './metrics-executive-panel'
import { MetricsEngagementPanel } from './metrics-engagement-panel'
import { MetricsMarketplacePanel } from './metrics-marketplace-panel'
import { MetricsFootprintPanel } from './metrics-footprint-panel'
import { MetricsRetentionPanel } from './metrics-retention-panel'
import type { ExecutiveSummaryData } from './executive-summary-cards'
import type { AtRiskMetricsData } from './at-risk-metrics-card'
import type { MediationIndexData } from './mediation-index-card'
import type { HousingFrictionData } from './international-integration-pulse-card'
import type {
  CohortRetentionData,
  ConversionFunnelData,
  CoverageData,
  GeographicData,
  MetricsSnapshot,
  RealtimeData,
  SecurityData,
  TrafficSourcesData,
  UserFlowsData,
  UserLifecycleData,
  WellnessAnalyticsData,
} from './metrics-types'

type AdminMetricsContentProps = {
  isPlatformSuper: boolean
  initialUniversityId: string | null
  initialUniversityName?: string | null
}

export function AdminMetricsContent({
  isPlatformSuper,
  initialUniversityId,
  initialUniversityName = null,
}: AdminMetricsContentProps) {
  const searchParams = useSearchParams()
  const activeTab = parseMetricsTab(searchParams.get('tab'))
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(
    isPlatformSuper ? null : initialUniversityId
  )
  const [universityOptions, setUniversityOptions] = useState<Array<{ id: string; name: string }>>([])
  const [filters, setFilters] = useState<AdminAnalyticsFilters>({
    cohort: 'all',
    origin: 'all',
    housing: 'all',
  })

  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(() => !isPlatformSuper)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelData | null>(null)
  const [userLifecycle, setUserLifecycle] = useState<UserLifecycleData | null>(null)
  const [security, setSecurity] = useState<SecurityData | null>(null)
  const [coverage, setCoverage] = useState<CoverageData | null>(null)
  const [cohortRetention, setCohortRetention] = useState<CohortRetentionData | null>(null)
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [trafficSources, setTrafficSources] = useState<TrafficSourcesData | null>(null)
  const [userFlows, setUserFlows] = useState<UserFlowsData | null>(null)
  const [geographic, setGeographic] = useState<GeographicData | null>(null)
  const [wellness, setWellness] = useState<WellnessAnalyticsData | null>(null)
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummaryData | null>(null)
  const [executiveSummaryLoading, setExecutiveSummaryLoading] = useState(false)
  const [atRiskMetrics, setAtRiskMetrics] = useState<AtRiskMetricsData | null>(null)
  const [mediationIndex, setMediationIndex] = useState<MediationIndexData | null>(null)
  const [housingFriction, setHousingFriction] = useState<HousingFrictionData | null>(null)

  const tenantUniversityId = selectedUniversityId || initialUniversityId
  const analyticsQuery = useMemo(() => {
    if (!tenantUniversityId) return ''
    return buildAdminAnalyticsQuery(tenantUniversityId, filters, isPlatformSuper)
  }, [tenantUniversityId, filters, isPlatformSuper])

  const loadMetrics = useCallback(
    async (isRefresh = false) => {
      if (tabIsQuestionnaire(activeTab)) {
        setIsLoading(false)
        return
      }
      if (!tenantUniversityId) return
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      if (activeTab === 'executive') {
        setExecutiveSummaryLoading(true)
      }
      try {
        const q = analyticsQuery
        const endpoints = getAnalyticsEndpointsForTab(activeTab)
        const fetchJson = async (suffix: string) => {
          const res = await fetch(`/api/admin/analytics${suffix}${q}`)
          if (!res.ok) return null
          return res.json()
        }

        const results = await Promise.all(endpoints.map((suffix) => fetchJson(suffix)))
        const bySuffix = Object.fromEntries(endpoints.map((suffix, i) => [suffix || 'base', results[i]]))

        if (bySuffix.base) {
          setMetrics(bySuffix.base)
        } else if (endpoints.includes('')) {
          showErrorToast('Failed to load metrics')
          setMetrics(null)
        }

        if (bySuffix['/conversion-funnel']) setConversionFunnel(bySuffix['/conversion-funnel'])
        if (bySuffix['/user-lifecycle']) setUserLifecycle(bySuffix['/user-lifecycle'])
        if (bySuffix['/security']) setSecurity(bySuffix['/security'])
        if (bySuffix['/coverage']) setCoverage(bySuffix['/coverage'])
        if (bySuffix['/cohort-retention']) setCohortRetention(bySuffix['/cohort-retention'])
        if (bySuffix['/realtime']) setRealtime(bySuffix['/realtime'])
        if (bySuffix['/traffic-sources']) setTrafficSources(bySuffix['/traffic-sources'])
        if (bySuffix['/user-flows']) setUserFlows(bySuffix['/user-flows'])
        if (bySuffix['/geographic']) setGeographic(bySuffix['/geographic'])
        if (bySuffix['/wellness']) setWellness(bySuffix['/wellness'])
        if (bySuffix['/executive-summary']) {
          setExecutiveSummary(bySuffix['/executive-summary'] as ExecutiveSummaryData)
        } else if (activeTab === 'executive') {
          setExecutiveSummary(null)
        }
        if (bySuffix['/at-risk']) setAtRiskMetrics(bySuffix['/at-risk'] as AtRiskMetricsData)
        if (bySuffix['/mediation-index']) setMediationIndex(bySuffix['/mediation-index'] as MediationIndexData)
        if (bySuffix['/housing-friction']) setHousingFriction(bySuffix['/housing-friction'] as HousingFrictionData)
      } catch (error) {
        console.error('Failed to load metrics:', error)
        showErrorToast('Failed to load metrics')
        if (tabNeedsBaseMetrics(activeTab)) {
          setMetrics(null)
        }
        if (activeTab === 'executive') {
          setExecutiveSummary(null)
          setAtRiskMetrics(null)
          setMediationIndex(null)
          setHousingFriction(null)
        }
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
        setExecutiveSummaryLoading(false)
      }
    },
    [analyticsQuery, tenantUniversityId, activeTab]
  )

  useEffect(() => {
    if (isPlatformSuper && !tenantUniversityId) {
      setMetrics(null)
      setIsLoading(false)
    }
  }, [isPlatformSuper, tenantUniversityId])

  useEffect(() => {
    if (!isPlatformSuper) return
    const loadUnis = async () => {
      try {
        const res = await fetch('/api/admin/universities-for-picker')
        if (!res.ok) return
        const body = await res.json()
        setUniversityOptions(body.universities || [])
      } catch {
        /* ignore */
      }
    }
    loadUnis()
  }, [isPlatformSuper])

  useEffect(() => {
    if (tabIsQuestionnaire(activeTab)) {
      setIsLoading(false)
      return
    }
    if (!tenantUniversityId) {
      setIsLoading(false)
      return
    }
    void loadMetrics()
  }, [tenantUniversityId, analyticsQuery, loadMetrics, activeTab])

  useEffect(() => {
    if (!tenantUniversityId || activeTab !== 'engagement') return
    const interval = setInterval(() => {
      fetch(`/api/admin/analytics/realtime${analyticsQuery}`)
        .then((res) => res.json())
        .then((data) => setRealtime(data))
        .catch((err) => console.error('Failed to refresh realtime data:', err))
    }, 30000)

    return () => clearInterval(interval)
  }, [analyticsQuery, tenantUniversityId, activeTab])

  if (tabIsQuestionnaire(activeTab)) {
    if (!isPlatformSuper) {
      return (
        <div className="mx-auto max-w-lg space-y-3 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">Super admin only</h2>
          <p className={ADMIN_HELPER_TEXT}>
            Questionnaire answer distributions are restricted to platform super admins.
          </p>
        </div>
      )
    }
    return <AnswerDistributionClient />
  }

  const toolbar = (
    <MetricsToolbar
      isPlatformSuper={isPlatformSuper}
      universityOptions={universityOptions}
      selectedUniversityId={selectedUniversityId}
      onUniversityChange={setSelectedUniversityId}
      lockedUniversityName={initialUniversityName}
      filters={filters}
      onFiltersChange={setFilters}
      onRefresh={() => loadMetrics(true)}
      isRefreshing={isRefreshing}
      canRefresh={Boolean(tenantUniversityId)}
    />
  )

  if (!tenantUniversityId) {
    return (
      <div className={ADMIN_PAGE_STACK}>
        {toolbar}
        <Alert>
          <AlertTitle>Select an institution</AlertTitle>
          <AlertDescription>
            Pick a university to load cohort KPIs. You can change institutions at any time from the selector above.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const renderTab = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 py-12">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className={ADMIN_HELPER_TEXT}>Loading…</span>
        </div>
      )
    }

    switch (activeTab) {
      case 'executive':
        return (
          <MetricsExecutivePanel
            executiveSummary={executiveSummary}
            executiveSummaryLoading={executiveSummaryLoading}
            atRiskMetrics={atRiskMetrics}
            mediationIndex={mediationIndex}
            housingFriction={housingFriction}
            isPending={isRefreshing}
            wellness={wellness}
            analyticsQuery={analyticsQuery}
          />
        )
      case 'engagement':
        return (
          <MetricsEngagementPanel
            realtime={realtime}
            trafficSources={trafficSources}
            userFlows={userFlows}
            geographic={geographic}
            userLifecycle={userLifecycle}
            security={security}
          />
        )
      case 'marketplace':
        return (
          <MetricsMarketplacePanel
            analyticsQuery={analyticsQuery}
            conversionFunnel={conversionFunnel}
          />
        )
      case 'retention':
        return (
          <MetricsRetentionPanel coverage={coverage} cohortRetention={cohortRetention} />
        )
      case 'footprint':
        if (!metrics) {
          return (
            <AdminEmptyState
              title="Couldn’t load footprint"
              description="Refresh the page or pick another institution."
            />
          )
        }
        return <MetricsFootprintPanel metrics={metrics} />
      default:
        if (!metrics) {
          return (
            <AdminEmptyState
              title="Couldn’t load metrics"
              description="Refresh the page or pick another institution."
            />
          )
        }
        return <MetricsOverviewPanel metrics={metrics} />
    }
  }

  return (
    <div className={ADMIN_PAGE_STACK}>
      {toolbar}
      {renderTab()}
    </div>
  )
}
