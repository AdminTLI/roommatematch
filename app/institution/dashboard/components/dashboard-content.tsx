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
import {
  ActivitySquare,
  CheckCircle2,
  Heart,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users2,
} from 'lucide-react'
import { InstitutionPageHeader } from '../../components/institution-shell'
import type { InstitutionMetricsPayload } from '@/lib/institution/metrics'

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tint,
}: {
  label: string
  value: number | string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
            {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
          </div>
          <div className={`h-10 w-10 rounded-md flex items-center justify-center ${tint}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function InstitutionDashboardContent() {
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
      const res = await fetch(`/api/institution/metrics?period=${period}&limit=5`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load metrics')
      }
      setData(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load metrics')
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
          title="Overview"
          description="Anonymised metrics for students linked to your institution. Individual identities are never shown."
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
          Loading institution metrics…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Students"
              value={data.summary.total_students}
              hint={
                typeof data.summary.questionnaire_rate_pct === 'number'
                  ? `${data.summary.questionnaire_rate_pct}% completed questionnaire`
                  : undefined
              }
              icon={Users2}
              tint="bg-blue-100 dark:bg-blue-900/30 text-blue-700"
            />
            <MetricCard
              label="Verified"
              value={data.summary.verified_students}
              hint={
                typeof data.summary.verification_rate_pct === 'number'
                  ? `${data.summary.verification_rate_pct}% verification rate`
                  : undefined
              }
              icon={ShieldCheck}
              tint="bg-purple-100 dark:bg-purple-900/30 text-purple-700"
            />
            <MetricCard
              label="With matches"
              value={data.summary.with_matches}
              icon={Heart}
              tint="bg-pink-100 dark:bg-pink-900/30 text-pink-700"
            />
            <MetricCard
              label="Confirmed matches"
              value={data.summary.active_matches}
              icon={CheckCircle2}
              tint="bg-green-100 dark:bg-green-900/30 text-green-700"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5" />
                Registration funnel
              </CardTitle>
              <CardDescription>
                How far students at {data.institution_name || 'your institution'} have progressed.
                Counts below {5} are shown as &quot;&lt;5&quot; for privacy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.funnel.stages.map((stage) => {
                const count = data.funnel.stageCounts[stage.id]
                const rate = data.funnel.stageRates[stage.id]
                const width =
                  typeof rate === 'number' ? Math.max(rate, count === 0 ? 0 : 2) : 2
                return (
                  <div key={stage.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>
                        <span className="font-mono text-xs text-gray-400 mr-2">{stage.id}</span>
                        {stage.shortLabel}
                      </span>
                      <span className="text-gray-500">
                        {count} · {typeof rate === 'number' ? `${rate}%` : rate}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                        style={{ width: `${Math.min(width, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
