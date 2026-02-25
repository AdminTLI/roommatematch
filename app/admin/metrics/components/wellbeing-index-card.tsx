'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface WellbeingResponse {
  totalActiveMatches: number
  totalBlocks: number
  totalReports: number
  harmonyScore: number
}

export function WellbeingIndexCard() {
  const [data, setData] = useState<WellbeingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/analytics/wellbeing')
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to load wellbeing analytics')
        }
        const json = (await res.json()) as WellbeingResponse
        setData(json)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load wellbeing analytics')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const hasData = (data?.totalActiveMatches ?? 0) > 0
  const score = data?.harmonyScore ?? 0

  const scoreColor =
    score >= 90
      ? 'text-emerald-600 dark:text-emerald-400'
      : score >= 80
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400'

  return (
    <Card className="border-emerald-200/70 dark:border-emerald-800/70 bg-emerald-50/40 dark:bg-emerald-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">
          Platform Harmony & Conflict Index
        </CardTitle>
        <CardDescription className="mt-1 text-xs md:text-sm">
          Measures the stability of matches against reported conflicts and safety signals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {isLoading && (
          <p className="text-xs md:text-sm text-muted-foreground">
            Loading wellbeing index…
          </p>
        )}

        {!isLoading && error && (
          <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {!isLoading && !error && data && (
          <>
            {!hasData && (
              <p className="text-xs md:text-sm text-muted-foreground">
                No active matches yet. The harmony index will populate once students begin
                matching and safety events are recorded.
              </p>
            )}

            {hasData && (
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-semibold">
                    Harmony score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl md:text-3xl font-bold ${scoreColor}`}>
                      {score.toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Higher = more stable, low-conflict matches
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Progress value={Math.max(0, Math.min(100, score))} />
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  Active Matches:{' '}
                  <span className="font-medium">
                    {data.totalActiveMatches.toLocaleString()}
                  </span>
                </span>
                <span>|</span>
                <span>
                  Blocked Pairs:{' '}
                  <span className="font-medium">
                    {data.totalBlocks.toLocaleString()}
                  </span>
                </span>
                <span>|</span>
                <span>
                  Safety Reports:{' '}
                  <span className="font-medium">
                    {data.totalReports.toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

