'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Zap, TrendingUp, MessageCircle, Shield, GraduationCap } from 'lucide-react'
import { useApp } from '@/app/providers'
import type { MarketingStatsResponse } from '@/app/api/marketing/stats/route'
import { cn } from '@/lib/utils'

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
  const reducedMotion = useReducedMotion()

  const { data, isLoading, error } = useQuery({
    queryKey: ['marketing-stats'],
    queryFn: fetchMarketingStats,
    staleTime: 60_000,
    retry: 2,
  })

  const content = {
    en: {
      title: 'Live platform stats',
      subtitle:
        'Real-time insights from our growing community of students finding their perfect roommates',
      stats: {
        speedMatch: {
          label: 'Get a match in <24 hours',
          description: (d: MarketingStatsResponse) => `and ${d.matchedWithin48hPercent}% within 48 hours`,
        },
        quality: {
          label: 'Confirmed match compatibility',
          description: (d: MarketingStatsResponse) => `vs ${d.avgScoreAllMatches}% across all matches`,
        },
        speedChat: {
          label: 'Matches that turn into a chat',
          description: () => 'within the first 24 hours',
        },
        verified: {
          label: 'Verified students',
          description: () => 'email or ID verified community',
        },
        reach: {
          label: 'Universities represented',
          description: (d: MarketingStatsResponse) =>
            `${d.programmesCount}+ study programmes on Domu Match`,
        },
      },
    },
    nl: {
      title: 'Live platformstatistieken',
      subtitle:
        'Real-time inzichten van onze groeiende community van studenten die hun perfecte huisgenoten vinden',
      stats: {
        speedMatch: {
          label: 'Krijg een match binnen <24 uur',
          description: (d: MarketingStatsResponse) => `en ${d.matchedWithin48hPercent}% binnen 48 uur`,
        },
        quality: {
          label: 'Compatibiliteit bevestigde matches',
          description: (d: MarketingStatsResponse) => `vs ${d.avgScoreAllMatches}% over alle matches`,
        },
        speedChat: {
          label: 'Matches die uitmonden in een chat',
          description: () => 'binnen de eerste 24 uur',
        },
        verified: {
          label: 'Geverifieerde studenten',
          description: () => 'e-mail of ID geverifieerde community',
        },
        reach: {
          label: 'Universiteiten vertegenwoordigd',
          description: (d: MarketingStatsResponse) =>
            `${d.programmesCount}+ studieprogramma's op Domu Match`,
        },
      },
    },
  }

  const text = content[locale]

  const buildStats = (apiData: MarketingStatsResponse | undefined) => {
    if (!apiData) {
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
        value: `${apiData.matchedWithin24hPercent}%`,
        label: text.stats.speedMatch.label,
        description: text.stats.speedMatch.description(apiData),
        icon: Zap,
      },
      {
        key: 'quality',
        value: `${apiData.avgScoreConfirmedMatches}%`,
        label: text.stats.quality.label,
        description: text.stats.quality.description(apiData),
        icon: TrendingUp,
      },
      {
        key: 'speedChat',
        value: `${apiData.matchesToChatWithin24hPercent}%`,
        label: text.stats.speedChat.label,
        description: text.stats.speedChat.description(),
        icon: MessageCircle,
      },
      {
        key: 'verified',
        value: `${apiData.verifiedUsersPercent}%`,
        label: text.stats.verified.label,
        description: text.stats.verified.description(),
        icon: Shield,
      },
      {
        key: 'reach',
        value: `${apiData.universitiesCount}`,
        label: text.stats.reach.label,
        description: text.stats.reach.description(apiData),
        icon: GraduationCap,
      },
    ]
  }

  const stats = buildStats(data)
  const isLoadingState = isLoading || error

  const itemVariants = {
    hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reducedMotion ? 0 : i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
  }

  return (
    <Section className="relative overflow-hidden bg-slate-950 py-16 md:py-24">
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/10 pointer-events-none"
        aria-hidden
      />

      <Container className="relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">Live</span> {locale === 'nl' ? 'platformstatistieken' : 'platform stats'}
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const isLast = index === stats.length - 1
            return (
              <motion.div
                key={stat.key}
                className={cn(
                  'glass noise-overlay p-5 md:p-6 flex flex-col items-center text-center min-h-[180px] md:min-h-[200px]',
                  'transition-all duration-300 hover:border-white/30 hover:bg-white/15',
                  isLast && stats.length === 5 && 'md:col-start-2 md:col-end-3 lg:col-start-auto lg:col-end-auto'
                )}
                variants={itemVariants}
                custom={index}
                whileHover={reducedMotion ? undefined : { scale: 1.03, y: -4 }}
              >
                <div className="flex justify-center mb-3 md:mb-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" aria-hidden />
                  </div>
                </div>
                {isLoadingState ? (
                  <>
                    <div className="h-8 md:h-10 w-16 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse mb-1" />
                    <div className="h-3 w-full max-w-[120px] bg-white/10 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2 tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-white/90 mb-1 line-clamp-2">
                      {stat.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/60 leading-tight line-clamp-2 flex-1">
                      {stat.description}
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {error && !isLoading && (
          <p className="text-center mt-6 text-sm text-white/50">
            {locale === 'nl' ? 'Statistieken worden bijgewerkt...' : 'Stats are being updated...'}
          </p>
        )}
      </Container>
    </Section>
  )
}
