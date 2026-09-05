'use client'

import { Badge } from '@/components/ui/badge'
import { AdminStatCard } from '@/components/admin/stat-card'
import { ADMIN_SECTION_GAP } from '@/lib/admin/ui'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
import { MetricsChartCard, MetricsListRow, MetricsSection } from './metrics-section'
import type {
  GeographicData,
  RealtimeData,
  SecurityData,
  TrafficSourcesData,
  UserFlowsData,
  UserLifecycleData,
} from './metrics-types'

type Props = {
  realtime: RealtimeData | null
  trafficSources: TrafficSourcesData | null
  userFlows: UserFlowsData | null
  geographic: GeographicData | null
  userLifecycle: UserLifecycleData | null
  security: SecurityData | null
}

export function MetricsEngagementPanel({
  realtime,
  trafficSources,
  userFlows,
  geographic,
  userLifecycle,
  security,
}: Props) {
  return (
    <div className={ADMIN_SECTION_GAP}>
      <MetricsSection title="Live usage">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <AdminStatCard
            label="Active users"
            value={(realtime?.activeUsers ?? 0).toLocaleString()}
            hint="Currently active"
          />
          <AdminStatCard
            label="Active sessions"
            value={(realtime?.activeSessions ?? 0).toLocaleString()}
            hint="Open right now"
          />
          <AdminStatCard
            label="Events (5 min)"
            value={(realtime?.eventsLast5Min ?? 0).toLocaleString()}
            hint="Last five minutes"
          />
        </div>
      </MetricsSection>

      {trafficSources &&
      (trafficSources.sources.length > 0 ||
        (trafficSources.timeSeries && trafficSources.timeSeries.length > 0) ||
        trafficSources.campaigns.length > 0) ? (
        <MetricsChartCard title="Traffic sources" description="Acquisition by source and campaign.">
          <div className="space-y-6">
            {trafficSources.sources.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={trafficSources.sources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props) => {
                        const { source, percentage } = props as { source?: string; percentage?: number }
                        const s = typeof source === 'string' ? source : String(source ?? '')
                        const cap = s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
                        return `${cap}: ${Number(percentage ?? 0).toFixed(1)}%`
                      }}
                      outerRadius={110}
                      innerRadius={44}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {trafficSources.sources.map((_, index) => (
                        <Cell key={`source-${index}`} fill={METRICS_CHART_COLORS[index % METRICS_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltipProps} formatter={(value) => formatChartNumber(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {trafficSources.timeSeries && trafficSources.timeSeries.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={trafficSources.timeSeries} margin={CHART_MARGIN_DEFAULT}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis
                      dataKey="date"
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
                      formatter={(value) => formatChartNumber(value)}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="organic" stackId="1" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.25} name="Organic" />
                    <Area type="monotone" dataKey="direct" stackId="1" stroke="#0f766e" fill="#0f766e" fillOpacity={0.25} name="Direct" />
                    <Area type="monotone" dataKey="paid" stackId="1" stroke="#b45309" fill="#b45309" fillOpacity={0.25} name="Paid" />
                    <Area type="monotone" dataKey="social" stackId="1" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} name="Social" />
                    <Area type="monotone" dataKey="email" stackId="1" stroke="#334155" fill="#334155" fillOpacity={0.25} name="Email" />
                    <Area type="monotone" dataKey="referral" stackId="1" stroke="#be123c" fill="#be123c" fillOpacity={0.25} name="Referral" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {trafficSources.campaigns.length > 0 ? (
              <div className="space-y-2">
                {trafficSources.campaigns.slice(0, 5).map((campaign) => (
                  <MetricsListRow
                    key={campaign.campaign}
                    label={campaign.campaign}
                    value={`${campaign.percentage.toFixed(1)}%`}
                    meta={`${campaign.count.toLocaleString()} events`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </MetricsChartCard>
      ) : null}

      {userFlows && (userFlows.topPaths.length > 0 || userFlows.dropOffs.length > 0) ? (
        <MetricsChartCard title="User flows" description="Common paths and drop-off pages.">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Top paths</p>
              {userFlows.topPaths.slice(0, 8).map((path) => (
                <MetricsListRow
                  key={path.path}
                  label={path.path}
                  value={`${path.percentage.toFixed(1)}%`}
                  meta={`${path.count} sessions`}
                  mono
                />
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Drop-off pages</p>
              {userFlows.dropOffs.slice(0, 8).map((dropOff) => (
                <MetricsListRow
                  key={dropOff.page}
                  label={dropOff.page}
                  value={`${dropOff.dropOffRate}% drop-off`}
                  meta={`${dropOff.entries} in · ${dropOff.exits} out`}
                />
              ))}
            </div>
          </div>
        </MetricsChartCard>
      ) : null}

      {geographic && (geographic.countries.length > 0 || geographic.cities.length > 0) ? (
        <MetricsChartCard title="Geographic distribution" description="Users by country and city.">
          <div className="space-y-6">
            {geographic.countries.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={geographic.countries.slice(0, 10)} margin={{ ...CHART_MARGIN_DEFAULT, bottom: 48 }}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis
                      dataKey="name"
                      tick={CHART_TICK}
                      tickLine={false}
                      axisLine={false}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={CHART_TICK} tickLine={false} axisLine={false} />
                    <Tooltip {...chartTooltipProps} formatter={(value) => formatChartNumber(value)} />
                    <Bar dataKey="userCount" fill="#334155" name="Users" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
            {geographic.cities.length > 0 ? (
              <div className="space-y-2">
                {geographic.cities.slice(0, 8).map((city) => (
                  <MetricsListRow
                    key={city.city}
                    label={city.city}
                    value={`${city.userCount.toLocaleString()} users`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </MetricsChartCard>
      ) : null}

      {userLifecycle ? (
        <MetricsChartCard title="Lifecycle and engagement" description="Where users sit in the funnel, and how engagement is trending.">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {Object.entries(userLifecycle.lifecycleStage).map(([stage, count]) => (
                <AdminStatCard key={stage} label={stage} value={count.toLocaleString()} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <AdminStatCard
                label="Engagement score"
                value={(userLifecycle.engagementScore ?? 0).toFixed(1)}
              />
              <AdminStatCard
                label="Avg. session"
                value={`${Math.round(userLifecycle.averageSessionDuration ?? 0)}m`}
              />
              <AdminStatCard
                label="Sessions per user"
                value={(userLifecycle.averageSessionsPerUser ?? 0).toFixed(1)}
              />
            </div>
            {userLifecycle.engagementTrend && userLifecycle.engagementTrend.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={userLifecycle.engagementTrend} margin={CHART_MARGIN_DEFAULT}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis
                      dataKey="date"
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
                      formatter={(value) =>
                        typeof value === 'number' ? [value.toFixed(1), 'Engagement score'] : ['', 'Engagement score']
                      }
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="score" stroke="#334155" strokeWidth={2} dot={{ r: 3 }} name="Engagement score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </MetricsChartCard>
      ) : null}

      {security ? (
        <MetricsChartCard
          title="Security signals"
          description="Events in the last 14 days."
          actions={
            <Badge variant="outline" className="text-xs">
              {(security.totals.total ?? 0).toLocaleString()} total
            </Badge>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <AdminStatCard label="Failed logins" value={(security.totals.failed_login ?? 0).toLocaleString()} />
              <AdminStatCard label="Suspicious" value={(security.totals.suspicious_activity ?? 0).toLocaleString()} />
              <AdminStatCard label="RLS violations" value={(security.totals.rls_violation ?? 0).toLocaleString()} />
              <AdminStatCard label="Verification failures" value={(security.totals.verification_failure ?? 0).toLocaleString()} />
              <AdminStatCard label="Rate limits" value={(security.totals.rate_limit_exceeded ?? 0).toLocaleString()} />
            </div>
            {security.timeSeries && security.timeSeries.length > 0 ? (
              <div className={`w-full ${chartContainerClass}`} style={{ minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={security.timeSeries} margin={CHART_MARGIN_DEFAULT}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis
                      dataKey="date"
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
                      formatter={(value, name) => {
                        const labels: Record<string, string> = {
                          failed_login: 'Failed logins',
                          suspicious_activity: 'Suspicious activity',
                          rls_violation: 'RLS violations',
                          verification_failure: 'Verification failures',
                          rate_limit_exceeded: 'Rate limit exceeded',
                        }
                        const label = typeof name === 'string' ? labels[name] || name : String(name ?? '')
                        return [formatChartNumber(value), label]
                      }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="failed_login" stackId="a" fill="#be123c" name="Failed logins" />
                    <Bar dataKey="suspicious_activity" stackId="a" fill="#b45309" name="Suspicious activity" />
                    <Bar dataKey="rls_violation" stackId="a" fill="#ca8a04" name="RLS violations" />
                    <Bar dataKey="verification_failure" stackId="a" fill="#1d4ed8" name="Verification failures" />
                    <Bar dataKey="rate_limit_exceeded" stackId="a" fill="#7c3aed" name="Rate limit exceeded" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </MetricsChartCard>
      ) : null}
    </div>
  )
}
