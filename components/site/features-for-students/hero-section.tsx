'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, X, Check, Shield, Users } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function HeroSection() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale].hero
  const reducedMotion = useReducedMotion()

  const handleFindMatch = () => {
    router.push('/auth/sign-up')
  }

  const motionConfig = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
  const motionInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const motionInitialCards = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 32 }

  return (
    <Section
      id="hero"
      className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center text-white"
      aria-labelledby="hero-heading"
    >
      <Container className="relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Copy + CTAs */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white tracking-tight"
              initial={motionInitial}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease: 'easeOut' }}
            >
              {locale === 'en' ? (
                <>Don&apos;t let a bad <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">roommate</span> ruin your year.</>
              ) : (
                <>Laat een slechte <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">huisgenoot</span> je jaar niet verpesten.</>
              )}
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.1, ease: 'easeOut' }}
            >
              {t.subheadline}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            >
              <button
                onClick={handleFindMatch}
                aria-label={t.findMatch}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
                  'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                  'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                  'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                )}
              >
                {t.findMatch}
              </button>
              <Link
                href="/how-it-works"
                aria-label={t.howItWorks}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold',
                  'bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-200',
                  'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                )}
              >
                {t.howItWorks}
              </Link>
            </motion.div>
          </div>

          {/* Right: Split comparison visual - glass cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* The Old Way */}
            <motion.div
              className={cn(
                'glass noise-overlay p-6 flex flex-col transition-all duration-300',
                'hover:border-amber-500/40 hover:bg-amber-500/5'
              )}
              aria-label={t.oldWay}
              initial={motionInitialCards}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <X className="h-6 w-6 text-amber-400 flex-shrink-0" aria-hidden />
                <h2 className="text-lg font-bold text-amber-200">{t.oldWay}</h2>
              </div>
              <ul className="space-y-3 text-sm text-white/70 flex-1">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400/80" aria-hidden />
                  <span>Chaos, messy kitchen, stress</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400/80" aria-hidden />
                  <span>Random matches, no compatibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400/80" aria-hidden />
                  <span>Unverified strangers</span>
                </li>
              </ul>
            </motion.div>

            {/* The Domu Way */}
            <motion.div
              className={cn(
                'glass noise-overlay p-6 flex flex-col transition-all duration-300',
                'hover:border-white/30 hover:bg-white/15'
              )}
              aria-label={t.domuWay}
              initial={motionInitialCards}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-6 w-6 text-emerald-400 flex-shrink-0" aria-hidden />
                <h2 className="text-lg font-bold text-emerald-200">{t.domuWay}</h2>
              </div>
              <ul className="space-y-3 text-sm text-white/80 flex-1">
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-400" aria-hidden />
                  <span>Peace, studying, harmony</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-400" aria-hidden />
                  <span>Lifestyle-matched roommates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-400" aria-hidden />
                  <span>100% ID verified</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
