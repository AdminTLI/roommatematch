/** Shared Recharts presentation for admin metrics (readable ticks, calmer grid). */

export const CHART_MARGIN_DEFAULT = { top: 8, right: 12, left: 0, bottom: 20 } as const
export const CHART_MARGIN_TALL_BOTTOM = { top: 8, right: 12, left: 8, bottom: 48 } as const

export const CHART_TICK = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }

export const chartGridProps = {
  strokeDasharray: '3 3' as const,
  stroke: 'hsl(var(--border))',
  strokeOpacity: 0.75,
  vertical: false,
}

export const chartTooltipProps = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
    fontSize: 12,
  },
  labelStyle: { fontWeight: 600, marginBottom: 4 },
}

export const chartContainerClass = 'rounded-xl border border-border/60 bg-muted/20 p-3 md:p-4 shadow-sm'

export const METRICS_CHART_COLORS = [
  '#334155',
  '#0f766e',
  '#1d4ed8',
  '#b45309',
  '#7c3aed',
  '#be123c',
] as const

export const formatChartNumber = (value: unknown): string =>
  typeof value === 'number' ? value.toLocaleString() : typeof value === 'string' ? value : ''

export const formatChartNumberPair = (value: unknown, label: string): [string, string] => [
  formatChartNumber(value),
  label,
]
