'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

const GLASS =
  'bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl'

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
        className="absolute inset-0 bg-gradient-to-b from-indigo-300/20 via-transparent to-violet-300/15 pointer-events-none"
        aria-hidden
      />
      <Container className="relative z-10">
        <motion.div
          className={cn(
            GLASS,
            'p-8 md:p-12 rounded-2xl text-center',
            'transition-all duration-300 hover:bg-white/75'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="offer-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-4"
          >
            {t.heading}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">{t.copy}</p>
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
        </motion.div>
      </Container>
    </Section>
  )
}
