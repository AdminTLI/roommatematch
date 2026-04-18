'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, MessageSquare, Users } from 'lucide-react'

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Marketplace Balance (Have vs. Need)</span>
          </CardTitle>
          <CardDescription>
            Measures our supply deficit.
          </CardDescription>
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
                  <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 font-semibold">
                    Have vs. Need ratio
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.supplyDemand.haveRoomPercentage.toFixed(1)}% Have Room ·{' '}
                    {data.supplyDemand.needRoomPercentage.toFixed(1)}% Need Room
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
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Group Liquidity (Squads vs Duos)</span>
          </CardTitle>
          <CardDescription>
            Measures collaborative housing hunts.
          </CardDescription>
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
                  <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-semibold">
                    Squad formation rate
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.squadFormation.groupChatPercentage.toFixed(1)}% of active chats are squads
                  </p>
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

