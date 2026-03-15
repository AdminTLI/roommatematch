'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Zap, TrendingUp, BookOpen, Shield, Users } from 'lucide-react'
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
        'With a national shortage of over 410,000 homes, shared living is the future. We match you based on deep lifestyle compatibility, not just your budget. Real-time insights from our community of students and young professionals.',
      stats: {
        speedMatch: {
          label: 'Get a match within 24 hours',
          description: (d: MarketingStatsResponse) =>
            d.matchedWithin48hPercent > d.matchedWithin24hPercent
              ? `Most users see their first compatible roommate within a day. ${d.matchedWithin48hPercent}% get a match within 48 hours.`
              : `Most users see their first compatible roommate within a day - no long waiting.`,
        },
        quality: {
          label: 'Compatibility score on accepted matches',
          description: (d: MarketingStatsResponse) =>
            `When you both accept, the fit is strong - vs ${d.avgScoreAllMatches}% across all suggestions. We show you people you're likely to get along with.`,
        },
        programmes: {
          label: 'Study programmes on the platform',
          description: (d: MarketingStatsResponse) =>
            d.programmesCount > 0
              ? `Find roommates from your course or campus - ${d.universitiesCount}+ universities.`
              : `Find roommates from your course or campus.`,
        },
        verified: {
          label: 'Of users are ID-verified',
          description: () =>
            'Students and young professionals you can trust. We verify identity so you can focus on finding the right fit.',
        },
        community: {
          label: 'Users finding roommates',
          description: (d: MarketingStatsResponse) =>
            `Students and young professionals in our community - ${d.universitiesCount}+ universities.`,
        },
      },
    },
    nl: {
      title: 'Live platformstatistieken',
      subtitle:
        'Met een nationaal tekort van meer dan 410.000 woningen is gedeeld wonen de toekomst. Wij matchen op basis van diepgaande levensstijlcompatibiliteit, niet alleen je budget. Real-time inzichten van onze community van studenten en young professionals.',
      stats: {
        speedMatch: {
          label: 'Krijg een match binnen 24 uur',
          description: (d: MarketingStatsResponse) =>
            d.matchedWithin48hPercent > d.matchedWithin24hPercent
              ? `De meeste gebruikers zien hun eerste passende huisgenoot binnen een dag. ${d.matchedWithin48hPercent}% krijgt een match binnen 48 uur.`
              : `De meeste gebruikers zien hun eerste passende huisgenoot binnen een dag - geen lange wachttijd.`,
        },
        quality: {
          label: 'Compatibiliteitsscore bij geaccepteerde matches',
          description: (d: MarketingStatsResponse) =>
            `Als jullie allebei accepteren, is de match sterk - vs ${d.avgScoreAllMatches}% over alle suggesties. Wij tonen mensen waar je waarschijnlijk goed mee opschiet.`,
        },
        programmes: {
          label: 'Opleidingen op het platform',
          description: (d: MarketingStatsResponse) =>
            d.programmesCount > 0
              ? `Vind huisgenoten uit jouw opleiding of campus - ${d.universitiesCount}+ universiteiten.`
              : `Vind huisgenoten uit jouw opleiding of campus.`,
        },
        verified: {
          label: 'Van de gebruikers is ID-geverifieerd',
          description: () =>
            'Studenten en young professionals die je kunt vertrouwen. We verifiëren identiteit zodat jij je kunt richten op de juiste match.',
        },
        community: {
          label: 'Gebruikers die huisgenoten zoeken',
          description: (d: MarketingStatsResponse) =>
            `Studenten en young professionals in onze community - ${d.universitiesCount}+ universiteiten.`,
        },
      },
    },
  }

  const text = content[locale]

  const formatCommunityCount = (n: number): string => {
    if (n <= 0) return ' - '
    if (n >= 1000) return `${Math.floor(n / 1000)}k+`
    if (n >= 100) return `${Math.floor(n / 100) * 100}+`
    return `${n}+`
  }

  const formatProgrammesCount = (n: number): string => {
    if (n <= 0) return ' - '
    return `${n}+`
  }

  const buildStats = (apiData: MarketingStatsResponse | undefined) => {
    if (!apiData) {
      return [
        { key: 'speedMatch', value: '--', label: text.stats.speedMatch.label, description: '--', icon: Zap },
        { key: 'quality', value: '--', label: text.stats.quality.label, description: '--', icon: TrendingUp },
        { key: 'programmes', value: '--', label: text.stats.programmes.label, description: '--', icon: BookOpen },
        { key: 'verified', value: '--', label: text.stats.verified.label, description: '--', icon: Shield },
        { key: 'community', value: '--', label: text.stats.community.label, description: '--', icon: Users },
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
        key: 'programmes',
        value: formatProgrammesCount(apiData.programmesCount),
        label: text.stats.programmes.label,
        description: text.stats.programmes.description(apiData),
        icon: BookOpen,
      },
      {
        key: 'verified',
        value: `${apiData.verifiedUsersPercent}%`,
        label: text.stats.verified.label,
        description: text.stats.verified.description(),
        icon: Shield,
      },
      {
        key: 'community',
        value: formatCommunityCount(apiData.totalUsers),
        label: text.stats.community.label,
        description: text.stats.community.description(apiData),
        icon: Users,
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
    <Section className="relative overflow-hidden py-16 md:py-24">
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
                  'glass noise-overlay p-5 md:p-6 flex flex-col items-center text-center min-h-[200px] md:min-h-[240px]',
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
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 tabular-nums">
                      {stat.value}
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-white/95 mb-2 line-clamp-2" title={stat.label}>
                      {stat.label}
                    </p>
                    <p className="text-[11px] sm:text-xs text-white/65 leading-snug flex-1 min-h-0">
                      {stat.description}
                    </p>
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
