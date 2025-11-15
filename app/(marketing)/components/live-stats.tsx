'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/app/providers'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Zap, TrendingUp, MessageCircle, Shield, GraduationCap } from 'lucide-react'
import type { MarketingStatsResponse } from '@/app/api/marketing/stats/route'

interface LiveStatsProps {
  locale?: 'en' | 'nl'
}

async function fetchMarketingStats(): Promise<MarketingStatsResponse> {
  const response = await fetch('/api/marketing/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch marketing stats')
  }
  return response.json()
}

export function LiveStats({ locale: localeProp }: LiveStatsProps) {
  const { locale: contextLocale } = useApp()
  const locale = localeProp || contextLocale

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketing-stats'],
    queryFn: fetchMarketingStats,
    staleTime: 60_000, // 60 seconds
    retry: 2,
  })

  const content = {
    en: {
      title: "Live platform stats",
      subtitle: "Real-time insights from our growing community of students finding their perfect roommates",
      stats: {
        speedMatch: {
          label: "Get a match in <24 hours",
          description: (data: MarketingStatsResponse) => `and ${data.matchedWithin48hPercent}% within 48 hours`,
        },
        quality: {
          label: "Average compatibility of confirmed roommates",
          description: (data: MarketingStatsResponse) => `vs ${data.avgScoreAllMatches}% across all matches`,
        },
        speedChat: {
          label: "Matches that turn into a chat",
          description: () => "within the first 24 hours",
        },
        verified: {
          label: "Verified students",
          description: () => "email or ID verified community",
        },
        reach: {
          label: "Universities represented",
          description: (data: MarketingStatsResponse) => `${data.programmesCount}+ study programmes on Domu Match`,
        },
      },
    },
    nl: {
      title: "Live platformstatistieken",
      subtitle: "Real-time inzichten van onze groeiende community van studenten die hun perfecte huisgenoten vinden",
      stats: {
        speedMatch: {
          label: "Krijg een match binnen <24 uur",
          description: (data: MarketingStatsResponse) => `en ${data.matchedWithin48hPercent}% binnen 48 uur`,
        },
        quality: {
          label: "Gemiddelde compatibiliteit van bevestigde huisgenoten",
          description: (data: MarketingStatsResponse) => `vs ${data.avgScoreAllMatches}% over alle matches`,
        },
        speedChat: {
          label: "Matches die uitmonden in een chat",
          description: () => "binnen de eerste 24 uur",
        },
        verified: {
          label: "Geverifieerde studenten",
          description: () => "e-mail of ID geverifieerde community",
        },
        reach: {
          label: "Universiteiten vertegenwoordigd",
          description: (data: MarketingStatsResponse) => `${data.programmesCount}+ studieprogramma's op Domu Match`,
        },
      },
    },
  }

  const text = content[locale]

  // Build stats array from API data
  const buildStats = (data: MarketingStatsResponse | undefined) => {
    if (!data) {
      return [
        { key: 'speedMatch', value: '--', label: text.stats.speedMatch.label, description: '--', icon: Zap },
        { key: 'quality', value: '--', label: text.stats.quality.label, description: '--', icon: TrendingUp },
        { key: 'speedChat', value: '--', label: text.stats.speedChat.label, description: '--', icon: MessageCircle },
        { key: 'verified', value: '--', label: text.stats.verified.label, description: '--', icon: Shield },
        { key: 'reach', value: '--', label: text.stats.reach.label, description: '--', icon: GraduationCap },
      ]
    }

    return [
      {
        key: 'speedMatch',
        value: `${data.matchedWithin24hPercent}%`,
        label: text.stats.speedMatch.label,
        description: text.stats.speedMatch.description(data),
        icon: Zap,
      },
      {
        key: 'quality',
        value: `${data.avgScoreConfirmedMatches}%`,
        label: text.stats.quality.label,
        description: text.stats.quality.description(data),
        icon: TrendingUp,
      },
      {
        key: 'speedChat',
        value: `${data.matchesToChatWithin24hPercent}%`,
        label: text.stats.speedChat.label,
        description: text.stats.speedChat.description(),
        icon: MessageCircle,
      },
      {
        key: 'verified',
        value: `${data.verifiedUsersPercent}%`,
        label: text.stats.verified.label,
        description: text.stats.verified.description(),
        icon: Shield,
      },
      {
        key: 'reach',
        value: `${data.universitiesCount}`,
        label: text.stats.reach.label,
        description: text.stats.reach.description(data),
        icon: GraduationCap,
      },
    ]
  }

  const stats = buildStats(data)

  return (
    <Section className="bg-white">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-4 leading-tight">
            {text.title}
          </h2>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto text-brand-muted">
            {text.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            const isLoadingState = isLoading || error

            return (
              <Card
                key={stat.key}
                className="text-center border border-brand-border/50 bg-white/80 backdrop-blur-sm shadow-elev-1 hover:shadow-elev-2 transition-all duration-200 rounded-2xl"
              >
                <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-6">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                    </div>
                  </div>
                  {isLoadingState ? (
                    <>
                      <div className="h-8 sm:h-10 md:h-12 mb-2 bg-brand-primary/5 rounded animate-pulse" />
                      <div className="h-4 mb-1 bg-brand-primary/5 rounded animate-pulse" />
                      <div className="h-3 bg-brand-primary/5 rounded animate-pulse" />
                    </>
                  ) : (
                    <>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-text mb-1 sm:mb-2">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-brand-text mb-1">
                        {stat.label}
                      </div>
                      <div className="text-xs text-brand-muted leading-tight">
                        {stat.description}
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
              {locale === 'nl' 
                ? 'Statistieken worden bijgewerkt...' 
                : 'Stats are being updated...'}
            </p>
          </div>
        )}
      </Container>
    </Section>
  )
}

