'use client'

import { useEffect, useMemo, useState, type ElementType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Heart,
  Info,
  Sparkles,
  Users,
  Zap,
  Droplets,
  Volume2,
  Moon,
  Coffee,
  BookOpen,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const APP_SURFACE =
  'bg-white/92 backdrop-blur-2xl border border-white/80 shadow-[0_18px_70px_rgba(15,23,42,0.10)] rounded-[28px]'

type DimensionKey =
  | 'cleanliness'
  | 'noise'
  | 'guests'
  | 'sleep'
  | 'shared_spaces'
  | 'substances'
  | 'study_social'
  | 'home_vibe'

const dimensionConfig: Record<
  DimensionKey,
  {
    label: { en: string; nl: string }
    description: { en: string; nl: string }
    icon: ElementType
  }
> = {
  cleanliness: {
    label: { en: 'Cleanliness', nl: 'Netheid' },
    description: {
      en: 'Kitchen, bathroom, living areas.',
      nl: 'Keuken, badkamer, gezamenlijke ruimtes.',
    },
    icon: Droplets,
  },
  noise: {
    label: { en: 'Noise', nl: 'Geluid' },
    description: { en: 'Quiet hours, music, parties.', nl: 'Stilte, muziek, feestjes.' },
    icon: Volume2,
  },
  guests: {
    label: { en: 'Guests', nl: 'Gasten' },
    description: { en: 'Partners/friends staying over.', nl: 'Logés, partners/vrienden.' },
    icon: Users,
  },
  sleep: {
    label: { en: 'Sleep', nl: 'Slaap' },
    description: { en: 'Bedtime & wake-up rhythm.', nl: 'Slaapschema en ritme.' },
    icon: Moon,
  },
  shared_spaces: {
    label: { en: 'Shared spaces', nl: 'Gedeelde ruimtes' },
    description: { en: 'How you use common areas.', nl: 'Gebruik van gezamenlijke ruimtes.' },
    icon: Home,
  },
  substances: {
    label: { en: 'Substances', nl: 'Middelen' },
    description: { en: 'Comfort around alcohol etc.', nl: 'Comfort rond alcohol etc.' },
    icon: Coffee,
  },
  study_social: {
    label: { en: 'Study/Social', nl: 'Studie/Sociaal' },
    description: { en: 'Balance between focus and fun.', nl: 'Balans tussen focus en gezellig.' },
    icon: BookOpen,
  },
  home_vibe: {
    label: { en: 'Home vibe', nl: 'Huisvibe' },
    description: { en: 'Quiet retreat vs social hub.', nl: 'Rustig vs sociaal huis.' },
    icon: Heart,
  },
}

type Locale = 'en' | 'nl'

export type MatchesPreviewCardData = {
  name: string
  matchPercent: number
  harmonyPercent: number
  contextPercent: number
  contextLine: string
  highlights: string[]
  dimensions: Record<DimensionKey, number>
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-emerald-700'
  if (score >= 70) return 'text-indigo-700'
  if (score >= 55) return 'text-violet-700'
  return 'text-amber-700'
}

function barColor(score: number) {
  if (score >= 85) return 'bg-emerald-500'
  if (score >= 70) return 'bg-indigo-500'
  if (score >= 55) return 'bg-violet-500'
  return 'bg-amber-500'
}

function scoreLabel(score: number, locale: Locale) {
  const labels =
    locale === 'nl'
      ? { amazing: 'Top', great: 'Sterk', good: 'Goed', low: 'Laag' }
      : { amazing: 'Amazing', great: 'Great', good: 'Good', low: 'Low' }
  if (score >= 85) return labels.amazing
  if (score >= 70) return labels.great
  if (score >= 55) return labels.good
  return labels.low
}

function MiniBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 bg-white/70 rounded-full overflow-hidden border border-white/60', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={cn('h-full rounded-full', barColor(value))}
      />
    </div>
  )
}

