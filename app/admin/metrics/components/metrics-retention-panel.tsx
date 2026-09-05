'use client'

import { AdminStatCard } from '@/components/admin/stat-card'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { ADMIN_SECTION_GAP, ADMIN_TABLE_CELL } from '@/lib/admin/ui'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
  formatChartNumber,
} from '@/lib/admin/metrics-chart-styles'
import { MetricsChartCard } from './metrics-section'
import type { CohortRetentionData, CoverageData } from './metrics-types'

type Props = {
  coverage: CoverageData | null
  cohortRetention: CohortRetentionData | null
}

export function MetricsRetentionPanel({ coverage, cohortRetention }: Props) {
  const hasRetention = Boolean(cohortRetention && cohortRetention.cohorts.length > 0)
  const hasCoverage = Boolean(coverage)

  if (!hasRetention && !hasCoverage) {
    return (
      <AdminEmptyState
        title="No retention data yet"
        description="Cohort retention and programme coverage will appear as students return to the platform."
      />
    )
  }

  const coverageRate =
    coverage && coverage.totalInstitutions > 0
      ? ((coverage.completeInstitutions / coverage.totalInstitutions) * 100).toFixed(1)
      : '0'

  return (
    <div className={ADMIN_SECTION_GAP}>
      {coverage ? (
        <MetricsChartCard title="Programme coverage" description="How completely institutions have programme data filled in.">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <AdminStatCard label="Complete" value={(coverage.completeInstitutions ?? 0).toLocaleString()} />
              <AdminStatCard label="Incomplete" value={(coverage.incompleteInstitutions ?? 0).toLocaleString()} />
              <AdminStatCard label="Missing" value={(coverage.missingInstitutions ?? 0).toLocaleString()} />
              <AdminStatCard label="Programmes" value={(coverage.totalProgrammes ?? 0).toLocaleString()} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Overall coverage</span>
                <span className="font-medium tabular-nums">{coverageRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-gray-800 dark:bg-gray-200"
                  style={{ width: `${coverageRate}%` }}
                />
              </div>
            </div>
            {coverage.institutions && coverage.institutions.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={coverage.institutions.slice(0, 15)}
                    margin={{ ...CHART_MARGIN_DEFAULT, bottom: 64 }}
                  >
                    <CartesianGrid {...chartGridProps} />
                    <XAxis
                      dataKey="label"
                      angle={-35}
                      textAnchor="end"
                      height={80}
                      tick={CHART_TICK}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} />
                    <Tooltip {...chartTooltipProps} formatter={(value) => formatChartNumber(value)} />
                    <Bar dataKey="totalProgrammes" fill="#334155" name="Programmes" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </MetricsChartCard>
      ) : null}

      {hasRetention && cohortRetention ? (
        <MetricsChartCard title="Cohort retention" description="Day 1, 7, 30, and 90 retention by signup cohort.">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <AdminStatCard label="Day 1" value={`${cohortRetention.averageRetention.day1 ?? 0}%`} />
              <AdminStatCard label="Day 7" value={`${cohortRetention.averageRetention.day7 ?? 0}%`} />
              <AdminStatCard label="Day 30" value={`${cohortRetention.averageRetention.day30 ?? 0}%`} />
              <AdminStatCard label="Day 90" value={`${cohortRetention.averageRetention.day90 ?? 0}%`} />
            </div>
            <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 320 }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={cohortRetention.cohorts} margin={{ ...CHART_MARGIN_DEFAULT, bottom: 48 }}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    dataKey="cohortDate"
                    tick={CHART_TICK}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }
                    angle={-35}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    {...chartTooltipProps}
                    formatter={(value) =>
                      typeof value === 'number' ? [`${value}%`, 'Retention'] : ['', 'Retention']
                    }
                    labelFormatter={(label) => `Cohort: ${new Date(label).toLocaleDateString()}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="day1Retention" stroke="#334155" strokeWidth={2} dot={{ r: 3 }} name="Day 1" />
                  <Line type="monotone" dataKey="day7Retention" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} name="Day 7" />
                  <Line type="monotone" dataKey="day30Retention" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3 }} name="Day 30" />
                  <Line type="monotone" dataKey="day90Retention" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} name="Day 90" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className={`${ADMIN_TABLE_CELL} text-left font-medium`}>Cohort</th>
                    <th className={`${ADMIN_TABLE_CELL} text-right font-medium`}>Size</th>
                    <th className={`${ADMIN_TABLE_CELL} text-right font-medium`}>Day 1</th>
                    <th className={`${ADMIN_TABLE_CELL} text-right font-medium`}>Day 7</th>
                    <th className={`${ADMIN_TABLE_CELL} text-right font-medium`}>Day 30</th>
                    <th className={`${ADMIN_TABLE_CELL} text-right font-medium`}>Day 90</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortRetention.cohorts.map((cohort) => (
                    <tr key={cohort.cohortDate} className="border-b border-gray-100 dark:border-slate-800">
                      <td className={ADMIN_TABLE_CELL}>{new Date(cohort.cohortDate).toLocaleDateString()}</td>
                      <td className={`${ADMIN_TABLE_CELL} text-right tabular-nums`}>{cohort.cohortSize}</td>
                      <td className={`${ADMIN_TABLE_CELL} text-right tabular-nums`}>{cohort.day1Retention}%</td>
                      <td className={`${ADMIN_TABLE_CELL} text-right tabular-nums`}>{cohort.day7Retention}%</td>
                      <td className={`${ADMIN_TABLE_CELL} text-right tabular-nums`}>{cohort.day30Retention}%</td>
                      <td className={`${ADMIN_TABLE_CELL} text-right tabular-nums`}>{cohort.day90Retention}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </MetricsChartCard>
      ) : null}
    </div>
  )
}
