'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Star, MessageSquare, ArrowUpRight, ArrowDownRight } from 'lucide-react'

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

export function SuccessNpsCard() {
  const [data, setData] = useState<PlatformFeedbackResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/analytics/platform-feedback')
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
  }, [])

  const overall = data?.overall

  return (
    <Card className="border-indigo-200/70 dark:border-indigo-800/70 bg-indigo-50/40 dark:bg-indigo-950/20">
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Placement Success & NPS
          </CardTitle>
          <CardDescription className="mt-1 text-xs md:text-sm">
            One-question micro-survey for roommate placement and Net Promoter Score.
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
                <p className="text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-300 font-semibold">
                  Placement rate
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                    {overall.placementRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    of respondents report having found a roommate
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
                <p className="text-xs uppercase tracking-wide text-indigo-700 dark:text-indigo-300 font-semibold">
                  Net Promoter Score
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-indigo-100">
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
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-100">
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
                        className="rounded-md bg-white/70 dark:bg-zinc-900/40 border border-indigo-100/70 dark:border-indigo-900/60 px-2.5 py-1.5 text-[11px] leading-snug text-zinc-800 dark:text-zinc-100"
                      >
                        {feedback.nps_score !== null && (
                          <div className="mb-0.5 flex items-center gap-1 text-[10px] text-indigo-700 dark:text-indigo-300">
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

