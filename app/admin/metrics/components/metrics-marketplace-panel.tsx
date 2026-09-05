'use client'

import { AdminStatCard } from '@/components/admin/stat-card'
import { ADMIN_SECTION_GAP } from '@/lib/admin/ui'
import {
  Area,
  AreaChart,
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
  formatChartNumberPair,
} from '@/lib/admin/metrics-chart-styles'
import { MarketplaceDynamicsCards } from './marketplace-dynamics-cards'
import { TrustAlgorithmCards } from './trust-algorithm-cards'
import { SuccessNpsCard } from './success-nps-card'
import { IntegrationMetricsCard } from './integration-metrics-card'
import { MetricsChartCard } from './metrics-section'
import type { ConversionFunnelData } from './metrics-types'

type Props = {
  analyticsQuery: string
  conversionFunnel: ConversionFunnelData | null
}

export function MetricsMarketplacePanel({ analyticsQuery, conversionFunnel }: Props) {
  const firstStepCount = conversionFunnel?.funnelSteps?.[0]?.count ?? 1

  return (
    <div className={ADMIN_SECTION_GAP}>
      <MarketplaceDynamicsCards analyticsQuery={analyticsQuery} />
      <TrustAlgorithmCards analyticsQuery={analyticsQuery} />
      <SuccessNpsCard analyticsQuery={analyticsQuery} />
      <IntegrationMetricsCard analyticsQuery={analyticsQuery} />

      {conversionFunnel ? (
        <MetricsChartCard title="Match funnel" description="Match volume, agreements, and weekly momentum.">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <AdminStatCard
                label="Total matches"
                value={(conversionFunnel.totalMatches ?? 0).toLocaleString()}
              />
              <AdminStatCard
                label="Matches (7 days)"
                value={(conversionFunnel.matchesLast7Days ?? 0).toLocaleString()}
              />
              <AdminStatCard
                label="Agreements"
                value={(conversionFunnel.totalAgreements ?? 0).toLocaleString()}
                hint={conversionFunnel.totalAgreements === 0 ? 'Tracking coming soon' : undefined}
              />
            </div>

            {conversionFunnel.funnelSteps && conversionFunnel.funnelSteps.length > 0 ? (
              <div className="space-y-4">
                {conversionFunnel.funnelSteps.map((step, index) => (
                  <div key={step.step} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{step.step}</span>
                      <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
                        {step.count.toLocaleString()}
                        {step.dropOffRate > 0 ? ` · ${step.dropOffRate.toFixed(1)}% drop-off` : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-gray-800 dark:bg-gray-200"
                        style={{ width: `${(step.count / firstStepCount) * 100}%` }}
                      />
                    </div>
                    {index < (conversionFunnel.funnelSteps?.length ?? 0) - 1 ? (
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        {step.dropOff.toLocaleString()} dropped off
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {conversionFunnel.weeklyConversion && conversionFunnel.weeklyConversion.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={conversionFunnel.weeklyConversion} margin={CHART_MARGIN_DEFAULT}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis
                      dataKey="week"
                      tick={CHART_TICK}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} />
                    <Tooltip
                      {...chartTooltipProps}
                      formatter={(value) => formatChartNumberPair(value, 'Matches')}
                      labelFormatter={(label) => `Week of ${new Date(label).toLocaleDateString()}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="matches"
                      stroke="#334155"
                      fill="#334155"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      name="Matches"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </MetricsChartCard>
      ) : null}
    </div>
  )
}
