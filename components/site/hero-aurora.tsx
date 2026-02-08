'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { User, Building2 } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

const content = {
  en: {
    headline: 'From strangers to roommates.',
    subtext: 'The first compatibility matching platform for students in The Netherlands. Try it for free today!',
    forStudents: 'For Students',
    studentsCopy: 'Find a roommate who matches your vibe, not just your budget.',
    findMyMatch: 'Find My Match',
    forEducation: 'For Education',
    educationCopy: 'Reduce dropouts with data-driven wellbeing insights.',
    partnerWithUs: 'Partner With Us',
  },
  nl: {
    headline: 'Huisvesting is meer dan een dak.',
    subtext: 'De eerste welzijnsgerichte huisvestingsinfrastructuur voor Nederland.',
    forStudents: 'Voor Studenten',
    studentsCopy: 'Vind een huisgenoot die bij je past, niet alleen je budget.',
    findMyMatch: 'Vind Mijn Match',
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
  const motionInitialCards = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32 }

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
          {t.headline}
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-white/80 text-center max-w-2xl mb-12 md:mb-16"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={motionConfig}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.1, ease: 'easeOut' }}
        >
          {t.subtext}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Students card */}
          <motion.div
            className={cn(
              'glass p-8 md:p-10 flex flex-col cursor-pointer transition-all duration-300',
              'hover:border-white/30 hover:bg-white/15'
            )}
            initial={motionInitialCards}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
            onMouseEnter={() => setHoveredCard('students')}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard('students')}
            onBlur={() => setHoveredCard(null)}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
              <User className="h-7 w-7 text-indigo-400" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">{t.forStudents}</h2>
            <p className="text-white/80 text-base md:text-lg mb-8 flex-1">{t.studentsCopy}</p>
            <Link
              href="/auth/sign-up"
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
                'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              {t.findMyMatch}
            </Link>
          </motion.div>

          {/* Universities card */}
          <motion.div
            className={cn(
              'glass p-8 md:p-10 flex flex-col cursor-pointer transition-all duration-300',
              'hover:border-white/30 hover:bg-white/15'
            )}
            initial={motionInitialCards}
            animate={motionConfig}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.3 }}
            onMouseEnter={() => setHoveredCard('universities')}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard('universities')}
            onBlur={() => setHoveredCard(null)}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 border border-blue-400/30">
              <Building2 className="h-7 w-7 text-blue-300" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">{t.forEducation}</h2>
            <p className="text-white/80 text-base md:text-lg mb-8 flex-1">{t.educationCopy}</p>
            <Link
              href="/universities"
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
                'bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              {t.partnerWithUs}
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
