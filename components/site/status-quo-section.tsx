'use client'

import { useMemo, useState } from 'react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { CheckCircle2, UserRoundX } from 'lucide-react'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

const content = {
  en: {
    eyebrow: 'Skip the awkward part',
    title: 'Stop treating home like a housing lottery.',
    subtitle:
      'Skip the chaotic Facebook groups and awkward interviews. We match verified students and professionals based on the lifestyle habits that actually make a home work.',
    oldWay: {
      title: 'The Old Way',
      items: ['Awkward interviews', 'Random group chats', 'Ghosting & catfish'],
      label: 'Old-school roommate hunt',
      chips: ['Facebook groups', 'Friends-of-friends', 'Viewing roulette'],
    },
    domuWay: {
      title: 'The Domu Way',
      items: ['Verified profiles only', 'Clear match reasons', 'Start with safe chat'],
      chips: ['ID & selfie', 'Harmony & context', '8 dimensions'],
    },
    footer: '✓ 100% ID Verified Users\n✓ Match on 8 different dimensions',
  },
  nl: {
    eyebrow: 'Sla het ongemakkelijke over',
    title: 'Stop met wonen als een woning-loterij.',
    subtitle: 'Ontmoet geverifieerde huisgenoten. Zie waarom je matcht.',
    oldWay: {
      title: 'De oude manier',
      items: ['Awkward interviews', 'Random groepschats', 'Ghosting & catfish'],
      label: 'Ouderwets huisgenoten zoeken',
      chips: ['Facebook-groepen', 'Via-via', 'Bezichtigingsroulette'],
    },
    domuWay: {
      title: 'De Domu manier',
      items: ['Alleen geverifieerde profielen', 'Duidelijke match-redenen', 'Start met veilige chat'],
      chips: ['ID & selfie', 'Harmony & context', '8 dimensies'],
    },
    footer: 'Meer duidelijkheid. Meer rust thuis.',
  },
}

export function StatusQuoSection() {
  const { locale } = useApp()
  const t = content[locale]
  const reducedMotion = useReducedMotion()
  const [side, setSide] = useState<'old' | 'domu'>('old')

  const card = useMemo(() => {
    if (side === 'old') {
      return {
        key: 'old' as const,
        title: t.oldWay.title,
        accent: 'bg-[radial-gradient(circle_at_20%_0%,rgba(244,63,94,0.12),transparent_86%)]',
        items: t.oldWay.items,
        label: t.oldWay.label,
        chips: t.oldWay.chips,
      }
    }
    return {
      key: 'domu' as const,
      title: t.domuWay.title,
      accent: 'bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.14),transparent_86%)]',
      items: t.domuWay.items,
      label: locale === 'nl' ? 'In-app preview' : 'In-app preview',
      chips: t.domuWay.chips,
    }
  }, [locale, side, t.domuWay.chips, t.domuWay.items, t.domuWay.title, t.oldWay.chips, t.oldWay.items, t.oldWay.title])

  return (
    <Section className="py-14 md:py-20 lg:py-24">
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-start">
          {/* Comparison deck (left) */}
          <div className="space-y-4">
            {/* Segmented toggle (fallback + accessibility) */}
            <div className={cn(GLASS, 'p-2')}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide('old')}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-left transition-colors border',
                    side === 'old'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white/50 text-slate-800 border-white/60 hover:bg-white/70'
                  )}
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em]">
                    {t.oldWay.title}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold opacity-80">
                    {locale === 'nl' ? 'Swipe →' : 'Swipe →'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSide('domu')}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-left transition-colors border',
                    side === 'domu'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white/50 text-slate-800 border-white/60 hover:bg-white/70'
                  )}
                >
                  <div className="text-xs font-bold uppercase tracking-[0.16em]">
                    {t.domuWay.title}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold opacity-80">
                    {locale === 'nl' ? '← Swipe' : '← Swipe'}
                  </div>
                </button>
              </div>
            </div>

            {/* Swipeable card */}
            <motion.div
              className={cn(GLASS, 'p-7 relative overflow-hidden select-none')}
              style={{ touchAction: 'pan-y' }}
              drag={reducedMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (reducedMotion) return
                const dx = info.offset.x
                if (dx < -60) setSide('domu')
                if (dx > 60) setSide('old')
              }}
            >
              <div aria-hidden className={cn('absolute inset-0', card.accent)} />
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={card.key}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: side === 'old' ? -12 : 12 }}
                    animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: side === 'old' ? 12 : -12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <h3 className="text-lg font-bold text-slate-800">{card.title}</h3>

                    <ul className="mt-5 space-y-3">
                      {card.items.map((x) => (
                        <li key={x} className="flex items-center gap-3">
                          <span className="inline-flex h-7 w-7 rounded-2xl border border-white/60 bg-white/60 items-center justify-center">
                            {card.key === 'old' ? (
                              <UserRoundX className="h-4 w-4 text-rose-600" aria-hidden />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                            )}
                          </span>
                          <span className="text-slate-800 text-sm leading-relaxed">{x}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 rounded-2xl border border-white/70 bg-white/50 p-4 text-left">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 text-left">
                        {card.label}
                      </div>
                      <div className="mt-3 text-sm font-normal text-slate-700 text-left">
                        {card.chips.join(' • ')}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Headline copy (right) */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-800 leading-[1.05]">
              {t.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl">
              {t.subtitle}
            </p>

          </div>
        </div>
      </Container>
    </Section>
  )
}

