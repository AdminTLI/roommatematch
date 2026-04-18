'use client'

import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, Info } from 'lucide-react'
import {
  CHART_MARGIN_TALL_BOTTOM,
  CHART_TICK,
  chartContainerClass,
  chartGridProps,
  chartTooltipProps,
} from '@/lib/admin/metrics-chart-styles'

export type AtRiskMetricsData = {
  totalAtRisk: number
  byStudyYear: Array<{ label: string; count: number }>
}

type Props = { data: AtRiskMetricsData | null; isPending: boolean }

export const AtRiskMetricsCard = memo(function AtRiskMetricsCard({ data, isPending }: Props) {
  const chartData = data?.byStudyYear ?? []

  return (
    <Card className="border-amber-200/60 dark:border-amber-900/50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Student Stability &amp; Retention Risk
            </CardTitle>
            <CardDescription>Prolonged unmatched, academically verified students</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground p-1 rounded-md">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs leading-relaxed">
                Students unmatched for 30+ days show higher risk of social isolation and academic underperformance.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold tabular-nums">{isPending ? '—' : (data?.totalAtRisk ?? 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Active in last 14 days · no confirmed match · still looking
          </p>
        </div>
        {chartData.length > 0 ? (
          <div className={`w-full h-[220px] ${chartContainerClass}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={CHART_MARGIN_TALL_BOTTOM}>
                <CartesianGrid {...chartGridProps} />
                <XAxis
                  dataKey="label"
                  tick={CHART_TICK}
                  interval={0}
                  angle={-22}
                  textAnchor="end"
                  height={68}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={CHART_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <RTooltip {...chartTooltipProps} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="At-Risk Students" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isPending ? 'Loading…' : 'No at-risk students in this cohort.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
})