export function MatchesPreviewCard({
  locale,
  data,
  className,
  heightClassName = 'h-[520px]',
  autoFlip = true,
  flipIntervalMs = 6500,
  float = true,
  interactive = true,
  variant = 'glass',
}: {
  locale: Locale
  data: MatchesPreviewCardData
  className?: string
  heightClassName?: string
  autoFlip?: boolean
  flipIntervalMs?: number
  float?: boolean
  interactive?: boolean
  variant?: 'glass' | 'match-screen'
}) {
  const reducedMotion = useReducedMotion()
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    if (reducedMotion) return
    if (!autoFlip) return
    if (flipIntervalMs < 1500) return

    const id = window.setInterval(() => {
      setIsFlipped((v) => !v)
    }, flipIntervalMs)
    return () => window.clearInterval(id)
  }, [autoFlip, flipIntervalMs, reducedMotion])

  const orderedDimensions = useMemo(() => {
    const keys: DimensionKey[] = [
      'cleanliness',
      'noise',
      'guests',
      'sleep',
      'shared_spaces',
      'substances',
      'study_social',
      'home_vibe',
    ]
    return keys.map((k) => ({ key: k, score: data.dimensions[k] }))
  }, [data.dimensions])

  const matchPercent = Math.max(0, Math.min(100, Math.round(data.matchPercent)))
  const harmonyPercent = Math.max(0, Math.min(100, Math.round(data.harmonyPercent)))
  const contextPercent = Math.max(0, Math.min(100, Math.round(data.contextPercent)))

  const isMatchScreen = variant === 'match-screen'

  return (
    <div
      className={cn('w-full', heightClassName, className, !interactive && 'select-none')}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full ease-in-out"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          y: reducedMotion || !float ? 0 : [0, -10, 0],
        }}
        transition={{
          rotateY: { duration: reducedMotion ? 0 : 0.65, ease: 'easeInOut' },
          y: reducedMotion || !float ? undefined : { duration: 7.5, ease: 'easeInOut', repeat: Infinity },
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <motion.div
            whileHover={
              reducedMotion || !interactive ? undefined : { y: -4, scale: 1.01 }
            }
            transition={{ duration: 0.2 }}
            className={cn(
              isMatchScreen ? APP_SURFACE : GLASS,
              'p-6 sm:p-8 h-full overflow-hidden',
              isMatchScreen &&
                'bg-[radial-gradient(circle_at_30%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.10),transparent_55%),radial-gradient(circle_at_40%_95%,rgba(251,146,60,0.10),transparent_55%)]'
            )}
          >
            {isMatchScreen ? (
              <>
                {/* Match score header */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.28em] text-slate-600">
                    <Zap className="h-4 w-4 text-indigo-500" aria-hidden />
                    {locale === 'nl' ? 'Match score' : 'Match score'}
                  </div>
                  <div className="mt-3 text-[72px] leading-none font-black tracking-tight tabular-nums text-indigo-700 drop-shadow-[0_16px_30px_rgba(49,46,129,0.14)]">
                    {matchPercent}%
                  </div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-white/70 border border-white/70 px-4 py-1.5 text-sm font-semibold text-slate-700">
                    {scoreLabel(matchPercent, locale)} {locale === 'nl' ? 'match' : 'match'}
                  </div>
                </div>

                {/* Name + context */}
                <div className="mt-6">
                  <div className="text-lg font-bold text-slate-900 truncate">{data.name}</div>
                  <div className="mt-1 text-sm text-slate-700">{data.contextLine}</div>
                </div>

                {/* Harmony stacked above Context */}
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Heart className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden />
                        <span className="text-sm font-semibold text-slate-800">
                          {locale === 'nl' ? 'Harmony' : 'Harmony'}
                        </span>
                        <span className={cn('text-sm font-bold tabular-nums', scoreColor(harmonyPercent))}>
                          {harmonyPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <MiniBar value={harmonyPercent} className="h-2.5 bg-slate-200/60 border-white/60" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 text-sky-600 flex-shrink-0" aria-hidden />
                        <span className="text-sm font-semibold text-slate-800">
                          {locale === 'nl' ? 'Context' : 'Context'}
                        </span>
                        <span className={cn('text-sm font-bold tabular-nums', scoreColor(contextPercent))}>
                          {contextPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <MiniBar value={contextPercent} className="h-2.5 bg-slate-200/60 border-white/60" />
                    </div>
                  </div>
                </div>

                {/* View details placeholder (above reasons) */}
                <div className="mt-6">
                  <div className="w-full rounded-2xl bg-slate-800/55 text-white/90 py-4 text-center font-semibold">
                    {locale === 'nl' ? 'Bekijk details' : 'View Details'}
                  </div>
                </div>

                {/* Why you match (below details) */}
                <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                    <Sparkles className="h-4 w-4 text-slate-800" aria-hidden />
                    {locale === 'nl' ? 'Waarom het klikt' : 'Why you match'}
                  </div>
                  <ul className="mt-4 space-y-3">
                    {data.highlights.slice(0, 3).map((h) => (
                      <li key={h} className="text-sm text-slate-800">
                        <span className="text-emerald-600 font-bold mr-3">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-slate-800 truncate">{data.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{data.contextLine}</div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="text-[56px] leading-none font-black tracking-tight tabular-nums bg-gradient-to-b from-indigo-600 via-violet-600 to-fuchsia-600 text-transparent bg-clip-text drop-shadow-[0_10px_22px_rgba(76,29,149,0.18)]">
                      {matchPercent}%
                    </div>
                    <div className="mt-1 inline-flex items-center rounded-full bg-white/70 border border-white/60 px-3 py-1 text-xs font-bold text-slate-700">
                      {scoreLabel(matchPercent, locale)} {locale === 'nl' ? 'match' : 'match'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/60 bg-white/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Heart className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden />
                    <span className="text-sm font-semibold text-slate-700">
                      {locale === 'nl' ? 'Harmony' : 'Harmony'}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              'flex-shrink-0 cursor-help rounded-full p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20',
                              !interactive && 'pointer-events-none opacity-60'
                            )}
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Harmony?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                          <p>
                            {locale === 'nl'
                              ? 'Hoe goed jullie dag-tot-dag matchen op de 8 dimensies.'
                              : 'How well you match day-to-day across the 8 dimensions.'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className={cn('text-sm font-bold', scoreColor(data.harmonyPercent))}>
                    {data.harmonyPercent}%
                  </span>
                </div>
                <div className="mt-3">
                  <MiniBar value={data.harmonyPercent} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-4 w-4 text-sky-600 flex-shrink-0" aria-hidden />
                    <span className="text-sm font-semibold text-slate-700">
                      {locale === 'nl' ? 'Context' : 'Context'}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              'flex-shrink-0 cursor-help rounded-full p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20',
                              !interactive && 'pointer-events-none opacity-60'
                            )}
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Context?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                          <p>
                            {locale === 'nl'
                              ? 'Dingen zoals opleiding/werkcontext en overlap in voorkeuren.'
                              : 'Things like study/work context and overlap in preferences.'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className={cn('text-sm font-bold', scoreColor(data.contextPercent))}>
                    {data.contextPercent}%
                  </span>
                </div>
                <div className="mt-3">
                  <MiniBar value={data.contextPercent} />
                </div>
              </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/60 bg-white/50 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <Sparkles className="h-4 w-4 text-slate-800" aria-hidden />
                    {locale === 'nl' ? 'Waarom het klikt' : 'Why you match'}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {data.highlights.slice(0, 3).map((h) => (
                      <li key={h} className="text-sm text-slate-700">
                        <span className="text-emerald-600 font-bold mr-2">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    className="w-full bg-slate-900 text-white hover:bg-slate-900/90 rounded-2xl"
                    disabled={!interactive}
                    aria-disabled={!interactive}
                    tabIndex={interactive ? 0 : -1}
                    onClick={interactive ? () => setIsFlipped(true) : undefined}
                  >
                    {locale === 'nl' ? 'Bekijk details' : 'View details'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className={cn(isMatchScreen ? APP_SURFACE : GLASS, 'p-6 sm:p-8 h-full overflow-hidden')}>
            {isMatchScreen ? (
              <div className="flex flex-col h-full">
                <div className="text-2xl font-bold text-slate-900">
                  {locale === 'nl' ? 'User details' : 'User Details'}
                </div>

                {/* Harmony + Context side by side */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Heart className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden />
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {locale === 'nl' ? 'Harmony' : 'Harmony'}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-indigo-700 tabular-nums">{harmonyPercent}%</div>
                    </div>
                    <div className="mt-4">
                      <MiniBar value={harmonyPercent} className="h-2.5 bg-slate-200/60 border-white/60" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 text-sky-600 flex-shrink-0" aria-hidden />
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {locale === 'nl' ? 'Context' : 'Context'}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-amber-700 tabular-nums">{contextPercent}%</div>
                    </div>
                    <div className="mt-4">
                      <MiniBar value={contextPercent} className="h-2.5 bg-slate-200/60 border-white/60" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm font-semibold text-slate-800">
                  {locale === 'nl' ? 'Detailed dimension scores' : 'Detailed Dimension Scores'}
                </div>

                {/* Dimensions (scroll inside card only) */}
                <div className="mt-4 flex-1 overflow-auto pr-1 scrollbar-hide">
                  <div className="space-y-4 pb-1">
                    {orderedDimensions.map(({ key, score }) => {
                      const cfg = dimensionConfig[key]
                      const Icon = cfg.icon
                      const s = Math.max(0, Math.min(100, Math.round(score)))
                      return (
                        <div key={key} className="rounded-2xl border border-white/70 bg-white/70 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className="h-4 w-4 text-slate-700 flex-shrink-0" aria-hidden />
                              <div className="text-sm font-semibold text-slate-800 truncate">
                                {cfg.label[locale]}
                              </div>
                            </div>
                            <div className={cn('text-sm font-bold tabular-nums', scoreColor(s))}>{s}%</div>
                          </div>
                          <div className="mt-4">
                            <MiniBar value={s} className="h-2.5 bg-slate-200/60 border-white/60" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full rounded-2xl bg-indigo-600/90 text-white py-4 text-center font-semibold">
                    {locale === 'nl' ? 'Terug naar profiel' : 'Back to Profile'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-slate-800">
                      {locale === 'nl' ? 'Waarom je matcht' : 'Why you match'}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {locale === 'nl'
                        ? 'Harmony, context en 8 dimensies.'
                        : 'Harmony, context, and 8 dimensions.'}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white/50 border-white/60 text-slate-800 hover:bg-white/70 rounded-2xl"
                    disabled={!interactive}
                    aria-disabled={!interactive}
                    tabIndex={interactive ? 0 : -1}
                    onClick={interactive ? () => setIsFlipped(false) : undefined}
                  >
                    {locale === 'nl' ? 'Terug' : 'Back'}
                  </Button>
                </div>

                {/* Brief overview: Harmony + Context */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/60 bg-white/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Heart className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden />
                        <div className="text-sm font-semibold text-slate-700 truncate">
                          {locale === 'nl' ? 'Harmony' : 'Harmony'}
                        </div>
                      </div>
                      <div className={cn('text-sm font-bold', scoreColor(data.harmonyPercent))}>{data.harmonyPercent}%</div>
                    </div>
                    <div className="mt-2">
                      <MiniBar value={data.harmonyPercent} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 text-sky-600 flex-shrink-0" aria-hidden />
                        <div className="text-sm font-semibold text-slate-700 truncate">
                          {locale === 'nl' ? 'Context' : 'Context'}
                        </div>
                      </div>
                      <div className={cn('text-sm font-bold', scoreColor(data.contextPercent))}>{data.contextPercent}%</div>
                    </div>
                    <div className="mt-2">
                      <MiniBar value={data.contextPercent} />
                    </div>
                  </div>
                </div>

                {/* Dimensions (scroll inside card only) */}
                <div className="mt-4 flex-1 overflow-auto pr-1 scrollbar-hide">
                  <div className="grid grid-cols-1 gap-4 pb-1">
                    {orderedDimensions.map(({ key, score }) => {
                      const cfg = dimensionConfig[key]
                      const Icon = cfg.icon
                      return (
                        <div
                          key={key}
                          className="rounded-2xl border border-white/60 bg-white/50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon
                                  className="h-4 w-4 text-slate-700 flex-shrink-0"
                                  aria-hidden
                                />
                                <div className="text-sm font-semibold text-slate-800 truncate">
                                  {cfg.label[locale]}
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className={cn(
                                          'flex-shrink-0 cursor-help rounded-full p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20',
                                          !interactive && 'pointer-events-none opacity-60'
                                        )}
                                      >
                                        <Info className="h-3.5 w-3.5" aria-hidden />
                                        <span className="sr-only">Info</span>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                                      <p>{cfg.description[locale]}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {scoreLabel(score, locale)}
                              </div>
                            </div>
                            <div className={cn('text-sm font-bold', scoreColor(score))}>{score}%</div>
                          </div>
                          <div className="mt-3">
                            <MiniBar value={score} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

