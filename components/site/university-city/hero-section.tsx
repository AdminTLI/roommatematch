'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'
import { useApp } from '@/app/providers'
import { cityPageUi } from './city-page-ui'

interface HeroSectionProps {
  city: CityContent
}

export function UniversityCityHero({ city }: HeroSectionProps) {
  const { locale } = useApp()
  const u = cityPageUi[locale]
  const reducedMotion = useReducedMotion()
  const motionConfig = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const motionInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }

  return (
    <Section
      className="relative min-h-[62vh] overflow-hidden flex flex-col justify-center py-10 md:py-14"
      aria-labelledby="city-hero-heading"
    >
      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 py-12 md:py-16">
          <motion.h1
            id="city-hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight"
            initial={motionInitial}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.6, ease: 'easeOut' }}
          >
            {u.heroTitleBefore}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700">
              {city.nameDisplay}
            </span>
            {u.heroTitleAfter ? ` ${u.heroTitleAfter}` : ''}
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto"
            initial={motionInitial}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.1, ease: 'easeOut' }}
          >
            {city.intro}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            initial={motionInitial}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            <Link
              href="/auth/sign-up"
              className={cn(
                'inline-flex items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold',
                'bg-slate-900 text-white',
                'shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90 transition-colors',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
              )}
            >
              {u.getStarted}
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                'inline-flex items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold',
                'bg-white/60 border border-white/70 text-slate-800 hover:bg-white/75 transition-colors',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
              )}
            >
              {u.howItWorks}
            </Link>
          </motion.div>
          <motion.div
            className="flex flex-wrap gap-6 justify-center pt-6 text-sm text-slate-700"
            initial={motionInitial}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-700" aria-hidden />
              <span>{u.trust1}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-700" aria-hidden />
              <span>{u.trust2}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-700" aria-hidden />
              <span>{u.trust3}</span>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
