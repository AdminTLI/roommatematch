'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calculator, Euro, TrendingUp, Users } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const statIcons = [Euro, TrendingUp, Users]

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

export function SavingsCalculatorSection() {
  const { locale } = useApp()
  const t = content[locale].savingsCalculator

  return (
    <Section
      id="savings-calculator"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="savings-calculator-heading"
    >
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-indigo-50/80 border border-indigo-200/80 mb-6">
              <Calculator className="h-10 w-10 text-indigo-700" aria-hidden />
            </div>
            <h2
              id="savings-calculator-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-4"
            >
              {locale === 'en' ? (
                <>
                  What could{' '}
                  <span className="text-slate-800">
                    better housing
                  </span>{' '}
                  mean for your budget?
                </>
              ) : (
                <>
                  Wat zou{' '}
                  <span className="text-slate-800">
                    betere huisvesting
                  </span>{' '}
                  voor je budget kunnen betekenen?
                </>
              )}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">{t.subheading}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { value: t.stat1Value, label: t.stat1Label },
              { value: t.stat2Value, label: t.stat2Label },
              { value: t.stat3Value, label: t.stat3Label },
            ].map((stat, i) => {
              const Icon = statIcons[i]
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={cn(
                    GLASS,
                    'p-6 md:p-8 rounded-2xl text-center',
                    'transition-all duration-300 hover:bg-white/75'
                  )}
                >
                  <div className="mx-auto mb-3 p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 w-fit">
                    <Icon className="h-6 w-6 text-indigo-700" aria-hidden />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center">
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">{t.ctaSubtext}</p>
            <Link
              href="/pricing"
              aria-label={t.cta}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 min-h-[48px] text-base font-semibold',
                'bg-slate-900 text-white hover:bg-slate-900/90',
                'shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
              )}
            >
              {t.cta}
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
