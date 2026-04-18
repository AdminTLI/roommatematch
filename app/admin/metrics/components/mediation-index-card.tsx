'use client'

import { memo, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from 'recharts'
import { Scale } from 'lucide-react'
import { chartContainerClass, chartTooltipProps } from '@/lib/admin/metrics-chart-styles'

export type MediationIndexData = {
  totalReports: number
  pendingReports: number
  resolvedSampleCount: number
  averageResolutionHours: number | null
  byCategory: Array<{ category: string; count: number }>
  estimatedAdminHoursSaved: number
  estimateAssumptions: string
}

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#eab308', '#ec4899', '#14b8a6', '#94a3b8']

function titleCase(s: string) {
  if (!s) return ''
  return s
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

type Props = { data: MediationIndexData | null; isPending: boolean }

export const MediationIndexCard = memo(function MediationIndexCard({ data, isPending }: Props) {
  const pieData = useMemo(
    () =>
      (data?.byCategory ?? []).map((d) => ({
        ...d,
        category: titleCase(d.category),
      })),
    [data]
  )

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="h-4 w-4 text-indigo-600" />
          Relational Health &amp; Mediation Volume
        </CardTitle>
        <CardDescription>Reports in scope — category mix and moderation throughput</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Total Reports</div>
            <div className="text-xl font-semibold tabular-nums">{isPending ? '—' : (data?.totalReports ?? 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Open / Pending</div>
            <div className="text-xl font-semibold tabular-nums">{isPending ? '—' : (data?.pendingReports ?? 0).toLocaleString()}</div>
          </div>
        </div>
        {!isPending && data?.averageResolutionHours != null && (
          <p className="text-xs text-muted-foreground">
            Average Time To Terminal Status: <span className="font-medium">{data.averageResolutionHours}h</span>
          </p>
        )}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Estimated Admin Hours Saved (Estimate)
          </div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">
            {isPending ? '—' : (data?.estimatedAdminHoursSaved ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
            {isPending ? '…' : data?.estimateAssumptions}
          </p>
        </div>
        {pieData.length > 0 ? (
          <div className={`h-[200px] w-full ${chartContainerClass}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2.5}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={1} />
                  ))}
                </Pie>
                <RTooltip
                  {...chartTooltipProps}
                  formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{isPending ? 'Loading…' : 'No Reports For This Cohort.'}</p>
        )}
      </CardContent>
    </Card>
  )
})
