 'use client'
 
import { useEffect, useMemo, useRef, useState, type ElementType } from 'react'
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
 import { cn } from '@/lib/utils'
 
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
 
 export type SocialHeroPreviewCardData = {
   name: string
   matchPercent: number
   harmonyPercent: number
   contextPercent: number
   contextLine: string
   highlights: string[]
   dimensions: Record<DimensionKey, number>
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
   const bar =
     v >= 85 ? 'bg-emerald-500' : v >= 70 ? 'bg-indigo-500' : v >= 55 ? 'bg-violet-500' : 'bg-amber-500'
   return (
     <div className={cn('h-2 bg-white/70 rounded-full overflow-hidden border border-white/60', className)}>
       <motion.div
         initial={{ width: 0 }}
         animate={{ width: `${v}%` }}
         transition={{ duration: 0.7, ease: 'easeOut' }}
         className={cn('h-full rounded-full', bar)}
       />
     </div>
   )
 }
 
 export function SocialHeroPreviewCard({
   locale,
   data,
   className,
   heightClassName = 'h-[560px]',
   autoFlip = true,
   flipIntervalMs = 6500,
   float = true,
 }: {
   locale: Locale
   data: SocialHeroPreviewCardData
   className?: string
   heightClassName?: string
   autoFlip?: boolean
   flipIntervalMs?: number
   float?: boolean
 }) {
   const reducedMotion = useReducedMotion()
   const [isFlipped, setIsFlipped] = useState(false)
  const dimensionsListRef = useRef<HTMLDivElement>(null)
 
   useEffect(() => {
     if (reducedMotion) return
     if (!autoFlip) return
     if (flipIntervalMs < 1500) return
 
     const id = window.setInterval(() => {
       setIsFlipped((v) => !v)
     }, flipIntervalMs)
     return () => window.clearInterval(id)
   }, [autoFlip, flipIntervalMs, reducedMotion])

  useEffect(() => {
    if (!isFlipped) return
    dimensionsListRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [isFlipped])
 
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
     <div className={cn('w-full', heightClassName, className, 'select-none')} style={{ perspective: '1000px' }}>
       <motion.div
         className="relative w-full h-full ease-in-out"
         style={{ transformStyle: 'preserve-3d' }}
         animate={{
           rotateY: isFlipped ? 180 : 0,
           y: reducedMotion || !float ? 0 : [0, -10, 0],
         }}
         transition={{
           rotateY: { duration: reducedMotion ? 0 : 0.65, ease: 'easeInOut' },
           y:
             reducedMotion || !float
               ? undefined
               : { duration: 7.5, ease: 'easeInOut', repeat: Infinity },
         }}
       >
         {/* Front */}
         <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
           <motion.div
             transition={{ duration: 0.2 }}
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

            {/* Harmony (stacked list row) */}
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Heart className="h-4 w-4 text-rose-600 flex-shrink-0" aria-hidden />
                    <div className="text-sm font-semibold text-slate-800">
                      {locale === 'nl' ? 'Harmony' : 'Harmony'}
                    </div>
                    <Info className="h-3.5 w-3.5 text-slate-400 opacity-60" aria-hidden />
                  </div>
                  <div className="text-sm font-bold text-indigo-700 tabular-nums">
                    {harmonyPercent}%
                  </div>
                </div>
                <div className="mt-3">
                  <MiniBar
                    value={harmonyPercent}
                    className="h-2.5 bg-slate-200/70 border-white/60"
                  />
                </div>
              </div>

              {/* Context (stacked list row) */}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-4 w-4 text-sky-600 flex-shrink-0" aria-hidden />
                    <div className="text-sm font-semibold text-slate-800">
                      {locale === 'nl' ? 'Context' : 'Context'}
                    </div>
                    <Info className="h-3.5 w-3.5 text-slate-400 opacity-60" aria-hidden />
                  </div>
                  <div className="text-sm font-bold text-amber-700 tabular-nums">
                    {contextPercent}%
                  </div>
                </div>
                <div className="mt-3">
                  <MiniBar
                    value={contextPercent}
                    className="h-2.5 bg-slate-200/70 border-white/60"
                  />
                </div>
              </div>
            </div>

            {/* View details placeholder (must be above Why you match) */}
            <div className="mt-5">
              <div
                className="w-full rounded-2xl py-3.5 text-center font-semibold text-white shadow-[0_14px_40px_rgba(124,58,237,0.28)] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
                aria-hidden
              >
                {locale === 'nl' ? 'Bekijk details' : 'View Details'}
              </div>
            </div>

            {/* Why you match (below details) */}
            <div className="mt-5 pt-4 border-t border-slate-200/50 flex-1 min-h-0 overflow-hidden">
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

            {/* Chat placeholder (bottom, like screenshot) */}
            <div className="pt-5">
              <div
                className="w-full rounded-2xl py-3.5 text-center font-semibold text-white shadow-[0_14px_40px_rgba(124,58,237,0.22)] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"
                aria-hidden
              >
                {locale === 'nl' ? 'Chat' : 'Chat'}
              </div>
            </div>
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
          <div
            className={cn(
              APP_SURFACE,
              'p-6 sm:p-8 h-full overflow-hidden',
              'bg-[radial-gradient(circle_at_30%_0%,rgba(99,102,241,0.08),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.08),transparent_55%),radial-gradient(circle_at_40%_95%,rgba(251,146,60,0.08),transparent_55%)]'
            )}
          >
            <div className="flex flex-col h-full">
              <div className="text-2xl font-bold text-slate-900">
                {locale === 'nl' ? 'User details' : 'User Details'}
              </div>

              {/* Harmony + Context side-by-side */}
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

              {/* Detailed dimensions list (static, no internal scroll) */}
              <div ref={dimensionsListRef} className="mt-4 flex-1 min-h-0 overflow-hidden">
                <div className="space-y-2">
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
                          <div className="text-sm font-bold text-slate-800 tabular-nums">{s}%</div>
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
                <div className="w-full rounded-2xl bg-indigo-600/90 text-white py-4 text-center font-semibold" aria-hidden>
                  {locale === 'nl' ? 'Terug naar profiel' : 'Back to Profile'}
                </div>
              </div>
            </div>
          </div>
         </div>
       </motion.div>
     </div>
   )
 }
 
