'use client'

import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  CHART_MARGIN_DEFAULT,
  CHART_TICK,
  chartContainerClass,
  chartGridProps,
  chartTooltipProps,
} from '@/lib/admin/metrics-chart-styles'

export type HousingFrictionData = {
  sufficientSample: boolean
  message?: string
  domestic: { sampleSize: number; averageDaysToFirstConfirmedMatch: number | null }
  international: { sampleSize: number; averageDaysToFirstConfirmedMatch: number | null }
}

type Props = { data: HousingFrictionData | null; isPending: boolean }

export const InternationalIntegrationPulseCard = memo(function InternationalIntegrationPulseCard({
  data,
  isPending,
}: Props) {
  const chartRows =
    data && data.sufficientSample
      ? [
          {
            segment: 'Domestic (NL)',
            days: data.domestic.averageDaysToFirstConfirmedMatch ?? 0,
            n: data.domestic.sampleSize,
          },
          {
            segment: 'International',
            days: data.international.averageDaysToFirstConfirmedMatch ?? 0,
            n: data.international.sampleSize,
          },
        ]
      : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-sky-600" />
          International Integration Pulse
        </CardTitle>
        <CardDescription>
          Time-to-first confirmed match — domestic vs international (verified cohort)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">No data.</p>
        ) : !data.sufficientSample ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">{data.message}</p>
        ) : (
          <div className={`h-[220px] w-full ${chartContainerClass}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} margin={{ ...CHART_MARGIN_DEFAULT, left: 4 }}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="segment" tick={CHART_TICK} tickLine={false} axisLine={false} />
                <YAxis
                  tick={CHART_TICK}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: 'Days',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
                  }}
                />
                <Tooltip
                  {...chartTooltipProps}
                  formatter={(value) => {
                    const n = Number(value)
                    return Number.isFinite(n) ? [`${n.toFixed(1)} Days`, 'Average Time-To-Match'] : ['', '']
                  }}
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload as { n?: number } | undefined
                    return p?.n != null ? `Sample Size (N) = ${p.n}` : ''
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="days"
                  name="Average Days To First Confirmed Match"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
