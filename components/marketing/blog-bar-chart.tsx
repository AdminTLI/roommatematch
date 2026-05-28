'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'

export type BlogBarChartPoint = {
  label: string
  value: number
}

export type BlogBarChartProps = {
  data: BlogBarChartPoint[]
  yLabel?: string
  unit?: string
  caption: string
  className?: string
  /** Use when values are percentages (0-100). */
  valueFormat?: 'number' | 'percent'
}

/**
 * Simple vertical bar chart for blog articles. Requires 3-8 data points from verified sources.
 */
export function BlogBarChart({
  data,
  yLabel,
  unit,
  caption,
  className,
  valueFormat = 'number',
}: BlogBarChartProps) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }))

  const formatValue = (v: number) => {
    if (valueFormat === 'percent') return `${v}%`
    if (unit) return `${v.toLocaleString('nl-NL')} ${unit}`
    return v.toLocaleString('nl-NL')
  }

  return (
    <figure className={cn('my-8', className)}>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="h-64 w-full" role="img" aria-label={caption}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#475569', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fill: '#475569', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(v) =>
                  valueFormat === 'percent' ? `${v}%` : v.toLocaleString('nl-NL')
                }
                label={
                  yLabel
                    ? {
                        value: yLabel,
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#64748b',
                        fontSize: 12,
                      }
                    : undefined
                }
              />
              <Tooltip
                formatter={(value) => {
                  const n = typeof value === 'number' ? value : Number(value)
                  return [formatValue(n), yLabel || 'Value']
                }}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <figcaption className="mt-2 text-sm text-slate-500">{caption}</figcaption>
    </figure>
  )
}
