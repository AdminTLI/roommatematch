'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle } from 'lucide-react'

interface SupplyDemandMetrics {
  haveRoomCount: number
  needRoomCount: number
  haveRoomPercentage: number
  needRoomPercentage: number
  totalUsersConsidered: number
}

interface SquadFormationMetrics {
  groupChatCount: number
  duoChatCount: number
  groupChatPercentage: number
  duoChatPercentage: number
  totalActiveChats: number
}

interface MarketplaceDynamicsResponse {
  supplyDemand: SupplyDemandMetrics
  squadFormation: SquadFormationMetrics
}

type Props = { analyticsQuery?: string }

export function MarketplaceDynamicsCards({ analyticsQuery = '' }: Props) {
  const [data, setData] = useState<MarketplaceDynamicsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const res = await fetch(`/api/admin/analytics/marketplace-dynamics${analyticsQuery}`)

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Failed to load marketplace dynamics')
        }

        const json = (await res.json()) as MarketplaceDynamicsResponse
        if (isMounted) {
          setData(json)
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Failed to load marketplace dynamics')
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Marketplace balance</CardTitle>
          <CardDescription>Have a room vs need a room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading marketplace balance…
            </p>
          )}

          {!isLoading && error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {!isLoading && !error && data && (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">
                    {data.supplyDemand.needRoomPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Need a room · {data.supplyDemand.haveRoomPercentage.toFixed(1)}% have a room
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold">
                      {data.supplyDemand.haveRoomCount.toLocaleString()}
                    </span>{' '}
                    have a room
                  </div>
                  <div>
                    <span className="font-semibold">
                      {data.supplyDemand.needRoomCount.toLocaleString()}
                    </span>{' '}
                    need a room
                  </div>
                </div>
              </div>

              <Progress value={Math.max(0, Math.min(100, data.supplyDemand.needRoomPercentage))} />

              <p className="text-xs text-muted-foreground">
                Based on{' '}
                <span className="font-semibold">
                  {data.supplyDemand.totalUsersConsidered.toLocaleString()}
                </span>{' '}
                active users who have set a housing status.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Group vs 1-on-1 chats</CardTitle>
          <CardDescription>Share of active chats that are squads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading squad formation…
            </p>
          )}

          {!isLoading && error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {!isLoading && !error && data && (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">
                    {data.squadFormation.groupChatPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">of active chats are squads</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold">
                      {data.squadFormation.groupChatCount.toLocaleString()}
                    </span>{' '}
                    group chats
                  </div>
                  <div>
                    <span className="font-semibold">
                      {data.squadFormation.duoChatCount.toLocaleString()}
                    </span>{' '}
                    1-on-1 chats
                  </div>
                </div>
              </div>

              <Progress value={Math.max(0, Math.min(100, data.squadFormation.groupChatPercentage))} />

              {data.squadFormation.totalActiveChats === 0 ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  No active chats in the last 30 days yet.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Based on{' '}
                  <span className="font-semibold">
                    {data.squadFormation.totalActiveChats.toLocaleString()}
                  </span>{' '}
                  active chats in the last 30 days.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

