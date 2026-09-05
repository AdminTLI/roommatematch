'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface OverallStats {
  totalResponses: number
  completedResponses: number
  placementRate: number
  npsScore: number | null
  domuMatchCount: number
  externalCount: number
  stillLookingCount: number
  promoters: number
  passives: number
  detractors: number
}

type SuccessStatus = 'domu_match' | 'external' | 'still_looking' | null

interface RecentFeedbackItem {
  id: string
  success_status: SuccessStatus
  nps_score: number | null
  reason: string | null
  created_at: string
}

interface PlatformFeedbackResponse {
  overall: OverallStats
  recentFeedback: RecentFeedbackItem[]
}

type Props = { analyticsQuery?: string }

export function SuccessNpsCard({ analyticsQuery = '' }: Props) {
  const [data, setData] = useState<PlatformFeedbackResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/analytics/platform-feedback${analyticsQuery}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to load platform feedback analytics')
        }
        const json = (await res.json()) as PlatformFeedbackResponse
        setData(json)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load platform feedback analytics')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [analyticsQuery])

  const overall = data?.overall

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg font-medium">
            Placement and NPS
          </CardTitle>
          <CardDescription className="mt-1">
            Roommate placement outcomes and Net Promoter Score.
          </CardDescription>
        </div>
        {overall && (
          <Badge variant="outline" className="text-[10px] md:text-xs">
            {overall.completedResponses.toLocaleString()} responses
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-xs md:text-sm text-muted-foreground">Loading platform feedback…</p>
        )}

        {!isLoading && error && (
          <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {!isLoading && !error && overall && overall.totalResponses === 0 && (
          <p className="text-xs md:text-sm text-muted-foreground">
            No platform feedback collected yet. The micro-survey will start populating once users hit 14+ days on the platform.
          </p>
        )}

        {!isLoading && !error && overall && overall.totalResponses > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Placement rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums tracking-tight">
                    {overall.placementRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span>
                    {overall.domuMatchCount.toLocaleString()} via Domu Match
                  </span>
                  <span>·</span>
                  <span>
                    {overall.externalCount.toLocaleString()} externally
                  </span>
                  <span>·</span>
                  <span>
                    {overall.stillLookingCount.toLocaleString()} still looking
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Net Promoter Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums tracking-tight">
                    {overall.npsScore !== null ? Math.round(overall.npsScore) : '–'}
                  </span>
                  {overall.npsScore !== null && (
                    <span className="text-xs text-muted-foreground">
                      NPS (promoters − detractors)
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    {overall.promoters.toLocaleString()} promoters (9–10)
                  </span>
                  <span>·</span>
                  <span>
                    {overall.passives.toLocaleString()} passives (7–8)
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-rose-500" />
                    {overall.detractors.toLocaleString()} detractors (0–6)
                  </span>
                </div>
              </div>
            </div>

            {data?.recentFeedback && data.recentFeedback.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-50">
                  <MessageSquare className="h-3 w-3" />
                  Recent qualitative feedback
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {data.recentFeedback
                    .filter((f) => f.reason && f.reason.trim().length > 0)
                    .slice(0, 5)
                    .map((feedback) => (
                      <div
                        key={feedback.id}
                        className="rounded-md border border-gray-200 bg-muted/40 px-3 py-2 text-sm leading-snug text-gray-800 dark:border-slate-700 dark:text-gray-100"
                      >
                        {feedback.nps_score !== null && (
                          <div className="mb-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Star className="h-3 w-3" />
                            Score {feedback.nps_score}/10
                            {feedback.success_status === 'domu_match' && (
                              <span className="ml-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-300">
                                Found via Domu Match
                              </span>
                            )}
                            {feedback.success_status === 'external' && (
                              <span className="ml-1 rounded-full bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 text-[9px] text-amber-700 dark:text-amber-300">
                                Found elsewhere
                              </span>
                            )}
                            {feedback.success_status === 'still_looking' && (
                              <span className="ml-1 rounded-full bg-slate-50 dark:bg-slate-900/40 px-1.5 py-0.5 text-[9px] text-slate-700 dark:text-slate-200">
                                Still looking
                              </span>
                            )}
                          </div>
                        )}
                        <p className="line-clamp-3">
                          {feedback.reason}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

