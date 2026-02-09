'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function OfferSection() {
  const { locale } = useApp()
  const t = content[locale].offer

  return (
    <Section
      id="offer"
      className="relative overflow-hidden py-16 md:py-24"
      aria-labelledby="offer-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/15 via-transparent to-purple-950/15 pointer-events-none"
        aria-hidden
      />
      <Container className="relative z-10">
        <motion.div
          className={cn(
            'glass noise-overlay p-8 md:p-12 rounded-2xl text-center',
            'transition-all duration-300 hover:border-white/30 hover:bg-white/15'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="offer-heading"
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4"
          >
            {t.heading}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">{t.copy}</p>
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
        </motion.div>
      </Container>
    </Section>
  )
}
