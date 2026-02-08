'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { cn } from '@/lib/utils'
import type { CityContent } from './content'

interface HeroSectionProps {
  city: CityContent
}

export function UniversityCityHero({ city }: HeroSectionProps) {
  const reducedMotion = useReducedMotion()
  const motionConfig = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const motionInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }

  return (
    <Section
      className="relative min-h-[70vh] overflow-hidden flex flex-col justify-center bg-gradient-to-br from-slate-950 via-indigo-950/50 via-purple-950/40 to-indigo-950/50"
      aria-labelledby="city-hero-heading"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            'absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px]',
            !reducedMotion && 'animate-pulse'
          )}
        />
        <div
          className={cn(
            'absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px]',
            !reducedMotion && 'animate-pulse'
          )}
          style={!reducedMotion ? { animationDelay: '1s' } : undefined}
        />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[80px]" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 py-12 md:py-16">
          <motion.h1
            id="city-hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight"
            initial={motionInitial}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.6, ease: 'easeOut' }}
          >
            Find Your Perfect Roommate in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {city.nameDisplay}
            </span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto"
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
                'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
                'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              Get Started Free
            </Link>
            <Link
              href="/how-it-works"
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
                'bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              How It Works
            </Link>
          </motion.div>
          <motion.div
            className="flex flex-wrap gap-6 justify-center pt-6 text-sm text-white/80"
            initial={motionInitial}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-400" aria-hidden />
              <span>Free for students</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-400" aria-hidden />
              <span>Verified students only</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-400" aria-hidden />
              <span>Science-backed matching</span>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
