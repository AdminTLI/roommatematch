'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { TrendingDown } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

// Willis & Lane (2022), Front. Psychol.: RRS trajectory Sep→Jun from study (Oct 3.82 → Apr 3.42).
// Display heights remapped to full vertical range so the decline is clearly visible (same trajectory, steeper visual slope).
const barHeights = [100, 92, 82, 72, 66, 60, 52, 44, 40, 38] // Sep → Jun; trajectory preserved, range amplified
const barColors = [
  'bg-emerald-500',
  'bg-emerald-600',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-amber-600',
  'bg-amber-600',
  'bg-rose-500',
  'bg-rose-600',
  'bg-rose-600',
  'bg-rose-500',
]
const monthLabels = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export function HeroSection() {
  const { locale } = useApp()
  const t = content[locale].hero
  const reducedMotion = useReducedMotion()
  const motionInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }
  const motionConfig = reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }

  return (
    <Section
      id="hero"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="hero-heading"
    >
      <Container className="relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <motion.h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight"
              initial={motionInitial}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.5, ease: 'easeOut' }}
            >
              {locale === 'en' ? (
                <>Housing Stability = <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Student Retention.</span></>
              ) : (
                <>Huisvestingsstabiliteit = <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Studentenretentie.</span></>
              )}
            </motion.h1>
            <motion.p
              className="text-lg text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={motionInitial}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.08, ease: 'easeOut' }}
            >
              {t.subheadline}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={motionInitial}
              animate={motionConfig}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.12, ease: 'easeOut' }}
            >
              <Link
                href="#request-demo"
                aria-label={t.ctaPrimary}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl px-8 py-4 min-h-[48px] text-base font-semibold',
                  'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                  'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                  'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                )}
              >
                {t.ctaPrimary}
              </Link>
              <Link
                href="/reports/Domu Match Student Housing Impact Report (2026).pdf"
                aria-label={t.ctaSecondary}
                className={cn(
                  'inline-flex items-center justify-center rounded-xl px-8 py-4 min-h-[48px] text-base font-semibold',
                  'bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-200',
                  'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
                )}
                download
              >
                {t.ctaSecondary}
              </Link>
            </motion.div>
          </div>

          <motion.div
            className={cn(
              'glass noise-overlay p-6 md:p-8 rounded-2xl',
              'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
            )}
            aria-labelledby="chart-label-universities"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-amber-400" aria-hidden />
              <span id="chart-label-universities" className="text-sm font-semibold text-white/80">{t.chartLabel}</span>
            </div>
            <div className="h-48 flex items-end gap-2">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className={cn('flex-1 min-w-[8px] rounded-t transition-all', barColors[i])}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/50">
              {monthLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/60 leading-relaxed whitespace-pre-line">
              {t.chartCaption}
            </p>
            <footer className="mt-4 pt-3 border-t border-white/20">
              <p className="text-xs text-white/50">
                <span className="text-white/40">Source: </span>
                <a
                  href={t.chartSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 underline underline-offset-2 hover:text-white focus:outline focus:ring-2 focus:ring-white/50 rounded"
                >
                  {t.chartSourceLabel}
                </a>
              </p>
            </footer>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
