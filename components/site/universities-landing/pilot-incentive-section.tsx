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
            'glass noise-overlay p-8 md:p-12 rounded-2xl',
            'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="pilot-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center tracking-tight mb-4"
          >
            {locale === 'en' ? (
              <>Join the 2026 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Student Wellbeing Pilot.</span></>
            ) : (
              <>Doe mee met de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Student Wellbeing Pilot</span> 2026.</>
            )}
          </h2>
          <p className="text-white/80 text-center max-w-2xl mx-auto mb-10">{t.pitch}</p>
          <ul className="space-y-4 max-w-xl mx-auto mb-10">
            {t.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check
                  className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5"
                  aria-hidden
                />
                <div>
                  <span className="font-semibold text-white">{benefit.label}:</span>{' '}
                  <span className="text-white/70">{benefit.detail}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-center mb-10">
            <Link
              href="#request-demo"
              aria-label={t.cta}
              className={cn(
                'inline-flex items-center justify-center rounded-xl px-8 py-4 min-h-[48px] text-base font-semibold',
                'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
                'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
                'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              )}
            >
              {t.cta}
            </Link>
          </div>
          <div className="pt-8 border-t border-white/10">
            <p className="text-xs text-white/50 text-center mb-4">{t.trustPrefix}</p>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {t.trustItems.map((item, i) => {
                const Icon = trustIcons[i]
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white/60 text-sm"
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
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
