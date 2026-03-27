 'use client'
 
import { useMemo, useState, type ElementType } from 'react'
import Link from 'next/link'
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
 
const APP_SURFACE =
  'bg-white/92 backdrop-blur-2xl border border-white/80 shadow-[0_18px_70px_rgba(15,23,42,0.10)] rounded-[28px]'
 
const HARMONY_TOOLTIP =
  'Measures how well your day-to-day living preferences align - cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe.'
const CONTEXT_TOOLTIP =
  'Measures how similar your academic context is - university, programme, and study year.'

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
      en: 'Measures how well your cleanliness standards align across shared spaces like kitchen, bathroom, and living areas.',
      nl: 'Measures how well your cleanliness standards align across shared spaces like kitchen, bathroom, and living areas.',
     },
     icon: Droplets,
   },
   noise: {
     label: { en: 'Noise', nl: 'Geluid' },
    description: {
      en: 'Assesses compatibility around noise sensitivity, including preferences for parties, music volume, and quiet hours.',
      nl: 'Assesses compatibility around noise sensitivity, including preferences for parties, music volume, and quiet hours.',
    },
     icon: Volume2,
   },
   guests: {
     label: { en: 'Guests', nl: 'Gasten' },
    description: {
      en: 'Evaluates alignment on how often friends, partners, or visitors stay overnight and use shared spaces.',
      nl: 'Evaluates alignment on how often friends, partners, or visitors stay overnight and use shared spaces.',
    },
     icon: Users,
   },
   sleep: {
     label: { en: 'Sleep', nl: 'Slaap' },
    description: {
      en: 'Compares sleep schedule compatibility, including wake-up times and bedtimes (early bird vs night owl preferences).',
      nl: 'Compares sleep schedule compatibility, including wake-up times and bedtimes (early bird vs night owl preferences).',
    },
     icon: Moon,
   },
   shared_spaces: {
     label: { en: 'Shared spaces', nl: 'Gedeelde ruimtes' },
    description: {
      en: 'Measures preferences for using common areas versus private spaces and how you like to utilize shared living areas.',
      nl: 'Measures preferences for using common areas versus private spaces and how you like to utilize shared living areas.',
    },
     icon: Home,
   },
   substances: {
     label: { en: 'Substances', nl: 'Middelen' },
    description: {
      en: 'Assesses comfort levels and boundaries around alcohol consumption or other substances within the home environment.',
      nl: 'Assesses comfort levels and boundaries around alcohol consumption or other substances within the home environment.',
    },
     icon: Coffee,
   },
   study_social: {
     label: { en: 'Study/Social', nl: 'Studie/Sociaal' },
    description: {
      en: 'Evaluates the balance between study time and social activities, and how these priorities align in daily life.',
      nl: 'Evaluates the balance between study time and social activities, and how these priorities align in daily life.',
    },
     icon: BookOpen,
   },
   home_vibe: {
     label: { en: 'Home vibe', nl: 'Huisvibe' },
    description: {
      en: 'Compares home atmosphere preferences, whether you prefer a quiet retreat for focus or a social hub for interaction.',
      nl: 'Compares home atmosphere preferences, whether you prefer a quiet retreat for focus or a social hub for interaction.',
    },
     icon: Heart,
   },
 }
 
 type Locale = 'en' | 'nl'
 
 export type PlatformPreviewCardData = {
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
  const v = Math.max(0, Math.min(100, value))
   return (
     <div
       className={cn('h-2 bg-white/70 rounded-full overflow-hidden border border-white/60', className)}
     >
      <div className={cn('h-full rounded-full', barColor(v))} style={{ width: `${v}%` }} />
     </div>
   )
 }
 
 export function PlatformPreviewCard({
   locale,
   data,
   className,
   heightClassName = 'h-[520px]',
 }: {
   locale: Locale
   data: PlatformPreviewCardData
   className?: string
   heightClassName?: string
 }) {
  const [showDetails, setShowDetails] = useState(false)
 
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
 
  return (
   <div
     className={cn('w-full', heightClassName, className, 'select-none')}
     style={{ perspective: '1000px', WebkitPerspective: '1000px' }}
   >
      <div
        className="relative w-full h-full ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: showDetails ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s ease-in-out',
          willChange: 'transform',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(1px)',
          }}
        >
          <div
            className={cn(
              APP_SURFACE,
              'p-6 sm:p-8 h-full overflow-hidden flex flex-col',
              'bg-[radial-gradient(circle_at_30%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.10),transparent_55%),radial-gradient(circle_at_40%_95%,rgba(251,146,60,0.10),transparent_55%)]'
            )}
          >
            {/* Match score header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.28em] text-slate-600">
                <Zap className="h-4 w-4 text-indigo-500" aria-hidden />
                {locale === 'nl' ? 'Match score' : 'Match score'}
              </div>
              <div className="mt-3 text-[68px] leading-none font-black tracking-tight tabular-nums text-indigo-700 drop-shadow-[0_16px_30px_rgba(49,46,129,0.14)]">
                {matchPercent}%
              </div>
              <div className="mt-2 inline-flex items-center rounded-full bg-white/70 border border-white/70 px-4 py-1.5 text-sm font-semibold text-slate-700">
                {scoreLabel(matchPercent, locale)} {locale === 'nl' ? 'match' : 'match'}
              </div>
            </div>

            {/* Harmony + Context stacked rows */}
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Heart className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden />
                    <div className="text-sm font-semibold text-slate-800">
                      {locale === 'nl' ? 'Harmony' : 'Harmony'}
                    </div>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 cursor-help rounded-full p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Harmony?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                          <p>
                            {locale === 'nl'
                              ? HARMONY_TOOLTIP
                              : HARMONY_TOOLTIP}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-sm font-bold text-indigo-700 tabular-nums">{harmonyPercent}%</div>
                </div>
                <div className="mt-3">
                  <MiniBar value={harmonyPercent} className="h-2.5 bg-slate-200/70 border-white/60" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-4 w-4 text-sky-600 flex-shrink-0" aria-hidden />
                    <div className="text-sm font-semibold text-slate-800">
                      {locale === 'nl' ? 'Context' : 'Context'}
                    </div>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 cursor-help rounded-full p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Context?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                          <p>
                            {locale === 'nl'
                              ? CONTEXT_TOOLTIP
                              : CONTEXT_TOOLTIP}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-sm font-bold text-amber-700 tabular-nums">{contextPercent}%</div>
                </div>
                <div className="mt-3">
                  <MiniBar value={contextPercent} className="h-2.5 bg-slate-200/70 border-white/60" />
                </div>
              </div>
            </div>

            {/* View details button */}
            <div className="mt-4">
              <button
                type="button"
                className="w-full rounded-2xl py-3 text-center font-semibold text-white shadow-[0_14px_40px_rgba(124,58,237,0.28)] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
                onClick={() => setShowDetails(true)}
              >
                {locale === 'nl' ? 'Bekijk details' : 'View Details'}
              </button>
            </div>

            {/* Why you match */}
            <div className="mt-4 pt-3 border-t border-slate-200/50">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-slate-600">
                <Sparkles className="h-4 w-4 text-slate-800" aria-hidden />
                {locale === 'nl' ? 'Waarom het klikt' : 'Why you match'}
              </div>
              <ul className="mt-3 space-y-2">
                {data.highlights.slice(0, 3).map((h) => (
                  <li key={h} className="text-[13px] leading-relaxed text-slate-800">
                    <span className="text-emerald-600 font-bold mr-3">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat button placeholder */}
            <div className="pt-4">
              <Button
                asChild
                className="w-full rounded-2xl py-3 h-auto text-center font-semibold text-white shadow-[0_14px_40px_rgba(124,58,237,0.22)] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-95"
              >
                <Link href="/auth/sign-up">{locale === 'nl' ? 'Chat' : 'Chat'}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
            WebkitTransform: 'rotateY(180deg) translateZ(1px)',
          }}
        >
          <div
            className={cn(
              APP_SURFACE,
              'p-6 sm:p-8 h-full overflow-hidden flex flex-col',
              'bg-[radial-gradient(circle_at_30%_0%,rgba(99,102,241,0.08),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.08),transparent_55%),radial-gradient(circle_at_40%_95%,rgba(251,146,60,0.08),transparent_55%)]'
            )}
          >
            <div className="text-2xl font-bold text-slate-900">
              {locale === 'nl' ? 'User details' : 'User Details'}
            </div>

            {/* Harmony + Context side-by-side */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-nowrap items-center gap-2 min-w-0">
                    <Heart className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden />
                    <div className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                      {locale === 'nl' ? 'Harmony' : 'Harmony'}
                    </div>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 cursor-help rounded-full p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Harmony?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                          <p>
                            {locale === 'nl'
                              ? HARMONY_TOOLTIP
                              : HARMONY_TOOLTIP}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-sm font-bold text-indigo-700 tabular-nums">{harmonyPercent}%</div>
                </div>
                <div className="mt-4">
                  <MiniBar value={harmonyPercent} className="h-2.5 bg-slate-200/60 border-white/60" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-nowrap items-center gap-2 min-w-0">
                    <Users className="h-4 w-4 text-sky-600 flex-shrink-0" aria-hidden />
                    <div className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                      {locale === 'nl' ? 'Context' : 'Context'}
                    </div>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 cursor-help rounded-full p-1.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Context?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                          <p>
                            {locale === 'nl'
                              ? CONTEXT_TOOLTIP
                              : CONTEXT_TOOLTIP}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-sm font-bold text-amber-700 tabular-nums">{contextPercent}%</div>
                </div>
                <div className="mt-4">
                  <MiniBar value={contextPercent} className="h-2.5 bg-slate-200/60 border-white/60" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Sparkles className="h-4 w-4 text-slate-800" aria-hidden />
              {locale === 'nl' ? 'Detailed dimension scores' : 'Detailed Dimension Scores'}
            </div>

            {/* Detailed dimensions list */}
            <div className="mt-4 flex-1 overflow-auto pr-1 scrollbar-hide">
              <div className="space-y-3 pb-1">
                {orderedDimensions.map(({ key, score }) => {
                  const cfg = dimensionConfig[key]
                  const Icon = cfg.icon
                  const s = Math.max(0, Math.min(100, Math.round(score)))
                  return (
                    <div key={key} className="rounded-2xl border border-white/70 bg-white/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="flex-shrink-0 cursor-help rounded-full p-1.5 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                                >
                                  <Icon className="h-4 w-4 text-slate-700" aria-hidden />
                                  <span className="sr-only">Info</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-white border border-slate-200 text-slate-800 text-xs shadow-lg">
                                <p>{cfg.description[locale]}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="text-sm font-semibold text-slate-800 truncate">
                            {cfg.label[locale]}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-slate-800 tabular-nums">{s}%</div>
                      </div>
                      <div className="mt-3">
                        <MiniBar value={s} className="h-2.5 bg-slate-200/60 border-white/60" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full rounded-2xl bg-indigo-600/90 text-white py-4 text-center font-semibold"
                onClick={() => setShowDetails(false)}
              >
                {locale === 'nl' ? 'Terug naar profiel' : 'Back to Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
   )
 }
 
