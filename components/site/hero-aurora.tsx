'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { GraduationCap, Briefcase } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    headline: 'Find a roommate you actually want to live with.',
    subtext: 'The smart matching platform for verified students and young professionals navigating the Dutch housing crisis.',
    ctaStudent: 'I am a Student',
    ctaProfessional: 'I am a Professional',
    forEducation: 'For Education',
    educationCopy: 'Reduce dropouts with data-driven wellbeing insights.',
    partnerWithUs: 'Partner With Us',
  },
  nl: {
    headline: 'Vind een huisgenoot waar je écht mee wilt wonen.',
    subtext: 'Het slimme matchingplatform voor geverifieerde studenten en young professionals in de Nederlandse wooncrisis.',
    ctaStudent: 'Ik ben Student',
    ctaProfessional: 'Ik ben Professional',
    forEducation: 'Voor Onderwijs',
    educationCopy: 'Minder uitval met data-gedreven welzijnsinzichten.',
    partnerWithUs: 'Partner Met Ons',
  },
}

export function HeroAurora() {
  const { locale } = useApp()
  const reducedMotion = useReducedMotion()
  const t = content[locale]
  const [hoveredCard, setHoveredCard] = useState<'students' | 'universities' | null>(null)
  const motionConfig = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const motionInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const motionInitialButtons = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32 }

  return (
    <section
      className="relative min-h-screen overflow-hidden pt-16 md:pt-20 flex flex-col items-center justify-center"
      aria-label="Hero"
    >
      {/* Mesh gradient base */}
      <div
        className={cn(
          'absolute inset-0 transition-[background] duration-700 ease-out',
          hoveredCard === 'students' && 'bg-gradient-to-br from-slate-900 via-indigo-900/40 to-purple-950',
          hoveredCard === 'universities' && 'bg-gradient-to-br from-slate-950 via-blue-950/60 to-slate-900',
          !hoveredCard && 'bg-gradient-to-br from-slate-950 via-indigo-950/50 via-purple-950/40 to-indigo-950/50'
        )}
      />
      {/* Gradient orbs for depth - no animation when reduced motion */}
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

      <Container className="relative z-10 flex flex-col items-center justify-center py-12 md:py-16">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center tracking-tight max-w-4xl mb-6"
          initial={motionInitial}
          animate={motionConfig}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: 'easeOut' }}
        >
          {locale === 'en' ? (
            <>Find a roommate you actually <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">want to live with.</span></>
          ) : (
            <>Vind een huisgenoot waar je <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">écht mee wilt wonen.</span></>
          )}
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-white/80 text-center max-w-2xl mb-12 md:mb-16"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={motionConfig}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.1, ease: 'easeOut' }}
        >
          {t.subtext}
        </motion.p>

        {/* Dual CTA: Student (primary) + Professional (secondary glass) */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center items-center"
          initial={motionInitialButtons}
          animate={motionConfig}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
        >
          <Link
            href="/auth/sign-up?type=student"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold w-full sm:w-auto min-h-[52px]',
              'bg-white/10 backdrop-blur-md border border-white/20 text-white',
              'bg-gradient-to-r from-indigo-500 to-purple-500 border-0 shadow-lg shadow-indigo-500/30',
              'hover:scale-[1.02] hover:shadow-indigo-500/40 transition-all duration-200',
              'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
            )}
            onMouseEnter={() => setHoveredCard('students')}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard('students')}
            onBlur={() => setHoveredCard(null)}
          >
            <GraduationCap className="h-5 w-5" aria-hidden />
            {t.ctaStudent}
          </Link>
          <Link
            href="/auth/sign-up?type=professional"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold w-full sm:w-auto min-h-[52px]',
              'bg-white/10 backdrop-blur-md border border-white/20 text-white',
              'hover:bg-white/15 hover:border-white/30 transition-all duration-200',
              'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
            )}
            onMouseEnter={() => setHoveredCard('universities')}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard('universities')}
            onBlur={() => setHoveredCard(null)}
          >
            <Briefcase className="h-5 w-5" aria-hidden />
            {t.ctaProfessional}
          </Link>
        </motion.div>

        <motion.p
          className="mt-8 text-sm text-white/60 text-center"
          initial={motionInitialButtons}
          animate={motionConfig}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
        >
          <Link href="/universities" className="hover:text-white/80 underline underline-offset-2">
            {t.forEducation}: {t.partnerWithUs} →
          </Link>
        </motion.p>
      </Container>
    </section>
  )
}
