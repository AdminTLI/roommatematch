'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, Loader2, RefreshCw, TrendingUp } from 'lucide-react'
import { InstitutionPageHeader } from '../../components/institution-shell'
import type { InstitutionMetricsPayload } from '@/lib/institution/metrics'

export function InstitutionMatchesContent() {
  const [data, setData] = useState<InstitutionMetricsPayload | null>(null)
  const [period, setPeriod] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/institution/metrics?period=${period}&limit=1`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load match stats')
      }
      setData(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [period])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <InstitutionPageHeader
          title="Match statistics"
          description="Aggregate match activity for your institution. Individual student identities and chat details are never shown."
          icon={Heart}
        />
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {loading || !data ? (
        <div className="py-16 flex items-center justify-center text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading match statistics…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Suggestion pipeline</CardTitle>
              <CardDescription>
                Match suggestions involving students at your institution.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Stat label="Total suggestions" value={data.matches.total_suggestions} />
              <Stat label="Pending" value={data.matches.pending} />
              <Stat label="Accepted" value={data.matches.accepted} />
              <Stat label="Confirmed" value={data.matches.confirmed} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quality snapshot
              </CardTitle>
              <CardDescription>
                Average compatibility score across in-scope suggestions (suppressed when sample is
                small).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-teal-700 dark:text-teal-300">
                {data.matches.avg_fit_score_pct != null
                  ? `${data.matches.avg_fit_score_pct}%`
                  : '—'}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Students with at least one match suggestion: {data.summary.with_matches}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}
