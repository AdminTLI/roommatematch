'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { useApp } from '@/app/providers'
import { content } from './content'
import { cn } from '@/lib/utils'

export function InvestmentSection() {
  const router = useRouter()
  const { locale } = useApp()
  const t = content[locale].investment

  const handleGetStarted = () => {
    router.push('/auth/sign-up')
  }

  return (
    <Section
      id="investment"
      className="relative overflow-hidden bg-slate-950 py-16 md:py-24"
      aria-labelledby="investment-heading"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-purple-950/20 pointer-events-none"
        aria-hidden
      />

      <Container className="relative z-10">
        <motion.div
          className={cn(
            'glass noise-overlay p-8 md:p-12 text-center',
            'transition-all duration-300 hover:border-white/30'
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30"
              aria-hidden
            >
              <Clock className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <h2
            id="investment-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
          >
            {t.heading}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.copy}
          </p>
          <button
            onClick={handleGetStarted}
            className={cn(
              'inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold',
              'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
              'shadow-lg shadow-indigo-500/50 hover:scale-105 transition-all duration-200',
              'focus-visible:outline focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
            )}
          >
            {locale === 'nl' ? 'Begin de quiz' : 'Start the quiz'}
          </button>
        </motion.div>
      </Container>
    </Section>
  )
}
