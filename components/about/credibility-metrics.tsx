'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, GraduationCap, TrendingUp, Users } from 'lucide-react'
import type { MarketingStatsResponse } from '@/app/api/marketing/stats/route'

async function fetchMarketingStats(): Promise<MarketingStatsResponse> {
  const response = await fetch('/api/marketing/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch marketing stats')
  }
  return response.json()
}

export function CredibilityMetrics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['marketing-stats'],
    queryFn: fetchMarketingStats,
    staleTime: 60_000, // 60 seconds
    retry: 2,
  })

  const metrics = [
    {
      key: 'verified',
      value: data ? `${data.verifiedUsersPercent}%` : '--',
      label: 'Verified Students',
      description: 'Email or ID verified community',
      icon: Shield,
    },
    {
      key: 'universities',
      value: data ? `${data.universitiesCount}` : '--',
      label: 'Universities Represented',
      description: `${data?.programmesCount || 0}+ study programmes on Domu Match`,
      icon: GraduationCap,
    },
    {
      key: 'quality',
      value: data ? `${data.avgScoreConfirmedMatches}%` : '--',
      label: 'Average Compatibility Score',
      description: `vs ${data?.avgScoreAllMatches || 0}% across all matches`,
      icon: TrendingUp,
    },
    {
      key: 'matches',
      value: data ? `${data.matchedWithin24hPercent}%` : '--',
      label: 'Get Matched in <24 Hours',
      description: `and ${data?.matchedWithin48hPercent || 0}% within 48 hours`,
      icon: Users,
    },
  ]

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isLoadingState = isLoading || error

          return (
            <Card
              key={metric.key}
              className="text-center border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 hover:shadow-elev-2 transition-all duration-200 rounded-2xl"
            >
              <CardContent className="pt-6 pb-6 px-6">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="h-6 w-6 text-brand-primary" />
                  </div>
                </div>
                {isLoadingState ? (
                  <>
                    <div className="h-10 mb-2 bg-brand-primary/5 rounded animate-pulse" />
                    <div className="h-4 mb-1 bg-brand-primary/5 rounded animate-pulse" />
                    <div className="h-3 bg-brand-primary/5 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <div className="text-3xl md:text-4xl font-bold text-brand-text mb-2">
                      {metric.value}
                    </div>
                    <div className="text-sm font-semibold text-brand-text mb-1">
                      {metric.label}
                    </div>
                    <div className="text-xs text-brand-muted leading-tight">
                      {metric.description}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {error && !isLoading && (
        <div className="text-center mt-6">
          <p className="text-xs text-brand-muted">
            Metrics are being updated...
          </p>
        </div>
      )}
    </>
  )
}

