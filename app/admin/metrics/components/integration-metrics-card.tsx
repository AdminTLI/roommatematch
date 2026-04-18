'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe2 } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface IntegrationMetrics {
  totalMatches: number
  crossCulturalMatches: number
  integrationRate: number
}

const CHART_COLORS = ['#0EA5E9', '#6366F1']

type Props = { analyticsQuery?: string }

export function IntegrationMetricsCard({ analyticsQuery = '' }: Props) {
  const [data, setData] = useState<IntegrationMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const res = await fetch(`/api/admin/analytics/integration${analyticsQuery}`)

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Failed to load integration metrics')
        }

        const json = (await res.json()) as IntegrationMetrics
        if (isMounted) {
          setData(json)
        }
      } catch (err) {
        console.error('[IntegrationMetricsCard] Failed to load integration metrics', err)
        if (isMounted) {
          setError('Failed to load integration metrics')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [analyticsQuery])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-sky-500" />
            <span>Cross-Cultural Integration Rate</span>
          </CardTitle>
          <CardDescription>
            Matches bridging international and domestic student populations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            <span>Loading integration metrics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-sky-500" />
            <span>Cross-Cultural Integration Rate</span>
          </CardTitle>
          <CardDescription>
            Matches bridging international and domestic student populations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">
            Unable to load integration metrics right now. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    )
  }

  const total = data.totalMatches ?? 0
  const cross = data.crossCulturalMatches ?? 0
  const same = Math.max(total - cross, 0)
  const rate = Number.isFinite(data.integrationRate) ? data.integrationRate : 0
  const rateDisplay = rate.toFixed(1)

  const chartData =
    total > 0
      ? [
          { name: 'Cross-cultural', value: cross },
          { name: 'Same-origin', value: same },
        ]
      : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-sky-500" />
          <span>Cross-Cultural Integration Rate</span>
        </CardTitle>
        <CardDescription>
          Matches bridging international and domestic student populations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-3">
            <div className="text-4xl font-bold tracking-tight">
              {rateDisplay}
              <span className="ml-1 text-xl text-muted-foreground">%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Out of {total.toLocaleString()} active pairs,{' '}
              <span className="font-semibold">{cross.toLocaleString()}</span> consist of students from different
              geographic origins.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>Cross-cultural matches</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>Same-origin matches</span>
              </div>
            </div>
          </div>

          {total > 0 ? (
            <div className="h-40 md:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={4}
                    cornerRadius={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === 'Cross-cultural' ? 'Cross-cultural matches' : 'Same-origin matches',
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.96)',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Once there are active matches with origin data, this card will show how many pairs bridge domestic and
              international students.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

