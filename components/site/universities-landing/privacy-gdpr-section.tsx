'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { Shield, Lock } from 'lucide-react'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function PrivacyGdprSection() {
  const { locale } = useApp()
  const t = content[locale].privacy
  const reducedMotion = useReducedMotion()

  return (
    <Section
      id="privacy"
      className="relative overflow-hidden bg-slate-950 py-16 md:py-24"
      aria-labelledby="privacy-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/15 via-transparent to-purple-950/15 pointer-events-none"
        aria-hidden
      />
      <Container className="relative z-10">
        <motion.div
          className={cn(
            'glass noise-overlay p-8 md:p-12 rounded-2xl',
            'flex flex-col md:flex-row md:items-start md:justify-between gap-8',
            'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
                <Shield className="h-6 w-6 text-indigo-400" aria-hidden />
              </div>
              <h2
                id="privacy-heading"
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              >
                {t.heading}
              </h2>
            </div>
            <ul className="space-y-3 text-white/70">
              {t.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Lock
                    className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 flex items-center justify-center md:justify-end">
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold',
                'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400'
              )}
            >
              <Lock className="h-4 w-4" aria-hidden />
              {t.badgeText}
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
