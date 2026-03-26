'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Check, Shield, Server, Lock } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const trustIcons = [Shield, Server, Lock]

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

export function PilotIncentiveSection() {
  const { locale } = useApp()
  const t = content[locale].pilot

  return (
    <Section
      id="pilot-incentive"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="pilot-heading"
    >
      <Container className="relative z-10">
        <motion.div
          className={cn(
            GLASS,
            'p-8 md:p-12 rounded-2xl',
            'transition-all duration-300 hover:bg-white/75'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="pilot-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 text-center tracking-tight mb-4"
          >
            {locale === 'en' ? (
              <>
                Join the 2026{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Student Wellbeing Pilot.
                </span>
              </>
            ) : (
              <>
                Doe mee met de{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Student Wellbeing Pilot
                </span>{' '}
                2026.
              </>
            )}
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-10">{t.pitch}</p>
          <ul className="space-y-4 max-w-xl mx-auto mb-10">
            {t.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check
                  className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5"
                  aria-hidden
                />
                <div>
                  <span className="font-semibold text-slate-800">{benefit.label}:</span>{' '}
                  <span className="text-slate-600">{benefit.detail}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-center mb-10">
            <Link
              href="#request-demo"
              aria-label={t.cta}
              className={cn(
                'inline-flex items-center justify-center rounded-2xl px-8 py-4 min-h-[48px] text-base font-semibold',
                'bg-slate-900 text-white hover:bg-slate-900/90',
                'shadow-[0_12px_30px_rgba(15,23,42,0.18)] hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
              )}
            >
              {t.cta}
            </Link>
          </div>
          <div className="pt-8 border-t border-white/60">
            <p className="text-xs text-slate-500 text-center mb-4">{t.trustPrefix}</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {t.trustItems.map((item, i) => {
                const Icon = trustIcons[i]
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-slate-600 text-sm"
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden />
                    )}
                    <span>
                      {item.name}
                      {item.description ? ` (${item.description})` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
