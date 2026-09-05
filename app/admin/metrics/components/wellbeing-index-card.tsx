'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ADMIN_CARD_TITLE, ADMIN_HELPER_TEXT } from '@/lib/admin/ui'

interface WellbeingResponse {
  totalActiveMatches: number
  totalBlocks: number
  totalReports: number
  harmonyScore: number
}

type Props = { analyticsQuery?: string }

export function WellbeingIndexCard({ analyticsQuery = '' }: Props) {
  const [data, setData] = useState<WellbeingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/analytics/wellbeing${analyticsQuery}`)
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
  }, [analyticsQuery])

  const hasData = (data?.totalActiveMatches ?? 0) > 0
  const score = data?.harmonyScore ?? 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className={ADMIN_CARD_TITLE}>Harmony index</CardTitle>
        <CardDescription>Stability of matches against blocks and safety reports.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <p className={ADMIN_HELPER_TEXT}>Loading…</p> : null}

        {!isLoading && error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        {!isLoading && !error && data ? (
          <>
            {!hasData ? (
              <p className={ADMIN_HELPER_TEXT}>
                The index will populate once students begin matching.
              </p>
            ) : (
              <div className="text-2xl font-semibold tabular-nums tracking-tight">
                {score.toFixed(1)}%
              </div>
            )}

            <div className="space-y-2">
              <Progress value={Math.max(0, Math.min(100, score))} />
              <p className={ADMIN_HELPER_TEXT}>
                {data.totalActiveMatches.toLocaleString()} active matches ·{' '}
                {data.totalBlocks.toLocaleString()} blocked pairs ·{' '}
                {data.totalReports.toLocaleString()} safety reports
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
