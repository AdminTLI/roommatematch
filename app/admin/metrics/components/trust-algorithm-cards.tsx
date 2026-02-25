'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

type TopDealbreaker = {
  key: string
  name: string
  count: number
}

interface TrustAlgorithmResponse {
  totalUsers: number
  verifiedUsers: number
  verificationRate: number
  topDealbreakers: TopDealbreaker[]
}

export function TrustAlgorithmCards() {
  const [data, setData] = useState<TrustAlgorithmResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const res = await fetch('/api/admin/analytics/trust-and-algorithm')

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Failed to load trust & algorithm metrics')
        }

        const json = (await res.json()) as TrustAlgorithmResponse
        if (isMounted) {
          setData(json)
        }
      } catch (err) {
        console.error('[TrustAlgorithmCards] Failed to load metrics', err)
        if (isMounted) {
          setError('Failed to load trust & algorithm metrics')
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
  }, [])

  const totalUsers = data?.totalUsers ?? 0
  const verifiedUsers = data?.verifiedUsers ?? 0
  const verificationRate = Number.isFinite(data?.verificationRate ?? NaN)
    ? data!.verificationRate
    : 0

  const trustLevel =
    verificationRate >= 90
      ? 'Excellent coverage'
      : verificationRate >= 80
        ? 'Healthy coverage'
        : verificationRate > 0
          ? 'Needs attention'
          : 'No verification data yet'

  const progressClassName =
    verificationRate >= 80
      ? '[&>div]:bg-emerald-500'
      : '[&>div]:bg-amber-500'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Card 1: Platform Trust (IDV Conversion) */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg">
              Platform Trust (IDV Conversion)
            </CardTitle>
            <CardDescription className="mt-1 text-xs md:text-sm">
              Share of active users who have passed full identity verification.
            </CardDescription>
          </div>
          <Badge
            variant={
              verificationRate >= 80
                ? 'success'
                : verificationRate > 0
                  ? 'warning'
                  : 'secondary'
            }
            className="text-[10px] md:text-xs"
          >
            {trustLevel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {isLoading && (
            <p className="text-xs md:text-sm text-muted-foreground">
              Loading trust metrics…
            </p>
          )}

          {!isLoading && error && (
            <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {!isLoading && !error && (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-semibold">
                    IDV conversion rate
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-bold">
                      {verificationRate.toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      of active users
                    </span>
                  </div>
                </div>
              </div>

              <Progress
                value={Math.max(0, Math.min(100, verificationRate))}
                className={progressClassName}
              />

              <p className="text-xs md:text-sm text-muted-foreground">
                <span className="font-medium">
                  {verifiedUsers.toLocaleString()}
                </span>{' '}
                out of{' '}
                <span className="font-medium">
                  {totalUsers.toLocaleString()}
                </span>{' '}
                total active users are fully identity-verified.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Algorithm Bottleneck (Top Dealbreakers) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">
            Algorithm Bottleneck (Top Dealbreakers)
          </CardTitle>
          <CardDescription className="mt-1 text-xs md:text-sm">
            Most common strict constraints that shrink the effective matching pool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {isLoading && (
            <p className="text-xs md:text-sm text-muted-foreground">
              Analysing dealbreaker patterns…
            </p>
          )}

          {!isLoading && error && (
            <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {!isLoading && !error && (
            <>
              {data?.topDealbreakers && data.topDealbreakers.length > 0 ? (
                <div className="space-y-2">
                  {data.topDealbreakers.map((item, index) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg bg-bg-surface-alt px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <Badge variant="outline" className="text-[11px]">
                          {item.name}
                        </Badge>
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {item.count.toLocaleString()} users
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">
                  No strong dealbreaker patterns detected yet. As more students
                  complete onboarding, this view will highlight which hard
                  constraints are most likely to choke the matching pool.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

