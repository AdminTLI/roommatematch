'use client'

import { AdminEmptyState } from '@/components/admin/empty-state'
import { ADMIN_SECTION_GAP } from '@/lib/admin/ui'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CHART_MARGIN_DEFAULT,
  CHART_TICK,
  METRICS_CHART_COLORS,
  chartContainerClass,
  chartGridProps,
  chartTooltipProps,
  formatChartNumber,
} from '@/lib/admin/metrics-chart-styles'
import { MetricsChartCard } from './metrics-section'
import type { MetricsSnapshot } from './metrics-types'

type Props = {
  metrics: MetricsSnapshot
}

export function MetricsFootprintPanel({ metrics }: Props) {
  const hasData =
    (metrics.universityStats && metrics.universityStats.length > 0) ||
    (metrics.programStats && metrics.programStats.length > 0) ||
    (metrics.studyYearDistribution && metrics.studyYearDistribution.length > 0)

  if (!hasData) {
    return (
      <AdminEmptyState
        title="No footprint data yet"
        description="University, programme, and study-year distribution will appear once students complete onboarding."
      />
    )
  }

  return (
    <div className={ADMIN_SECTION_GAP}>
      {metrics.universityStats && metrics.universityStats.length > 0 ? (
        <MetricsChartCard title="Users by university" description="Total and verified users at each institution.">
          <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 360 }}>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={metrics.universityStats.slice(0, 10)}
                margin={{ ...CHART_MARGIN_DEFAULT, bottom: 64 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis
                  dataKey="university_name"
                  angle={-35}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={CHART_TICK}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} />
                <Tooltip {...chartTooltipProps} formatter={(value) => formatChartNumber(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total_users" fill="#334155" name="Total users" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified_users" fill="#0f766e" name="Verified users" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MetricsChartCard>
      ) : null}

      {metrics.programStats && metrics.programStats.length > 0 ? (
        <MetricsChartCard title="Top programmes" description="Programmes with the most students on the platform.">
          <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 360 }}>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart
                data={metrics.programStats.slice(0, 10)}
                layout="vertical"
                margin={{ ...CHART_MARGIN_DEFAULT, left: 16 }}
              >
                <CartesianGrid {...chartGridProps} />
                <XAxis type="number" tick={CHART_TICK} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="program_name"
                  type="category"
                  width={180}
                  tick={CHART_TICK}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip {...chartTooltipProps} formatter={(value) => formatChartNumber(value)} />
                <Bar dataKey="total_users" fill="#334155" name="Users" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MetricsChartCard>
      ) : null}

      {metrics.studyYearDistribution && metrics.studyYearDistribution.length > 0 ? (
        <MetricsChartCard title="Study year" description="How the cohort is spread across academic years.">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.studyYearDistribution} margin={CHART_MARGIN_DEFAULT}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="study_year" tick={CHART_TICK} tickLine={false} axisLine={false} />
                  <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} />
                  <Tooltip {...chartTooltipProps} formatter={(value) => formatChartNumber(value)} />
                  <Bar dataKey="count" fill="#334155" name="Students" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.studyYearDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { study_year, percent } = props as { study_year?: number; percent?: number }
                      return `Year ${study_year}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }}
                    outerRadius={110}
                    dataKey="count"
                  >
                    {metrics.studyYearDistribution.map((_, index) => (
                      <Cell key={`year-${index}`} fill={METRICS_CHART_COLORS[index % METRICS_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipProps} formatter={(value) => formatChartNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MetricsChartCard>
      ) : null}
    </div>
  )
}
