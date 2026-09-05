'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminStatCard } from '@/components/admin/stat-card'
import { ADMIN_CARD_TITLE, ADMIN_SECTION_GAP } from '@/lib/admin/ui'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CHART_MARGIN_DEFAULT,
  CHART_TICK,
  chartContainerClass,
  chartGridProps,
  chartTooltipProps,
} from '@/lib/admin/metrics-chart-styles'
import { ExecutiveSummaryCards, type ExecutiveSummaryData } from './executive-summary-cards'
import { AtRiskMetricsCard, type AtRiskMetricsData } from './at-risk-metrics-card'
import { MediationIndexCard, type MediationIndexData } from './mediation-index-card'
import {
  InternationalIntegrationPulseCard,
  type HousingFrictionData,
} from './international-integration-pulse-card'
import { WellbeingIndexCard } from './wellbeing-index-card'
import type { WellnessAnalyticsData } from './metrics-types'

type Props = {
  executiveSummary: ExecutiveSummaryData | null
  executiveSummaryLoading: boolean
  atRiskMetrics: AtRiskMetricsData | null
  mediationIndex: MediationIndexData | null
  housingFriction: HousingFrictionData | null
  isPending: boolean
  wellness: WellnessAnalyticsData | null
  analyticsQuery: string
}

export function MetricsExecutivePanel({
  executiveSummary,
  executiveSummaryLoading,
  atRiskMetrics,
  mediationIndex,
  housingFriction,
  isPending,
  wellness,
  analyticsQuery,
}: Props) {
  const wellnessComparisonData =
    wellness?.bySurveyType.map((entry) => ({
      label: entry.label,
      foundHousingRate: Number(entry.foundHousingRate.toFixed(1)),
      reducedStressRate: Number(entry.reducedStressRate.toFixed(1)),
      foundWithMatchRate:
        entry.foundWithMatchRate !== null ? Number(entry.foundWithMatchRate.toFixed(1)) : 0,
    })) || []

  return (
    <div className={ADMIN_SECTION_GAP}>
      <ExecutiveSummaryCards
        data={executiveSummary ?? undefined}
        isPending={executiveSummaryLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AtRiskMetricsCard data={atRiskMetrics} isPending={isPending} />
        <MediationIndexCard data={mediationIndex} isPending={isPending} />
        <InternationalIntegrationPulseCard data={housingFriction} isPending={isPending} />
      </div>

      <WellbeingIndexCard analyticsQuery={analyticsQuery} />

      {wellness && wellness.overall.totalResponses > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className={ADMIN_CARD_TITLE}>Wellness outcomes</CardTitle>
            <CardDescription>Self-reported housing and stress outcomes at day 14 and day 30.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <AdminStatCard
                label="Responses"
                value={wellness.overall.totalResponses.toLocaleString()}
                hint={`${wellness.overall.day14Responses.toLocaleString()} at day 14 · ${wellness.overall.day30Responses.toLocaleString()} at day 30`}
              />
              <AdminStatCard
                label="Found housing"
                value={`${wellness.overall.foundHousingRate.toFixed(1)}%`}
              />
              <AdminStatCard
                label="Stress reduction"
                value={`${wellness.overall.reducedStressRate.toFixed(1)}%`}
              />
            </div>

            {wellnessComparisonData.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={wellnessComparisonData}
                    margin={{ ...CHART_MARGIN_DEFAULT, left: 8, bottom: 28 }}
                  >
                    <CartesianGrid {...chartGridProps} />
                    <XAxis dataKey="label" tick={CHART_TICK} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={CHART_TICK}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      {...chartTooltipProps}
                      formatter={(value, name) => {
                        const labels: Record<string, string> = {
                          foundHousingRate: 'Found housing',
                          foundWithMatchRate: 'Found housing with a match',
                          reducedStressRate: 'Reported reduced stress',
                        }
                        const n = Number(value)
                        const label = typeof name === 'string' ? labels[name] || name : String(name ?? '')
                        return [`${Number.isFinite(n) ? n.toFixed(1) : '0'}%`, label]
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
                    <Bar dataKey="foundHousingRate" fill="#0f766e" name="Found housing" radius={[4, 4, 0, 0]} />
                    <Bar
                      dataKey="foundWithMatchRate"
                      fill="#1d4ed8"
                      name="Found housing with a match"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="reducedStressRate"
                      fill="#7c3aed"
                      name="Reported reduced stress"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
